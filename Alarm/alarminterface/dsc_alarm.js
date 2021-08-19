const EventEmitter = require('events');
const log = require('../tools/logger');
const nconf = require('nconf');
const dsc_commands = require('./dsc_commands').dsc_commands;
const _dsc_commands = new dsc_commands();
const alarmEventParser = require('./dsc_eventParser').dsc_eventParser;
let _alarmEventParser = new alarmEventParser();
nconf.file({ file: './config/config.json' });

// Global Variables
const connectionType = nconf.get('alarm:connectionType');
var self;

/**
 * Class used to implement the access to DSC-IT100 board using RS232 Serial communication.
 */
class dsc_alarm extends EventEmitter {
    constructor() {
        super();
        self = this;
        this.init();
    }
    init() {
        switch (connectionType) {
            case "it100":
                this.#dsc_it100();
                break;

            case "envisalink":
                this.#dsc_envisalink();
                break;
            default:
                break;
        }
    }

    alarmArm() {
        self.#sendCommand(_dsc_commands.alarmArm());
    }
    alarmArmAway() {
        self.#sendCommand(_dsc_commands.alarmArmAway());
    }
    alarmArmStay() {
        self.#sendCommand(_dsc_commands.alarmArmStay());
    }
    alarmArmNight() {
        self.#sendCommand(_dsc_commands.alarmArmNight());
    }
    alarmDisarm() {
        self.#sendCommand(_dsc_commands.alarmDisarm());
    }
    alarmSendBreak() {
        self.#sendCommand(_dsc_commands.alarmSendBreak());
    }
    alarmChimeToggle() {
        self.#sendCommand(_dsc_commands.alarmChimeToggle());
        // wait for 1800 and call alarmSendBreak
        setTimeout(this.alarmSendBreak(), 1800);
    }
    alarmPanic() {
        self.#sendCommand(_dsc_commands.alarmPanic());
    }
    alarmAmbulance() {
        self.#sendCommand(_dsc_commands.alarmAmbulance());
    }
    alarmFire() {
        self.#sendCommand(_dsc_commands.alarmFire());
    }
    descriptiveControl() {
        self.#sendCommand(_dsc_commands.descriptiveControl());
    }
    alarmSendCode() {
        self.#sendCommand(_dsc_commands.alarmSendCode());
    }
    alarmUpdate() {
        self.#sendCommand(_dsc_commands.alarmUpdate());
    }
    alarmSetDate() {
        self.#sendCommand(_dsc_commands.alarmSetDate());
    }
    alarmEnvisalinkLogin() {
        self.#sendCommand(_dsc_commands.alarmEnvisalinkLogin());
    }
    // Private Methods
    #dsc_it100(){
        this.alarmConnection = new (require('./dsc_it100').dsc_it100);
        this.alarmConnection.on('read', function (data) {
            self.#parseReceivedData(data);
        });
        this.alarmConnection.on('error', function (error) {
            log.error('dsc_alarm: alarmConnection: ERROR: ', error);
            self.emit("error",error);
        });
    }
    #dsc_envisalink(){
        this.alarmConnection = new (require('./envisalink').envisalink);
        this.alarmConnection.on('read', function (data) {
            self.#parseReceivedData(data);
        });
        this.alarmConnection.on('error', function (error) {
            log.error('dsc_alarm: alarmConnection: ERROR: ', error);
            self.emit('error',error);
        });
    }
    #parseReceivedData(data){
        let alarmEvent;
        let cmdFullStr = data;
        if (cmdFullStr.length >= 3) {
            let cmd = cmdFullStr.substr(0, 3);
            try {
                alarmEvent = _alarmEventParser.GetCode(cmd,cmdFullStr);
                if (typeof alarmEvent !== 'undefined'){
                    if (alarmEvent.code == '900') {
                        self.alarmSendCode();
                    }
                    else if (alarmEvent.login_command == '5053') {
                        self.alarmEnvisalinkLogin();
                    }
                    else{
                        self.emit('read', alarmEvent);
                    }
                }
            } catch (error) {
                log.silly('parseReceivedData: Alarm received command not mapped: '+cmd);
            }
        }
    }
    #sendCommand(cmd){
        this.alarmConnection.sendCommand(cmd);
    }
}
exports.dsc_alarm = dsc_alarm