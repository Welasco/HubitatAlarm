const EventEmitter = require('events');
const net = require('net');
const log = require('../tools/logger');
const nconf = require('nconf');
nconf.file({ file: './config/config.json' });

// Constant with configuration settings
const envisalink_ip = nconf.get('alarm:envisalink:ip');
const envisalink_port = nconf.get('alarm:envisalink:port');

// Global Variables
var self;

/**
 * Class used to implement the EnvisaLink board access using TCP/IP socket.
 */
class envisalink extends EventEmitter {
    constructor() {
        super();
        self = this;
        this.init();
    }
    init() {
        this.net_client = new net.Socket();
        this.net_client.connect(envisalink_port, envisalink_ip, function() {
            log.info('[EnvisaLink] Connected IP: '+envisalink_ip+' Port: '+envisalink_port);
        });
        // When connection disconnected.
        this.net_client.on('end',function () {
            log.error('[EnvisaLink] disconnected.');
            self.net_client.destroy();
            // Wait 4 seconds and reconnect
            setTimeout(function() { self.init() }, 4000);
        });
        // this.net_client.on('timeout', function () {
        //     log.info('Client connection timeout. ');
        // });
        this.net_client.on('error', function (err) {
            if(envisalink_ip == '127.0.0.1'){
                log.info('[EnvisaLink] Waiting for Hubitat initial setup...');
                log.silly('[EnvisaLink] Trying to connect to 127.0.0.1. This is the default config IP. You must go to Hubitat to finish the setup and have this ip updated to real Envisalink IP.');
            }
            else{
                log.error('[EnvisaLink] disconnected. Error Name: '+err.name+' Message: '+err.message);
            }
            self.net_client.destroy();
            // Wait 4 seconds and reconnect
            setTimeout(function() { self.init() }, 4000);
        });
        this.net_client.on('data', function (data) {
            log.debug('[EnvisaLink] RAW received data: ' + data);
            self.emit('read',data);
        });
    }
    sendCommand(cmd){
        log.debug('[EnvisaLink] Sending '+cmd.trim()+' to IP: '+envisalink_ip+' Port: ' + envisalink_port);
        self.net_client.write(cmd);
    }
}
exports.envisalink = envisalink