const EventEmitter = require('events');
const log = require('../tools/logger');
const nconf = require('nconf');
const dsc_commands = require('./dsc_commands').dsc_commands;
const _dsc_commands = new dsc_commands();
nconf.file({ file: './config/config.json' });

// Global Variables
var emitter;
var alarmConnection;
const connectionType = nconf.get('alarm:connectionType');

/**
 * Class used to implement the access to DSC-IT100 board using RS232 Serial communication.
 */
class dsc_alarm extends EventEmitter {
    constructor() {
        super();
        emitter = this;
        this.init();
    }
    init() {
        switch (connectionType) {
            case "it100":
                this.alarmConnection = new dsc_it100();
                alarmConnection = this.alarmConnection;
                this.alarmConnection.init();
                break;

            case "envisalink":
                this.alarmConnection = new dsc_envisalink();
                this.alarmConnection.init();
                break;
            default:
                break;
        }
    }
    sendCommand(cmd){
        this.alarmConnection.sendCommand(cmd);
    }
    alarmArm() {
        this.sendCommand(_dsc_commands.alarmArm());
    }
    alarmArmAway() {
        this.sendCommand(_dsc_commands.alarmArmAway());
    }
    alarmArmStay() {
        this.sendCommand(_dsc_commands.alarmArmStay());
    }
    alarmArmNight() {
        this.sendCommand(_dsc_commands.alarmArmNight());
    }
    alarmDisarm() {
        this.sendCommand(_dsc_commands.alarmDisarm());
    }
    alarmSendBreak() {
        this.sendCommand(_dsc_commands.alarmSendBreak());
    }
    alarmChimeToggle() {
        this.sendCommand(_dsc_commands.alarmChimeToggle());
        // wait for 1800 and call alarmSendBreak
        setTimeout(this.alarmSendBreak(), 1800);
    }
    alarmPanic() {
        this.sendCommand(_dsc_commands.alarmPanic());
    }
    alarmAmbulance() {
        this.sendCommand(_dsc_commands.alarmAmbulance());
    }
    alarmFire() {
        this.sendCommand(_dsc_commands.alarmFire());
    }
    descriptiveControl() {
        this.sendCommand(_dsc_commands.descriptiveControl());
    }
    alarmSendCode() {
        this.sendCommand(_dsc_commands.alarmSendCode());
    }
    alarmUpdate() {
        this.sendCommand(_dsc_commands.alarmUpdate());
    }
    alarmSetDate() {
        this.sendCommand(_dsc_commands.alarmSetDate());
    }
    alarmEnvisalinkLogin() {
        this.sendCommand(_dsc_commands.alarmEnvisalinkLogin());
    }
}
exports.dsc_alarm = dsc_alarm

/**
 * Implement a Function to access Serial Port RS232 using USB cable converter
 */
var dsc_it100 = function () {
    this.init = function () {
        this.alarmConnection = new (require('./dsc_it100').dsc_it100);
        this.alarmConnection.on('read', function (data) {
            if (data.code == '900') {
                emitter.alarmSendCode();
            }
            else{
                emitter.emit('read', data);
            }
        });
        this.alarmConnection.on('error', function (error) {
            log.error('dsc_alarm: alarmConnection: ERROR: ', error);
            emitter.emit("error",error);
        });
    }
}

/**
 * Implement a Function to access Serial Port RS232 using USB cable converter
 */
 var dsc_envisalink = function () {
    this.init = function () {
        this.alarmConnection = new (require('./dsc_envisalink').dsc_envisalink);
        this.alarmConnection.on('read', function (data) {
            if (data.code == '900') {
                emitter.alarmSendCode();
            }
            else if (data.code == '5053') {
                emitter.alarmEnvisalinkLogin();
            }
            else{
                emitter.emit('read', data);
            }
        });
        this.alarmConnection.on('error', function (error) {
            log.error('dsc_alarm: alarmConnection: ERROR: ', error);
            emitter.emit("error",error);
        });
    }
}