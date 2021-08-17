const EventEmitter = require('events');
const net = require('net');
const log = require('../tools/logger');
const nconf = require('nconf');
nconf.file({ file: './config/config.json' });

// Constant with configuration settings
const envisalink_ip = nconf.get('alarm:envisalink:ip');
const envisalink_port = nconf.get('alarm:envisalink:port');

// Global Variables
var net_client;
var emitter;

/**
 * Class used to implement the access to DSC-IT100 board using RS232 Serial communication.
 */
class envisalink extends EventEmitter {
    constructor() {
        super();
        emitter = this;
        this.init();
    }
    init() {
        let _envisalink = new envisalink_net();
        _envisalink.init();
    }
    sendCommand(cmd){
        sendTo_netClient(cmd);
    }
}
exports.envisalink = envisalink

/**
 * Implement a Function to access Serial Port RS232 using USB cable converter
 */
var envisalink_net = function () {
    this.init = function () {
        net_client = new net.Socket();
        if (net_client && net_client.writable) { return; }
        if (net_client) { net_client.destroy(); }
        net_client.connect(envisalink_port, envisalink_ip, function() {
            log.info('envislink: EnvisaLink Connected IP: '+envisalink_ip+' Port: '+envisalink_port);
        });
        // When connection disconnected.
        net_client.on('end',function () {
            console.log('envislink: socket disconnected.');
            client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        // client.on('timeout', function () {
        //     console.log('Client connection timeout. ');
        // });
        net_client.on('error', function (err) {
            //console.error(JSON.stringify(err));
            console.log('envislink: Error Name: '+err.name+' Message: '+err.message);
            net_client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        net_client.on('data', function (data) {
            log.info('envislink: Received data : ' + data);
            data.toString('utf8').split(/\r?\n/).forEach( function (item) {
                parseReceivedData(data);
            });
        });
    }
}


/**
 * Method used to parser all DSC-IT100 messages.
 * @param {Stream} data - Stream buffer received from DSC-IT100
 */
 function parseReceivedData(data) {
    log.debug('envislink: Received Serial data: ' + data);
    event_emit(data);
}

// Method used to send serial data
function sendTo_netClient(cmd) {
    log.debug('envislink: SendSocket: Sending to socket port: ' + cmd);
    net_client.write(cmd);
}

/**
 * Emit an EventEmitter
 * It will send back a JSON from command_map with the system message from DSC-IT100.
 * @param {command_map} data
 */
function event_emit(data) {
    log.debug('envislink: Response message: ' + JSON.stringify(data));
    emitter.emit('read', data);
}