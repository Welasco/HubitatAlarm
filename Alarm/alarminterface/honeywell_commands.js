const log = require('../tools/logger');
const nconf = require('nconf');
nconf.file({ file: './config/config.json' });

const alarmPassword = nconf.get('alarm:alarmpassword');
const envisalinkPassword = nconf.get('alarm:envisalink:password');

/**
 * Class used to implement all DSC commands
 */
class honeywell__commands  {
    constructor() {
    }
    // Send the Arm command to Alarm
    alarmArm() {
        return alarmPassword+2+'\r\n';
    }
    // Send the ArmAway command to Alarm
    alarmArmAway() {
        return alarmPassword+2+'\r\n';
    }
    // Send the ArmStay command to Alarm
    alarmArmStay() {
        return alarmPassword+3+'\r\n';
    }
    // Send the ArmNight command to Alarm
    alarmArmNight() {
        return alarmPassword+7+'\r\n';
    }
    // Send the Disarm command to Alarm
    alarmDisarm() {
        return alarmPassword+1+'\r\n';
    }
    // Send the Enable Chime command to Alarm
    alarmChimeToggle() {
        return alarmPassword+9+'\r\n';
    }
    // This command will send the code to EnvisaLink when ever necessary
    alarmEnvisalinkLogin() {
        return envisalinkPassword+'\r\n';
    }
    // Key Buttons
    alarmSpeedKeyA() {
        return 'A'+'\r\n';
    }
    alarmSpeedKeyB() {
        return 'B'+'\r\n';
    }
    alarmSpeedKeyC() {
        return 'C'+'\r\n';
    }
    alarmSpeedKeyD() {
        return 'D'+'\r\n';
    }
}
exports.honeywell__commands = honeywell__commands