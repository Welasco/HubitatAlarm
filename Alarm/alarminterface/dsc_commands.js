const log = require('../tools/logger');
const nconf = require('nconf');
nconf.file({ file: './config/config.json' });

const alarmPassword = nconf.get('alarm:alarmpassword');

/**
 * Class used to implement all DSC commands
 */
class dsc_commands  {
    constructor() {
    }
    // Send the Arm command to Alarm
    alarmArm() {
        return appendChecksum('0331' + alarmPassword + '00');
    }
    // Send the ArmAway command to Alarm
    alarmArmAway() {
        return appendChecksum('0301');
    }
    // Send the ArmStay command to Alarm
    alarmArmStay() {
        return appendChecksum('0311');
    }
    // Send the ArmNight command to Alarm
    alarmArmNight() {
        return appendChecksum('0331' + alarmPassword + '00');
    }
    // Send the Disarm command to Alarm
    alarmDisarm() {
        return appendChecksum('0401' + alarmPassword + '00');
    }
    // Send the Break command to Alarm
    alarmSendBreak() {
        return appendChecksum('070^');
    }
    // Send the Enable Chime command to Alarm
    alarmChimeToggle() {
        return appendChecksum('070c');
    }
    // Send the Activate Panic Siren
    alarmPanic() {
        return appendChecksum('0603');
    }
    // Send the Activate Ambulance
    alarmAmbulance() {
        return appendChecksum('0602');
    }
    // Send the Activate Fire Siren
    alarmFire() {
        return appendChecksum('0601');
    }
    // Send the descriptiveControl to partition to enable verbose mode.
    descriptiveControl() {
        return appendChecksum('0501');
    }
    // This command will send the code to the alarm when ever the alarm ask for it with a 900
    alarmSendCode() {
        return appendChecksum('2001' + alarmPassword + '00');
    }
    // This command will send the code to the alarm when ever the alarm ask for it with a 900
    alarmEnvisalinkLogin() {
        return appendChecksum('005' + alarmPassword + '00');
    }
    // alarm Status Request
    alarmUpdate() {
        return appendChecksum('001');
    }
    // Function used to set Alarm keypad Date and time
    alarmSetDate() {
        return appendChecksum(alarmSetDate());
    }
}
exports.dsc_commands = dsc_commands

// Function used to set Alarm keypad Date and time
function alarmSetDate() {

    let date = new Date();
    let hour = date.getHours().toString();
    if (hour.length == 1) {
        hour = '0' + hour
    }
    let minute = date.getMinutes().toString();
    if (minute.length == 1) {
        minute = '0' + minute
    }
    let month = date.getMonth() + 1;
    let monthstr = month.toString();
    if (monthstr.length == 1) {
        monthstr = '0' + monthstr
    }
    let day = date.getDate().toString();
    if (day.length == 1) {
        day = '0' + day
    }
    let year = date.getFullYear().toString().substring(2, 4);
    let timedate = hour + minute + monthstr + day + year;
    let cmd = '010' + timedate;
    return cmd;
}

/**
 * Change the DSC-IT100 Serial Boud rate speed.
 * Note: Function not in use
 * @param {String} speed
 */
function alarmSetBaudRate(speed) {
    // setup and send baud rate command
    // 0=9600, 1=19200, 2=38400, 3=57600, 4=115200

    let cmd = '080';
    if (speed == '9600') {
        cmd = cmd + '0';
    }
    else if (speed == '19200') {
        cmd = cmd + '1';
    }
    else if (speed == '38400') {
        cmd = cmd + '2';
    }
    else if (speed == '57600') {
        cmd = cmd + '3';
    }
    else if (speed == '115200') {
        cmd = cmd + '4';
    }
    else  // By default set to 9600
    {
        cmd = cmd + '0';
    }
    return cmd;
}

/**
 * Method used to append the right checksum at the end of any command sent to DSC IT-100 Board
 * According with DSC IT-100 manual each command sent to the board must have a checksum
 * This method will calculate the checksum according to the command that need to be sent
 * Will return the data ready to be sent to DSC IT-100 Board
 * Alarm Documentation - http://cms.dsc.com/download.php?t=1&id=16238
 * @param {String} data
 * @returns - returns DSC-IT100 command with the appended calculated checksum.
 */
function appendChecksum(data) {
    let result = 0;
    let arrData = data.split('');
    arrData.forEach(function (entry) {
        let entryBuffer = new Buffer.from(entry, 'ascii');
        let entryRepHex = entryBuffer.toString('hex');
        let entryHex = parseInt(entryRepHex, 16);
        result = result + parseInt(entryHex, 10);
    });
    data = data + (parseInt(result, 10).toString(16).toUpperCase().slice(-2) + '\r\n');
    return data;
}