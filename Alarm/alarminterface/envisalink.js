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
var self;

/**
 * Class used to implement the access to EnvisaLink board using TCP/IP socket.
 */
class envisalink extends EventEmitter {
    constructor() {
        super();
        self = this;
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
 * Implement a Function to access EnvisaLink TCP socket
 */
var envisalink_net = function () {
    this.init = function () {
        net_client = new net.Socket();
        net_client.connect(envisalink_port, envisalink_ip, function() {
            log.info('EnvisaLink: EnvisaLink Connected IP: '+envisalink_ip+' Port: '+envisalink_port);
        });
        // When connection disconnected.
        net_client.on('end',function () {
            log.error('EnvisaLink: EnvisaLink disconnected.');
            net_client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        // client.on('timeout', function () {
        //     console.log('Client connection timeout. ');
        // });
        net_client.on('error', function (err) {
            //console.error(JSON.stringify(err));
            log.error('EnvisaLink: EnvisaLink disconnected. Error Name: '+err.name+' Message: '+err.message);
            net_client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        net_client.on('data', function (data) {
            //log.silly('EnvisaLink: Received data : ' + data);
            //data.toString('utf8').split(/\r?\n/).forEach( function (item) {
            //    parseReceivedData(data);
            //});
            data.toString('ascii').split('\r\n').forEach( function (item) {
                //log.debug('EnvisaLink: Received socket data: '+item);
                parseReceivedData(item);
            });
        });
    }
}


/**
 * Method used to Emit all EnvisaLink messages.
 * @param {Stream} data - Stream buffer received from EnvisaLink
 */
 function parseReceivedData(data) {
    log.silly('EnvisaLink: RAW received data: ' + data);
    if(data.length >= 3){
        log.debug('EnvisaLink: Received data: ' + data);
        event_emit(data);
    }
}

// Method used to data to EnvisaLink
function sendTo_netClient(cmd) {
    log.debug('EnvisaLink: Sending data: ' + cmd);
    net_client.write(cmd);
}

/**
 * Emit an EventEmitter
 * It will send back the EnvisaLink received from a upper Class
 * @param {command_map} data
 */
function event_emit(data) {
    self.emit('read', data);
}