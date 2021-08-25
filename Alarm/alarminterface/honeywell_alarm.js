const EventEmitter = require('events');
const log = require('../tools/logger');
const nconf = require('nconf');
const honeywell_commands = require('./honeywell_commands').honeywell__commands;
const _honeywell_commands = new honeywell_commands();
const alarmEventParser = require('./honeywell_eventParser').honeywell_eventParser;
const _alarmEventParser = new alarmEventParser();
nconf.file({ file: './config/config.json' });

// Global Variables
var self;

/**
 * Class used to implement Honeywell using EvenisaLink access
 */
class honeywell_alarm extends EventEmitter {
    constructor() {
        super();
        self = this;
        this.init();
    }
    init() {
        this.#honeywell_envisalink();
    }

    alarmArm() {
        self.#sendCommand(_honeywell_commands.alarmArm());
    }
    alarmArmAway() {
        self.#sendCommand(_honeywell_commands.alarmArmAway());
    }
    alarmArmStay() {
        self.#sendCommand(_honeywell_commands.alarmArmStay());
    }
    alarmArmNight() {
        self.#sendCommand(_honeywell_commands.alarmArmNight());
    }
    alarmDisarm() {
        self.#sendCommand(_honeywell_commands.alarmDisarm());
    }
    alarmChimeToggle() {
        self.#sendCommand(_honeywell_commands.alarmChimeToggle());
    }
    alarmEnvisalinkLogin() {
        self.#sendCommand(_honeywell_commands.alarmEnvisalinkLogin());
    }
    alarmSpeedKeyA() {
        self.#sendCommand(_honeywell_commands.alarmSpeedKeyA());
    }
    alarmSpeedKeyB() {
        self.#sendCommand(_honeywell_commands.alarmSpeedKeyB());
    }
    alarmSpeedKeyC() {
        self.#sendCommand(_honeywell_commands.alarmSpeedKeyC());
    }
    alarmSpeedKeyD() {
        self.#sendCommand(_honeywell_commands.alarmSpeedKeyD());
    }
    // Private Methods
    #honeywell_envisalink() {
        this.alarmConnection = new (require('./envisalink').envisalink);
        this.alarmConnection.on('read', function (data) {
            self.#parseReceivedData(data);
        });
        this.alarmConnection.on('error', function (error) {
            log.error('[Honeywell-Alarm] alarmConnection: ERROR: ', error);
            self.emit('error', error);
        });
    }
    #parseReceivedData(data) {
        data.toString('ascii').split('\r\n').forEach(function (item) {
            let alarmEvent;
            if (item.length != 0) {
                var code = item;
                if (item[0] == '%' || item[0] == '^') {
                    code = item.split(',')[0];
                    item = item.slice(item.indexOf(',') + 1, -1);
                }

                try {

                    alarmEvent = _alarmEventParser.GetCode(code,item);
                    if (typeof alarmEvent !== 'undefined'){
                        if(alarmEvent.code == 'Login:'){
                            log.info('[Honeywell-Alarm] EnvisaLink Login requested. Sending Login information');
                            self.alarmEnvisalinkLogin();
                        }
                        else{
                            self.emit('read', JSON.stringify(alarmEvent));
                        }
                    }
                } catch (error) {
                    log.silly('[Honeywell-Alarm] Alarm received command not mapped: '+item);
                }
            }
            else {
                log.silly('[Honeywell-Alarm] Received invalid command: ' + item);
            }
        });
    }
    #sendCommand(cmd) {
        this.alarmConnection.sendCommand(cmd);
    }
}
exports.honeywell_alarm = honeywell_alarm