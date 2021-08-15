let EventEmitter = require('events')
var net = require('net');
var emitter;

var PORT = normalizePort(process.env.PORT || '3001');
var HOST = '0.0.0.0';
var netSock
var client = new net.Socket();
class Socket extends EventEmitter {
    constructor(){
        super();
        emitter = this;
        this.readSocketData();
    }
    readSocketData(){
        var obj_clientSocket = new clientSocket();
        obj_clientSocket.init();
    }
    send(msg){
        try {
            client.write(msg);
          } catch (error) {
            console.log("ERROR: No Socket connected to send data!");
          }        
    }    
}

var clientSocket = function(){
    var self = this;
    this.init = function () {
        var client = new net.Socket();
        if (client && client.writable) { return; }
        if (client) { client.destroy(); }           
        client.connect(3001, '127.0.0.1', function() {
            console.log('Client socket_client Connected to socket_server');
            client.write('Hello from socket_client_test!');
        });
        client.on('data', function (data) {
            console.log('Received data : ' + data);
            var strData = data.toString();
            emitter.emit("read",strData);
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
    }
}

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
    // named pipe
    return val;
    }
    if (port >= 0) {
    // port number
    return port;
    }
    return false;
}
exports.Socket = Socket