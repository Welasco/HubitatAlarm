var net = require('net');
//var client = new net.Socket();
var client;
var clientSocket = function(){
    var self = this;
    this.init = function () {
        client = new net.Socket();
        //if (client && client.writable) { return; }
        //if (client) { client.destroy(); }
        client.connect(3001, '127.0.0.1', function() {
            console.log('Client socket_client Connected to socket_server');
            //client.write('Hello from socket_client_test!');
        });
        client.on('data', function (data) {
            console.log('Received data : ' + data);
            var strData = data.toString();
        });
        // When connection disconnected.
        client.on('end',function () {
            console.log('Client socket disconnect. ');
            client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        // client.on('timeout', function () {
        //     console.log('Client connection timeout. ');
        // });
        client.on('error', function (err) {
            //console.error(JSON.stringify(err));
            console.log('Error Name: '+err.name+' Message: '+err.message);
            client.destroy();
            setTimeout(function() { self.init() }, 4000);
        });
        // var interval = setInterval(function () {
        //     client.write(('r:900\r\n').toString('ascii'));
        // }, 5000);
    }
}
var obj_clientSocket = new clientSocket();
obj_clientSocket.init();

//setTimeout(function() { client.write(('Login:\r\n').toString('ascii')); }, 2000);

var code = ['Login:','OK','FAILED','Timed Out!','%00','%01','%02','%03','%FF','^00','^01','^02','^03','^0C'];
var code2 = [
    'Login:',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,1C28,08,01, DISARMED CHIME  Ready to Arm   $',
    '%00,01,1C28,08,00, DISARMED CHIME  Ready to Arm   $',
    '%00,01,1C08,08,01,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,0008,01,00,FAULT 01                        $',
    '%00,01,0008,02,00,FAULT 02                        $',
    '%00,01,0008,03,00,FAULT 03                        $',
    '%00,01,0008,10,00,FAULT 10                        $',
    '%02,0100000000000000$',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%02,0300000000000000$',
    '%01,100000000000000000000000000000000$',
    '%00,01,0008,05,00,FAULT 05                        $',
    '%00,01,0008,01,00,FAULT 01                        $',
    '%00,01,0008,02,00,FAULT 02                        $',
    '%00,01,0008,03,00,FAULT 03                        $',
    '%02,0100000000000000$',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%02,0400000000000000$',
    '%00,01,8008,60,03,ARMED ***STAY***May Exit Now  60$',
    '%00,01,8008,59,00,ARMED ***STAY***May Exit Now  59$',
    '%00,01,8008,58,00,ARMED ***STAY***May Exit Now  58$',
    '%00,01,8C08,08,00,ARMED ***STAY***                $',
    '%00,01,8C08,08,00,ARMED ***STAY***                $',
    '%02,0100000000000000$',
    '%00,01,1C08,08,01,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,000C,60,05,ARMED ***AWAY***May Exit Now  60$',
    '%00,01,000C,59,05,ARMED ***AWAY***May Exit Now  59$',
    '%00,01,000C,58,05,ARMED ***AWAY***May Exit Now  58$',
    '%02,0100000000000000$',
    '%00,01,1C08,08,01,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,1C28,08,01, DISARMED CHIME  Ready to Arm   $',
    '%00,01,1C28,08,00, DISARMED CHIME  Ready to Arm   $',
    '%00,01,1C08,08,01,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    '%00,01,1C08,08,00,****DISARMED**** Ready to Arm   $',
    'FIM'
]
var i = 0;
var interval = setInterval(function () {
    //console.log(('r:'+codes[i]+'\r\n').toString('ascii'));
    client.write(('r:'+code2[i]+'\r\n').toString('ascii'));
    if (i<=code2.length) {
        i++;
    }
    else{
        i=0;
    }
}, 500);

// var codes = ['500','50003129','5000332B','50003028','501','505','5053','609001','610002','621','622','650','651','652','654','655','656','658','659','670','672','673','700','750','800','801','802','803','806','807','810','811','812','813','821','822','829','830','840','841','842','843','896','897','900','901'];
// var i = 0;
// var interval = setInterval(function () {
//     //console.log(('r:'+codes[i]+'\r\n').toString('ascii'));
//     client.write(('r:'+codes[i]+'\r\n').toString('ascii'));
//     if (i<=codes.length) {
//         i++;
//     }
//     else{
//         i=0;
//     }

// }, 500);


// var interval = setInterval(function () {
//     client.write(('r:5053\r\n').toString('ascii'));
// }, 2000);