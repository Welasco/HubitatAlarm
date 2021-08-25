var net = require('net');

var PORT = normalizePort(process.env.PORT || '3001');
var HOST = '0.0.0.0';

// Set of all currently connected sockets
const connectedSockets = new Set();

// broadcast to all connected sockets except one
connectedSockets.broadcast = function(data, except) {
    for (let sock of this) {
        if (sock !== except) {
            sock.write(data);
        }
    }
}

var server = net.createServer(function(sock) {
    connectedSockets.add(sock);
    console.log('Socket Server: CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    sock.setEncoding('utf-8');
    sock.on('data', function(data) {
        var strData = data.toString();
        console.log("Socket Server received: "+strData);
        if (strData.substr(0,2)=='r:') {
            let replay = strData.substr(2,strData.length-2)
            //console.log("Replay: "+replay);
            //sock.write(replay);
            connectedSockets.broadcast(replay, sock);

        }
        //sock.write("Socket Server received: "+strData);
        //sock.end();
    });
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        connectedSockets.delete(sock);
        console.log('Socket Server: CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    sock.on('error', function (error) {
        console.log('Socket Server: ERROR: ' + error);
        //clearInterval(interval);
    });

    // var interval = setInterval(function () {
    //     var date = new Date().toString();
    //     var msg = "Message loop from socket server "+date+"\n\r";
    //     console.log("Printing before send: " + msg);
    //     //sock.write(msg);
    // }, 10000);
}).listen(PORT, HOST);


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
console.log("Socket Server started!");