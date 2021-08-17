class dsc_eventParser {
    constructor() {
    }
    GetCode(cmd,cmdFullStr) {
        let responseHandler = command_map[cmd]['handler'];
        return responseHandler(cmd,cmdFullStr);
    }
}
exports.dsc_eventParser = dsc_eventParser

/**
 * Parse received messages from DSC-IT100
 * @parseGenericReceivedData - parse all system messages to update Hubitat Alarm panel.
 * @parseAcknowledgementArm - parse special ack 500 codes for armedHome, armedNight, armedAway, disarmed.
 * @parseZoneChange - parse zones update Open and Close.
 * @parseCodeRequired - parse when DSC-IT100 requires to enter the code.
 * @parseChimeToggle - parse Chime ON/OFF
 *
 * @param {String} cmd - The received DSC-IT100 command. Only the first 3 numbers.
 * @param {String} cmdFullStr - The entire code number from DSC-IT100.
*/
function parseGenericReceivedData(cmd,cmdFullStr) {
    let updatePartition = command_map[cmd];
    return updatePartition;
}

function parseAcknowledgementArm(cmd,cmdFullStr) {
    let ack = command_map[cmdFullStr];
    return ack;
}

function parseEnvisalinkLogin(cmd,cmdFullStr) {
    let login = command_map[cmd];
    login.login_command = cmdFullStr.substr(0, 4);
    return login;
}

function parseZoneChange(cmd,cmdFullStr) {
    let zone = command_map[cmd];
    zone.zone = cmdFullStr.substr(3, 3);
    return zone;
}

function parseCodeRequired(cmd,cmdFullStr) {
    let alarmCodeRequired = command_map[cmd];
    return alarmCodeRequired;
    //alarmSendCode()
}

function parseChimeToggle(cmd,cmdFullStr) {
    let chime = command_map[cmd];
    if (cmdFullStr.indexOf('Door Chime') >= 0) {
        if (cmdFullStr.indexOf('ON') >= 0) {
            chime.status = 'ON';
        }
        else {
            chime.status = 'OFF';
        }
        return chime;
    }
}

/**
 * Map object to all DSC-IT100 codes.
 * It's also used by @parseReceivedData to map the function handler for each command.
 */
var command_map = {
    '500': {
        'name': 'Acknowledgement of the previous command',
        'description': 'This code will be received for every command send to DSC-IT100 board. It will always acknowledge the the previous received command.',
        'code': '50003129',
        'type': 'partition',
        'handler': parseAcknowledgementArm
    },
    '50003129': {
        'name': 'Acknowledgement of ArmStay command',
        'description': 'This code is the acknowledgement of the ArmStay command.',
        'code': '50003129',
        'hsmStatus':'armedHome',
        'type': 'partition',
        'handler': parseAcknowledgementArm
    },
    '5000332B': {
        'name': 'Acknowledgement of ArmNight command',
        'description': 'This code is the acknowledgement of the ArmNight command.',
        'code': '5000332B',
        'hsmStatus':'armedNight',
        'type': 'partition',
        'handler': parseAcknowledgementArm
    },
    '50003028': {
        'name': 'Acknowledgement of ArmAway command',
        'description': 'This code is the acknowledgement of the ArmAway command.',
        'code': '50003028',
        'hsmStatus':'armedAway',
        'type': 'partition',
        'handler': parseAcknowledgementArm
    },
    // Commented it's redundant to 655 command.
    // '50004029': {
    //     'name': 'Acknowledgement of Disarm command',
    //     'description': 'This code is the acknowledgement of the Disarm command.',
    //     'code': '50004029',
    //     'hsmStatus':'disarmed',
    //     'type': 'partition',
    //     'handler': parseAcknowledgementArm
    // },
    '501': {
        'name': 'Invalid command',
        'description': 'Command has been received with a bad checksum.',
        'code': '501',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '505': {
        'name': 'Login Interaction',
        'description': 'Envisalink Login interaction. 0 = Fail 1 = Successful 2 = Timed_Out 3 = Password Request',
        'code': '505',
        'login_command': '',
        'type': 'partition',
        'handler': parseEnvisalinkLogin
    },
    '609': {
        'name': 'Zone open',
        'description': 'Zone opened.',
        'code': '609',
        'zone': '',
        'status': 'Open',
        'type': 'zone',
        'handler': parseZoneChange
    },
    '610': {
        'name': 'Zone close',
        'description': 'Zone closed.',
        'code': '610',
        'zone': '',
        'status': 'Close',
        'type': 'zone',
        'handler': parseZoneChange
    },
    '621': {
        'name': 'Fire Key',
        'description': 'Fire key activated',
        'code': '621',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '622': {
        'name': 'Fire Key restored',
        'description': 'Fire key restored',
        'code': '622',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '650': {
        'name': 'Partition Ready',
        'description': 'Partition is ready.',
        'code': '650',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '651': {
        'name': 'Partition not Ready',
        'description': 'Partition is not ready.',
        'code': '651',
        'type': 'partition',
        'handler': parseGenericReceivedData,
    },
    '652': {
        'name': 'Partition Armed',
        'description': 'Partition is Armed.',
        'code': '652',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '654': {
        'name': 'Partition in Alarm',
        'description': 'Partition present in the alarm',
        'code': '654',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '655': {
        'name': 'Partition disarmed',
        'description': 'Partition is disarmed.',
        'code': '655',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '656': {
        'name': 'Partition Arming',
        'description': 'Delay in progress. The partition is Arming.',
        'code': '656',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '658': {
        'name': 'Partition locked',
        'description': 'Partition locked due to too many failed user code attempts.',
        'code': '658',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '659': {
        'name': 'Blanking',
        'description': 'Blanking has occurred on a partition.',
        'code': '659',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '670': {
        'name': 'Invalid code',
        'description': 'Invalid code entered.',
        'code': '670',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '672': {
        'name': 'Failt to Arm',
        'description': 'Partition failed to Arm.',
        'code': '672',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '673': {
        'name': 'Partition Busy',
        'description': 'Partition Busy.',
        'code': '673',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '700': {
        'name': 'User Closing',
        'description': 'Partition has been armed by user at the end of exit delay.',
        'code': '700',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '750': {
        'name': 'User Opening',
        'description': 'Parition disamred by a user.',
        'code': '750',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '800': {
        'name': 'Low battery',
        'description': 'Panel has a low battery.',
        'code': '800',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '801': {
        'name': 'Low battery restored',
        'description': 'Panel low battery has been restored.',
        'code': '801',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '802': {
        'name': 'Lost Power',
        'description': 'AC power to the panel has been removed.',
        'code': '802',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '803': {
        'name': 'Restored Power',
        'description': 'AC power to the panel has been restored.',
        'code': '803',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '806': {
        'name': 'Bell Trouble',
        'description': 'Bell not detected. A open circuit has been detected across the bell terminals.',
        'code': '806',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '807': {
        'name': 'Bell Trouble Restore',
        'description': 'Bell has been restored.',
        'code': '807',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '810': {
        'name': 'Phone Trouble',
        'description': 'Phone line is a open or shorted condition.',
        'code': '810',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '811': {
        'name': 'Phone Restored',
        'description': 'Phone condition has been restored.',
        'code': '811',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '812': {
        'name': 'Phone Trouble',
        'description': 'Phone line is a open or shorted condition.',
        'code': '810',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '813': {
        'name': 'Phone Restored',
        'description': 'Phone condition has been restored.',
        'code': '811',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '821': {
        'name': 'Device Low Battery',
        'description': 'Wireless zone has a low battery.',
        'code': '821',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '822': {
        'name': 'Device Low Battery restored',
        'description': 'Wireless zone low battery restored.',
        'code': '822',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '829': {
        'name': 'System Tamper',
        'description': 'Tamper has occurred on an alarm system module.',
        'code': '829',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '830': {
        'name': 'System Tamper restored',
        'description': 'System tamper restored.',
        'code': '830',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '840': {
        'name': 'General Trouble Present',
        'description': 'Indicate when there is a generic trouble in the system.',
        'code': '840',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '841': {
        'name': 'General Trouble restored',
        'description': 'General Trouble restored.',
        'code': '841',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '842': {
        'name': 'Fire Trouble',
        'description': 'Fire Trouble.',
        'code': '842',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '843': {
        'name': 'Fire Trouble restored',
        'description': 'Fire Trouble restored.',
        'code': '843',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '896': {
        'name': 'Keybus fault',
        'description': 'Alarm System Status Keybus fault.',
        'code': '896',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '897': {
        'name': 'Keybus restored',
        'description': 'Alarm System Status Keybus restored.',
        'code': '897',
        'type': 'partition',
        'handler': parseGenericReceivedData
    },
    '900': {
        'name': 'Code required',
        'description': 'Access code is required. Ex: \'2001\' + alarmPassword + \'00\'',
        'code': '900',
        'type': 'partition',
        'handler': parseCodeRequired
    },
    '901': {
        'name': 'Chime',
        'description': 'Indicate when Chime is ON or OFF.',
        'code': '901',
        'status': '',
        'type': 'partition',
        'handler': parseChimeToggle
    }
};
