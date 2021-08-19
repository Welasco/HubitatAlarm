const EventEmitter = require('events');
const log = require('../tools/logger');
const nconf = require('nconf');
const envisalink = require('./envisalink').envisalink;
const alarmEventParser = require('./dsc_eventParser').dsc_eventParser;
let _alarmEventParser = new alarmEventParser();
nconf.file({ file: './config/config.json' });

// Global Variables
var self;

/**
 * Class used to implement the access to DSC-IT100 board using RS232 Serial communication.
 */
class dsc_envisalink extends EventEmitter {
    constructor() {
        super();
        self = this;
        this.init();
    }
    init() {
        this.envisalink_client = new envisalink();
        this.envisalink_client.on('read',function (data) {
            //log.debug('dsc_envisalink: received data from envisalink: '+ data);
            self.#parseReceivedData(data);
        });
    }
    sendCommand(cmd){
        this.#sendTo_envisalink_client(cmd);
    }
    #parseReceivedData(data){
        let alarmEvent;
        let cmdFullStr = data;
        if (cmdFullStr.length >= 3) {
            let cmd = cmdFullStr.toString().substr(0, 3);
            //log.debug('dsc_envisalink: #parseReceivedData cmd: '+ cmd + ' cmdFullStr: '+cmdFullStr);
            try {
                alarmEvent = _alarmEventParser.GetCode(cmd,cmdFullStr);
                if (typeof alarmEvent !== 'undefined'){
                    //console.log('Console msg: '+JSON.stringify(alarmEvent));
                    //self.#event_emit(alarmEvent);
                    self.emit('read',alarmEvent);
                }
            } catch (error) {
                log.error('dsc_envislink: parseReceivedData: Alarm received command not mapped: '+cmd +' Error: '+JSON.stringify(error));
            }
        }
    }
    #sendTo_envisalink_client(cmd){
        log.silly('dsc_envislink: SendSocket: Sending to socket port: ' + cmd);
        this.envisalink_client.sendCommand(cmd);
    }
}
exports.dsc_envisalink = dsc_envisalink