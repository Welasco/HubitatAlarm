var net = require('net');

var HOST = '0.0.0.0';
//var PORT = 8080;
var PORT = normalizePort(process.env.PORT || '3002');

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
    //console.log('DATA ' + sock.remoteAddress + ': ' + data);
    var strData = data.toString();
    var strsplitData = strData.split('\n');
    //console.log('strData: '+strData);
    //console.log('First position: '+strsplitData[0]);

    if (strData.startsWith('GET /drop HTTP/1.1')) {
        console.log('Ending connection. No matching VDir for: '+strsplitData[0]);
        sock.end();
    }
    else{
        console.log("Worked. Answering back a valid HTML from this requester: " + sock.remoteAddress);
        console.log("Received buffer: ");
        console.log(strData);
        var response = `HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
<html><body><h1>NodeJS UP and running :)</h1></body></html>
`;
        //response = response + 'You said:\n "' + data + '"';
        var receivedData = '';
        for(var x = 0; x < strsplitData.length; x++){
            receivedData = receivedData + strsplitData[x] + '<br>';
            //console.log('line: ' + strsplitData[x]);
        }
        //console.log('Print received data: ' + receivedData);
        response = response + '<b>You sent:</b><br>' + receivedData;

        sock.write(response);
        sock.end();

    }
    sock.end();
  });
  // Add a 'close' event handler to this instance of socket
 sock.on('close', function(data) {
   console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
 });

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
console.log('Server listening on ' + HOST +':'+ PORT);