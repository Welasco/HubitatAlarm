const dscSerial = require("../alarminterface/dsc_it100").dsc_it100;

let dscSerial = new dscSerial();
dscSerial.on("read", function (data) {
    console.log('Test Received data: '+JSON.stringify(data));
})
dscSerial.on("error", function (error) {
    console.log('ERROR: ', error);
});

function send(msg){
    dscSerial.send(msg);
}
