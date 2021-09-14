const alarm_interface = require('./alarminterface/alarm_interface').alarm_interface;
const _alarm = new alarm_interface();
_alarm.on('read',function (data) {
   console.log('*** Received alarm.js: '+JSON.stringify(data));
});

//_alarm._alarm.alarmArmAway;
//_alarm.alarm.alarmSendCode();
setTimeout(_alarm.alarm.alarmArmNight, 4000);

