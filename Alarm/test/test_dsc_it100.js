const dsc_it100 = require("./alarminterface/dsc_it100").dsc_it100;

let dscSerial = new dsc_it100();
dscSerial.on("read", function (data) {
    console.log('Test Received data: '+JSON.stringify(data));
})
dscSerial.on("error", function (error) {
    console.log('ERROR: ', error);
});

function alarmArmNight() {
    dscSerial.alarmArmNight();
}

setTimeout(alarmArmNight, 10000);
