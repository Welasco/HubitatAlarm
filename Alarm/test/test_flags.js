function getLedFlag(flag) {
    var flags = {};
    var flagInt = parseInt(flag, 16);
    console.log('flagInt: '+flagInt);
    for (var key in LED_FLAGS) {
        //console.log('Key: '+key);
        flags[key] = Boolean(LED_FLAGS[key] & flagInt);
    }
    return flags;
}

var LED_FLAGS = {
    "alarm": 1,
    "alarm_in_memory": 2,
    "armed_away": 4,
    "ac_present": 8,
    "bypass": 16,
    "chime": 32,
    "not_used1": 64,
    "armed_zero_entry_delay": 128,
    "alarm_fire_zone": 256,
    "system_trouble": 512,
    "not_used2": 1024,
    "not_used3": 2048,
    "ready": 4096,
    "fire": 8192,
    "low_battery": 16384,
    "armed_stay": 32768
};

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

// console.log(getLedFlag('1C08'));
// console.log(getLedFlag('5C08'));
// console.log(getLedFlag('8008'));

console.log(getDscCode(getLedFlag('8008')));