const log = require('../tools/logger');

class honeywell_eventParser {
    constructor() {
    }
    GetCode(cmd,data) {
        let responseHandler = command_map[cmd]['handler'];
        return responseHandler(cmd,data);
    }
}
exports.honeywell_eventParser = honeywell_eventParser

/**
 * Honeywell event handlers
 * @parseEnvisalinkLogin - parse Envisalink Login
 * @ignoreEvent - Ignore irrelevant messages from Honeywell
 * @keypad_update - parse Honeywell events.
 * @zone_timer_dump - Envisalink Zone Timer Dump. This command contains the raw zone timers used inside the Envisalink. The dump is a 256 character packed HEX string representing 64 UINT16 (little endian) zone timers
 *
 * @param {String} cmd - Envisalink/Honeywell event
*/
function parseEnvisalinkLogin(cmd) {
    let login = command_map[cmd];
    return login;
}

function ignoreEvent(params) {
    // Irrelevant events
}

var panel = {alpha: '', timer: [], partition: 1, zones: []};
function keypad_update(code,data) {
    var map = data.split(',');
    if (map.length != 5 || data.indexOf('%') != -1) {
        log.error("[Honeywell-EventParser] Error: ignoring invalid data format from Envisalink: " + data);
        return;
    }

    var msg = {};
    msg.partitionNumber = parseInt(map[0]);
    msg.flags = getLedFlag(map[1]);
    msg.userOrZone = parseInt(map[2]);
    msg.beep = VIRTUAL_KEYPAD_BEEP[map[3]];
    msg.alpha = map[4].trim();
    msg.dscCode = getDscCode(msg.flags);

    //////////
    // ZONE UPDATE
    //////////

    // all zones are closed
    if (msg.dscCode == 'READY') {
        panel.timer = [];
        for (var n in panel.zones) {
            if (panel.zones[n] != 'closed') {
                // notify
                return updateZone(msg.partitionNumber, n, 'closed');
            }
        }
    }

    // one or more zones are open
    if (msg.dscCode == '' && !isNaN(msg.userOrZone)) {
        if (panel.zones[msg.userOrZone] != 'open') {
            // reset timer when new zone added
            panel.timer[msg.userOrZone] = 0;
            for (var n in panel.timer) {
                panel.timer[n] = 0;
            }

            // notify
            return updateZone(msg.partitionNumber, msg.userOrZone, 'open');
        } else {
            panel.timer[msg.userOrZone]++;

            // experimental: close all zones that have not updated after three ticks
            if (panel.timer[msg.userOrZone] == 2) {
                for (var n in panel.timer) {
                    if (panel.timer[n] == 0) {
                        // close orphaned zone
                        delete panel.timer[n];

                        // notify
                        return updateZone(msg.partitionNumber, n, 'closed');
                    } else {
                        // reset timer
                        panel.timer[n] = 0;
                    }
                }
            }
        }
    }

    // zone in alarm
    if (msg.dscCode == 'IN_ALARM' && !isNaN(msg.userOrZone)) {
        if (panel.zones[msg.userOrZone] != 'alarm') {
            // notify
            return updateZone(msg.partitionNumber, msg.userOrZone, 'alarm');
        }
    }

    //////////
    // PARTITION UPDATE
    //////////
    if (panel.alpha != msg.alpha) {
        //notify
        return updatePartition(msg.partitionNumber, getPartitionState(msg.flags, msg.alpha), msg.alpha);
    }
}

function zone_timer_dump(data) {
    var queue = [];

    // Swap the couples of every four bytes (little endian to big endian)
    for (var i = 0; i < data.length; i += 4) {
        var zoneTimer = data[i + 2] + data[i + 3] + data[i] + data[i + 1];

        var msg = {};
        msg.zoneNumber = (i / 4) + 1;
        msg.zoneTimer = (parseInt('FFFF', 16) - parseInt(zoneTimer, 16)) * 5;

        // zone timer over 30 secs will be considered closed
        msg.zoneStatus = (msg.zoneTimer < 30) ? 'open' : 'closed';

        // use zone timer dump as backup to check for orphaned zones
        if (msg.zoneStatus == 'closed' &&
            panel.zones[msg.zoneNumber] != 'closed') {
            // notify
            queue.push({
                partition: panel.partition,
                zoneNumber: msg.zoneNumber,
                state: 'closed'
            });
        }
    }

    updateThrottler(queue);
}

/**
 * Helper Functions
 */

var return_json = {
    'name': '',
    'description': '',
    'code': '',
    'zone': '',
    'state': '',
    'type': '',
    'partition': ''
}

function updateZone(partitionNumber, zoneNumber, state) {
    panel.zones[zoneNumber] = state;

    return_json.type = 'zone';
    return_json.partition = partitionNumber;
    return_json.zone = (zoneNumber.toString().length == 1) ? '00'+zoneNumber.toString() : (zoneNumber.toString().length == 2)? '0'+zoneNumber.toString(): zoneNumber.toString();
    return_json.state = state;
    return_json.name = 'Zone Update';
    return_json.description = 'Event used for Zone update open/closed';
    return_json.partition = '';
    log.info('[Honeywell-EventParser] Zone Event: '+JSON.stringify(return_json));
    return return_json;
}

function updatePartition(partitionNumber, state, alpha) {
    panel.alpha = alpha;

    var msg = JSON.stringify({ type: 'partition', partition: partitionNumber, state: state, alpha: alpha });
    return_json.type = 'partition';
    return_json.partition = partitionNumber;
    return_json.zone = '';
    return_json.state = state;
    return_json.name = 'Panel Update';
    return_json.description = alpha;
    return_json.code = '';
    log.info('[Honeywell-EventParser] Panel Event: '+JSON.stringify(return_json));
    return return_json;
}

function updateThrottler(queue) {
    var i = 0;
    while (queue.length) {
        var x = queue.pop();

        // notify
        return updateZone(x.partition, x.zoneNumber, x.state);
        i++; if (i == 50) { break; }
    }

    if (!queue.length) { return; }

    setTimeout(function () { updateThrottler(queue) }, 5000);
}

function getLedFlag(flag) {
    var flags = {};
    var flagInt = parseInt(flag, 16);
    for (var key in LED_FLAGS) {
        flags[key] = Boolean(LED_FLAGS[key] & flagInt);
    }
    return flags;
}

function getDscCode(flags) {
    var dscCode = '';
    if (flags.alarm || flags.alarm_fire_zone || flags.fire) { dscCode = 'IN_ALARM'; }
    else if (flags.system_trouble) { dscCode = 'NOT_READY'; }
    else if (flags.ready) { dscCode = 'READY'; }
    else if (flags.bypass) { dscCode = 'READY_BYPASS'; }
    else if (flags.armed_stay) { dscCode = 'ARMED_STAY'; }
    else if (flags.armed_away) { dscCode = 'ARMED_AWAY'; }
    else if (flags.armed_zero_entry_delay) { dscCode = 'ARMED_MAX'; }
    else if (flags.not_used2 && flags.not_used3) { dscCode = 'NOT_READY'; } // added to handle 'Hit * for faults'
    return dscCode;
}

function getPartitionState(flags, alpha) {
    if (flags.alarm || flags.alarm_fire_zone || flags.fire) { return 'alarm'; }
    else if (flags.alarm_in_memory) { return 'alarmcleared'; }
    else if (alpha.indexOf('You may exit now') > 0) { return 'arming'; }
    else if (flags.armed_stay && flags.armed_zero_entry_delay) { return 'armedinstant'; }
    else if (flags.armed_away && flags.armed_zero_entry_delay) { return 'armedmax'; }
    else if (flags.armed_stay) { return 'armedstay'; }
    else if (flags.armed_away) { return 'armedaway'; }
    else if (flags.ready) { return 'ready'; }
    else if (!flags.ready) { return 'notready'; }
    return 'unknown';
}



/**
 * Map object to all DSC-IT100 codes.
 * It's also used by @parseReceivedData to map the function handler for each command.
 */
var command_map = {
    'Login:': {
        'name': 'Login Prompt',
        'code': 'Login:',
        'type': 'partition',
        'description': 'Login Prompt, Sent During Session Login Only.',
        'handler': parseEnvisalinkLogin
    },
    'OK': {
        'name': 'Login Success',
        'code': 'OK',
        'type': 'partition',
        'description': 'Login Success, Send During Session Login Only, successful login',
        'handler': parseEnvisalinkLogin
    },
    'FAILED': {
        'name': 'Login Failure',
        'code': 'FAILED',
        'type': 'partition',
        'description': 'Login Failure, Sent During Session Login Only, password not accepted',
        'handler': parseEnvisalinkLogin
    },
    'Timed Out!': {
        'name': 'Login Interaction Timed Out',
        'code': 'Timed Out!',
        'type': 'partition',
        'description': 'Timed Out!, Sent during Session Login Only, socket connection is then closed',
        'handler': parseEnvisalinkLogin
    },
    '%00': {
        'name': 'Virtual Keypad Update',
        'code': '%00',
        'type': 'partition',
        'description': 'Virtual Keypad Update, The panel wants to update the state of the keypad',
        'handler': keypad_update
    },
    '%01': {
        'name': 'Zone State Change',
        'code': '%01',
        'type': 'zone',
        'description': 'Zone State Change, A zone change-of-state has occurred',
        'handler': ignoreEvent
    },
    '%02': {
        'name': 'Partition State Change',
        'code': '%02',
        'type': 'partition',
        'description': 'Partition State Change, A partition change-of-state has occured',
        'handler': ignoreEvent
    },
    '%03': {
        'name': 'Realtime CID Event',
        'code': '%03',
        'type': 'partition',
        'description': 'Realtime CID Event, A system event has happened that is signaled to either the Envisalerts servers or the central monitoring station',
        'handler': ignoreEvent
    },
    '%FF': {
        'name': 'Envisalink Zone Timer Dump',
        'code': '%FF',
        'type': 'partition',
        'description': 'Envisalink Zone Timer Dump, This command contains the raw zone timers used inside the Envisalink. The dump is a 256 character packed HEX string representing 64 UINT16 (little endian) zone timers. Zone timers count down from 0xFFFF (zone is open) to 0x0000 (zone is closed too long ago to remember). Each tick of the zone time is actually 5 seconds so a zone timer of 0xFFFE means 5 seconds ago. Remember, the zone timers are LITTLE ENDIAN so the above example would be transmitted as FEFF.',
        'handler': zone_timer_dump
    },
    '^00': {
        'name': 'Poll',
        'code': '^00',
        'type': 'partition',
        'description': 'Poll, Envisalink poll',
        'handler': ignoreEvent
    },
    '^01': {
        'name': 'Change Default Partition',
        'code': '^01',
        'type': 'partition',
        'description': 'Change Default Partition, Change the partition which keystrokes are sent to when using the virtual keypad.',
        'handler': ignoreEvent
    },
    '^02': {
        'name': 'Dump Zone Timers',
        'code': '^02',
        'type': 'partition',
        'description': 'Dump Zone Timers, This command contains the raw zone timers used inside the Envisalink. The dump is a 256 character packed HEX string representing 64 UINT16 (little endian) zone timers. Zone timers count down from 0xFFFF (zone is open) to 0x0000 (zone is closed too long ago to remember). Each tick of the zone time is actually 5 seconds so a zone timer of 0xFFFE means 5 seconds ago. Remember, the zone timers are LITTLE ENDIAN so the above example would be transmitted as FEFF.',
        'handler': ignoreEvent
    },
    '^03': {
        'name': 'Keypress to Specific Partition',
        'code': '^03',
        'type': 'partition',
        'description': 'Keypress to Specific Partition, This will send a keystroke to the panel from an arbitrary partition. Use this if you dont want to change the TPI default partition.',
        'handler': ignoreEvent
    },
    '^0C': {
        'name': 'Response for Invalid Command',
        'code': '^0C',
        'type': 'partition',
        'description': 'Response for Invalid Command, This response is returned when an invalid command number is passed to Envisalink',
        'handler': ignoreEvent
    }
};

var VIRTUAL_KEYPAD_BEEP = {
    '00' : 'off',
    '01' : 'beep 1 time',
    '02' : 'beep 2 times',
    '03' : 'beep 3 times',
    '04' : 'continous fast beep',
    '05' : 'continuous slow beep'
  };

var LED_FLAGS = {
    "alarm" : 1,
    "alarm_in_memory" : 2,
    "armed_away" : 4,
    "ac_present" : 8,
    "bypass" : 16,
    "chime" : 32,
    "not_used1" : 64,
    "armed_zero_entry_delay" : 128,
    "alarm_fire_zone" : 256,
    "system_trouble" : 512,
    "not_used2" : 1024,
    "not_used3" : 2048,
    "ready" : 4096,
    "fire" : 8192,
    "low_battery" : 16384,
    "armed_stay" : 32768
  };