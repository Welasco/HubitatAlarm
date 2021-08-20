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
            //console.log('Received data : ' + data);
            data.toString('ascii').split('\r\n').forEach( function (item) {
                if (item.length != 0) {
                    console.log('Received data: '+item);
                }
                else{
                    //console.log('Received invalid data.');
                }
            });
            // data.toString('utf8').split(/\r?\n/).forEach( function (item) {
            //     console.log('Split utf8: '+item);
            // });
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

setTimeout(function() { client.write(('user\r\n').toString('ascii')); }, 2000);






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