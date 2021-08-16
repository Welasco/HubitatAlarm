const EventEmitter = require('events');
const SerialPort = require('serialport');
const SerialReadline = require('@serialport/parser-readline')
const Delimiter = require('@serialport/parser-delimiter')
const Ready = require('@serialport/parser-ready')
const log = require('../tools/logger');
const nconf = require('nconf');
const alarmEventParser = require('./dsc_eventParser').dsc_eventParser;
let _alarmEventParser = new alarmEventParser();
nconf.file({ file: './config/config.json' });

// Constant with configuration settings
const linuxSerialUSBtty = nconf.get('alarm:linuxSerialUSBtty');;
const alarmPassword = nconf.get('alarm:alarmpassword');
const baudRate = nconf.get('alarm:baudRate');

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
            emitter.emit('close', 'SerialPort: Serial port closed.');
        });
        dscSerialPort.on('error', function showError(error) {
            log.error('SerialPort: Serial port error: ' + error);
            emitter.emit('error', 'SerialPort: Serial port error: '+error);
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
    let alarmEvent;
    let cmdFullStr = data.toString('ascii');
    if (cmdFullStr.length >= 3) {
        let cmd = cmdFullStr.substr(0, 3);
        try {
            if (cmd == '500') {
                alarmEvent = _alarmEventParser[cmdFullStr];
                event_emit(alarmEvent);
            }
            else if(cmd == '900'){
                // alarm code required. Don't need to generate an event.
                alarmSendCode();
            }
            else {
                alarmEvent = _alarmEventParser[cmd];
                event_emit(alarmEvent);
            }
        } catch (error) {
            log.silly('parseReceivedData: Handler not found for the received command: '+cmd);
        }
    }
}

/**
 * Emit an EventEmitter
 * It will send back a JSON from command_map with the system message from DSC-IT100.
 * @param {command_map} data
 */
function event_emit(data) {
    log.debug('DSC-IT100: Response message: ' + JSON.stringify(data));
    emitter.emit('read', data);
}