const EventEmitter = require('events');
const SerialPort = require('serialport');
const SerialReadline = require('@serialport/parser-readline')
const Delimiter = require('@serialport/parser-delimiter')
const Ready = require('@serialport/parser-ready')
const log = require('../tools/logger');
const nconf = require('nconf');
nconf.file({ file: './config.json' });

// Constant with configuration settings
const linuxSerialUSBtty = nconf.get('dscalarm:linuxSerialUSBtty');;
const alarmPassword = nconf.get('dscalarm:alarmpassword');
const baudRate = nconf.get('dscalarm:baudRate');

// Global Variables
var dscSerialPort;
var emitter;
/**
 * Class used to implement the access to DSC-IT100 board using RS232 Serial communication.
 */
class dsc_it100 extends EventEmitter {
    constructor() {
        super();
        emitter = this;
        this.init();
    }
    init() {
        let _dscSerial = new dscSerial();
        _dscSerial.init();
    }
    alarmArm() {
        alarmArm();
    }
    alarmArmAway() {
        alarmArmAway();
    }
    alarmArmStay() {
        alarmArmStay();
    }
    alarmArmNight() {
        alarmArmNight();
    }
    alarmDisarm() {
        alarmDisarm();
    }
    alarmSendBreak() {
        alarmSendBreak();
    }
    alarmChimeToggle() {
        alarmChimeToggle();
    }
    alarmPanic() {
        alarmPanic();
    }
    alarmAmbulance() {
        alarmAmbulance();
    }
    alarmFire() {
        alarmFire();
    }
    descriptiveControl() {
        descriptiveControl();
    }
    alarmSendCode() {
        alarmSendCode();
    }
    alarmUpdate() {
        alarmUpdate();
    }
    alarmSetDate() {
        alarmSetDate();
    }
}
exports.dsc_it100 = dsc_it100

/**
 * Implement a Function to access Serial Port RS232 using USB cable converter
 */
var dscSerial = function () {
    this.init = function () {
        dscSerialPort = new SerialPort(linuxSerialUSBtty, {
            baudRate: baudRate
        });
        dscSerialPort.on('open', function showPortOpen() {
            portStatus = 1;
            log.info('SerialPort: Serial port open');
        });
        dscSerialPort.on('close', function showPortClose() {
            log.error('SerialPort: Serial Port closed: ' + linuxSerialUSBtty);
        });
        dscSerialPort.on('error', function showError(error) {
            log.error('SerialPort: Serial port error: ' + error);
        });
        const serialPortparser = dscSerialPort.pipe(new SerialReadline({ delimiter: '\r\n' }))
        serialPortparser.on('data', function receivedFromSerial(data) {
            parseReceivedData(data);
        });
    }
}

// Method used to send serial data
function sendToSerial(cmd) {
    log.debug('SerialPort: Sending to serial port: ' + cmd);
    cmd = appendChecksum(cmd);
    dscSerialPort.write(cmd);
}

/**
 * List of Functions used to send commands to DSC-IT100 Alarm board.
 */

// Send the Arm command to Alarm
function alarmArm() {
    let cmd = '0331' + alarmPassword + '00';
    sendToSerial(cmd);
}

// Send the ArmAway command to Alarm
function alarmArmAway() {
    let cmd = '0301';
    sendToSerial(cmd);
}

// Send the ArmStay command to Alarm
function alarmArmStay() {
    let cmd = '0311';
    sendToSerial(cmd);
}

// Send the ArmNight command to Alarm
function alarmArmNight() {
    let cmd = '0331' + alarmPassword + '00';
    sendToSerial(cmd);
}

// Send the Disarm command to Alarm
function alarmDisarm() {
    let cmd = '0401' + alarmPassword + '00';
    sendToSerial(cmd);

}

// Send the Break command to Alarm
function alarmSendBreak() {
    let cmd = '070^';
    sendToSerial(cmd);
}

// Send the Enable Chime command to Alarm
function alarmChimeToggle() {
    let cmd = '070c';
    sendToSerial(cmd);
    // wait for 1800 and call alarmSendBreak
    setTimeout(alarmSendBreak, 1800);
}

// Send the Activate Panic Siren
function alarmPanic() {
    let cmd = '0603';
    sendToSerial(cmd);
}

// Send the Activate Ambulance
function alarmAmbulance() {
    let cmd = '0602';
    sendToSerial(cmd);
}

// Send the Activate Fire Siren
function alarmFire() {
    let cmd = '0601';
    sendToSerial(cmd);
}

// Send the descriptiveControl to partition to enable verbose mode.
function descriptiveControl() {
    let cmd = '0501';
    sendToSerial(cmd);
}

// This command will send the code to the alarm when ever the alarm ask for it with a 900
function alarmSendCode() {
    let cmd = '2001' + alarmPassword + '00';
    sendToSerial(cmd);
}

// alarm Status Request
function alarmUpdate() {
    let cmd = '001';
    sendToSerial(cmd);
}

// Function used to set Alarm keypad Date and time
function alarmSetDate() {

    let date = new Date();
    let hour = date.getHours().toString();
    if (hour.length == 1) {
        hour = '0' + hour
    }
    let minute = date.getMinutes().toString();
    if (minute.length == 1) {
        minute = '0' + minute
    }
    let month = date.getMonth() + 1;
    let monthstr = month.toString();
    if (monthstr.length == 1) {
        monthstr = '0' + monthstr
    }
    let day = date.getDate().toString();
    if (day.length == 1) {
        day = '0' + day
    }
    let year = date.getFullYear().toString().substring(2, 4);
    let timedate = hour + minute + monthstr + day + year;
    let cmd = '010' + timedate;
    sendToSerial(cmd);
}

/**
 * Change the DSC-IT100 Serial Boud rate speed.
 * Note: Function not in use
 * @param {String} speed 
 */
function alarmSetBaudRate(speed) {
    // setup and send baud rate command
    // 0=9600, 1=19200, 2=38400, 3=57600, 4=115200

    let cmd = '080';
    if (speed == '9600') {
        cmd = cmd + '0';
    }
    else if (speed == '19200') {
        cmd = cmd + '1';
    }
    else if (speed == '38400') {
        cmd = cmd + '2';
    }
    else if (speed == '57600') {
        cmd = cmd + '3';
    }
    else if (speed == '115200') {
        cmd = cmd + '4';
    }
    else  // By default set to 9600 
    {
        cmd = cmd + '0';
    }
    sendToSerial(cmd);
}

/**
 * Method used to append the right checksum at the end of any command sent to DSC IT-100 Board
 * According with DSC IT-100 manual each command sent to the board must have a checksum
 * This method will calculate the checksum according to the command that need to be sent
 * Will return the data ready to be sent to DSC IT-100 Board 
 * Alarm Documentation - http://cms.dsc.com/download.php?t=1&id=16238
 * @param {String} data 
 * @returns - returns DSC-IT100 command with the appended calculated checksum.
 */
function appendChecksum(data) {
    let result = 0;
    let arrData = data.split('');
    arrData.forEach(function (entry) {
        let entryBuffer = new Buffer.from(entry, 'ascii');
        let entryRepHex = entryBuffer.toString('hex');
        let entryHex = parseInt(entryRepHex, 16);
        result = result + parseInt(entryHex, 10);
    });
    data = data + (parseInt(result, 10).toString(16).toUpperCase().slice(-2) + '\r\n');
    return data;
}

/**
 * Method used to parser all DSC-IT100 messages.
 * @param {Stream} data - Stream buffer received from DSC-IT100
 */
function parseReceivedData(data) {
    log.debug('SerialPort: Received Serial data: ' + data);
    let responseHandler;
    let cmdFullStr = data.toString('ascii');
    if (cmdFullStr.length >= 3) {
        let cmd = cmdFullStr.substr(0, 3);
        if (cmd == '500') {
            responseHandler = command_map[cmdFullStr]['handler'];
            responseHandler(cmd,cmdFullStr);            
        }
        else{
            responseHandler = command_map[cmd]['handler'];
            responseHandler(cmd,cmdFullStr);
        }
    }
}

/**
 * Emit an EventEmitter
 * It will send back a JSON from command_map with the system message from DSC-IT100.
 * @param {command_map} data
 */
function event_emit(data) {
    log.debug('DSC-IT100: Response message: ' + data);
    emitter.emit('read', data);
}

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
    event_emit(updatePartition);
}

function parseAcknowledgementArm(cmd,cmdFullStr) {
    let ack = command_map[cmdFullStr];
    event_emit(ack);
}

function parseZoneChange(cmd,cmdFullStr) {
    let zone = command_map[cmd];
    zone.zone = cmdFullStr.substr(3, 3);
    event_emit(zone);
}

function parseCodeRequired(cmd,cmdFullStr) {
    alarmSendCode()
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
    }
    event_emit(chime);    
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
    '50004029': {
        'name': 'Acknowledgement of Disarm command',
        'description': 'This code is the acknowledgement of the Disarm command.',
        'code': '50004029',
        'hsmStatus':'disarmed',
        'type': 'partition',
        'handler': parseAcknowledgementArm
    },
    '501': {
        'name': 'Invalid command',
        'description': 'Command has been received with a bad checksum.',
        'code': '501',
        'type': 'partition',
        'handler': parseGenericReceivedData
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
        'description': 'Access code is required.',
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
