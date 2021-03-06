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
const linuxSerialUSBtty = nconf.get('alarm:dsc_it100:linuxSerialUSBtty');
const baudRate = nconf.get('alarm:dsc_it100:baudRate');

// Global Variables
var dscSerialPort;
var self;

/**
 * Class used to implement the access to DSC-IT100 board using RS232 Serial communication.
 */
class dsc_it100 extends EventEmitter {
    constructor() {
        super();
        self = this;
        this.init();
    }
    init() {
        let _dscSerial = new dscSerial();
        _dscSerial.init();
    }
    sendCommand(cmd){
        sendToSerial(cmd);
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
            log.info('[DSC_IT100] Serial port open');
        });
        dscSerialPort.on('close', function showPortClose() {
            log.error('[DSC_IT100] Serial Port closed ' + linuxSerialUSBtty);
            self.emit('close', '[DSC_IT100] Serial port closed.');
        });
        dscSerialPort.on('error', function showError(error) {
            log.error('[DSC_IT100] Serial port error: ' + error);
            self.emit('error', '[DSC_IT100] Serial port error: '+error);
        });
        const serialPortparser = dscSerialPort.pipe(new SerialReadline({ delimiter: '\r\n' }))
        serialPortparser.on('data', function receivedFromSerial(data) {
            parseReceivedData(data);
        });
    }
}

/**
 * Method used to parser all DSC-IT100 messages.
 * @param {Stream} data - Stream buffer received from DSC-IT100
 */
 function parseReceivedData(data) {
    let cmd = data.toString('ascii');
    if(cmd.length >= 3){
        log.debug('[DSC_IT100] Received Serial data: ' + data);
        event_emit(cmd);
    }
}

// Method used to send serial data
function sendToSerial(cmd) {
    log.debug('[DSC_IT100] Sending to serial port: ' + cmd);
    dscSerialPort.write(cmd);
}

/**
 * Emit an EventEmitter
 * It will send back the DSC-IT100 received messages to a upper Class
 * @param {command_map} data
 */
function event_emit(data) {
    self.emit('read', data);
}