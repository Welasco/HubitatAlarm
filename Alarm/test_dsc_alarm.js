const dsc_alarm = require('./alarminterface/dsc_alarm').dsc_alarm;
const _dsc_alarm = new dsc_alarm();
_dsc_alarm.on('read',function (data) {
   console.log('Received _dscalarm data: '+JSON.stringify(data));
});

//_dsc_alarm.alarmSendCode();
//setTimeout(_dsc_alarm.alarmArm, 4000);

