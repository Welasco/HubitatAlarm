const honeywell_alarm = require('./alarminterface/honeywell_alarm').honeywell_alarm;
const _honeywell_alarm = new honeywell_alarm();
_honeywell_alarm.on('read',function (data) {
   console.log('*** Received _honeywell_alarm data: '+JSON.stringify(data));
});

//_honeywell_alarm.alarmSendCode();
setTimeout(_honeywell_alarm.alarmArm, 4000);

