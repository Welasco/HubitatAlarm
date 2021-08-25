const { count } = require("console");
var WebSocket = require("ws");
//var wseventdata_1 = require("./wseventdata");
var ws = new WebSocket('ws://localhost:3000/wss', ['json']);
var socketData = { 'event': 'null', 'data': 'null' };
var conStatus = ""
ws.on('open', function () {
    console.log('Client CONNECTED to server');
    conStatus = "connected";
    var msg = "Hello from VSantana-PC";
    console.log('Sending: ' + msg);
    //ws.send(msg);
});
ws.on('close', function () {
    console.log('DISCONNECTED');
    conStatus = "disconnected";
});
ws.on('message', function (message) {
    console.log('Client received: %s', message);
    try {
        var j = JSON.parse(message);
        console.log("authors: " + j.authors);
        console.log("Full JSON: " + JSON.stringify(j));
    } catch (error) {
        // do nothing
    }
});

var obj = {
    'command':'alarmSetDate'
}
setTimeout(function() { ws.send(JSON.stringify(obj))}, 2000);
//setTimeout(function() { ws.send((('{"command":"alarmArmAway"}').toString('ascii')))}, 2000);

// var codes = ['500','50003129','5000332B','50003028','501','505','5053','609001','610002','621','622','650','651','652','654','655','656','658','659','670','672','673','700','750','800','801','802','803','806','807','810','811','812','813','821','822','829','830','840','841','842','843','896','897','900','901'];
// var i = 0;
// var interval = setInterval(function () {
//     //console.log(('r:'+codes[i]+'\r\n').toString('ascii'));
//     ws.send((('r:'+codes[i]+'\r\n').toString('ascii'));
//     if (i<=codes.length) {
//         i++;
//     }
//     else{
//         i=0;
//     }

// }, 500);