const EventEmitter = require('events');
const net = require('net');
//const log = require('../tools///logger');
const nconf = require('nconf');
nconf.file({ file: './config/config.json' });

// Constant with configuration settings
const envisalink_ip = '127.0.0.1';
const envisalink_port = '3001';

// Global Variables
var net_client;
var emitter;
var self;

/**
 * Class used to implement the access to DSC-IT100 board using RS232 Serial communication.
 */
class envisalink extends EventEmitter {
    constructor() {
        super();
        emitter = this;
        self = this;
        this.init();
    }
    init() {
        console.log('envisalink_test init()');
        let _envisalink = new envisalink_net();
        _envisalink.init();
    }
    sendCommand(cmd){
        sendTo_netClient(cmd);
    }
    test(cmd){
        console.log('Received cmd: '+cmd);
    }
    testfun(cmd){
        return function(cmd){console.log('test fun received: '+cmd);}
    }
}
exports.envisalink = envisalink

/**
 * Implement a Function to access Serial Port RS232 using USB cable converter
 */
var envisalink_net = function () {
    this.init = function () {
        console.log(envisalink_ip+':'+envisalink_port);
        net_client = new net.Socket();
        //if (net_client && net_client.writable) { console.log('retornou');return; }
        //if (net_client) { net_client.destroy(); }

        net_client.connect(envisalink_port, envisalink_ip, function() {
            //log.info('envislink: EnvisaLink Connected IP: '+envisalink_ip+' Port: '+envisalink_port);
        });
        // When connection disconnected.
        net_client.on('end',function () {
            //log.error('envislink: socket disconnected.');
            client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        // client.on('timeout', function () {
        //     console.//log('Client connection timeout. ');
        // });
        net_client.on('error', function (err) {
            //console.error(JSON.stringify(err));
            //log.error('envislink: Error Name: '+err.name+' Message: '+err.message);
            net_client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        net_client.on('data', function (data) {
            ////log.silly('envislink: Received data : ' + data);
            //data.toString('utf8').split(/\r?\n/).forEach( function (item) {
            //    parseReceivedData(data);
            //});
            data.toString('ascii').split('\r\n').forEach( function (item) {
               parseReceivedData(item);
            });
            //parseReceivedData(data.toString('ascii'));
        });
    }
}


/**
 * Method used to parser all DSC-IT100 messages.
 * @param {Stream} data - Stream buffer received from DSC-IT100
 */
 function parseReceivedData(data) {
    //log.silly('envislink: Received data: ' + data);
    event_emit(data);
}

// Method used to send serial data
function sendTo_netClient(cmd) {
    //log.silly('envislink: Send data: ' + cmd);
    net_client.write(cmd);
}

/**
 * Emit an EventEmitter
 * It will send back a JSON from command_map with the system message from DSC-IT100.
 * @param {command_map} data
 */
function event_emit(data) {
    emitter.emit('read', data);
}