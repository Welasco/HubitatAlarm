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

var codes = ['609001','609002','609003','610001','610002','610003'];
var i = 0;
var interval = setInterval(function () {
    //console.log(('r:'+codes[i]+'\r\n').toString('ascii'));
    client.write(('r:'+codes[i]+'\r\n').toString('ascii'));
    if (i<=codes.length) {
        i++;
    }
    else{
        i=0;
    }

}, 2000);


// var interval = setInterval(function () {
//     client.write(('r:5053\r\n').toString('ascii'));
// }, 2000);