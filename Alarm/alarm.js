#!/usr/bin/env node
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
const Alarm = require("./alarminterface/alarm_interface").Alarm;
const log = require('./tools/logger');
const nconf = require('nconf');

// Load Alarm main config file
nconf.file({ file: './config/config.json' });

// Instantiate Alarm interface
// Sample code for now
const alarmType = nconf.get('alarm:type');
let alarm = new Alarm("alarmType");

alarm.on("read",function(data){
    console.log("Writing from using-alarm_interface.js: "+data);
})

alarm.on("error", function(error){
    console.log("Writing from using-alarm_interface.js: Error "+error);
})

// Alarm WebSocket implementation
var wssend;
const wss = new WebSocket.Server({ server:server, path:"/wss" });
wss.on('connection', function connection(ws) {
    console.log('A new client Connected!');
    wssend = ws;
    ws.send('Welcome New Client!');
  
    tail.on("line", function(data) {
      console.log("Log - new line in file: "+data);
      ws.send(data);
    });
  
    tail.on("error", function(error) {
      console.log('ERROR: ', error);
    });  
  
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
  
      wss.clients.forEach(function each(client) {
        //console.log("client objs: " + JSON.stringify(client, null, 2));
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
  
    });
  
    ws.on('close', function (code,reason) {
      console.log('DISCONNECTED');
      console.log("Code: "+JSON.stringify(code) + " Reason: " + JSON.stringify(reason));
    });
    
});

//////////////////////////////////////////////////////////////////
// Build Express Server - Creating Endpoints
//////////////////////////////////////////////////////////////////

// Used only to check if Alarm is running
app.get("/", function (req, res) {
    res.send("<html><body><h1>Hubitat Alarm Running</h1></body></html>");
});

// Used to arm the alarm using the alarm password
app.get("/api/alarmArm", function (req, res) {
    alarmArm();
    res.end();
});

// Used to arm the alarm in Away Mode (password not required)
app.get("/api/alarmArmAway", function (req, res) {
    alarmArmAway();
    res.end();
});

// Used to arm the alarm in Stay Mode (password not required)
app.get("/api/alarmArmStay", function (req, res) {
    alarmArmStay();
    res.end();
});

/////////////////////////////////////////////////////////
// Used to arm the alarm in Stay Mode but Night
app.get("/api/alarmArmNight", function (req, res) {
    alarmArmNight();
    res.end();
});

// Used to enable descriptive control 
app.get("/api/descriptiveControl", function (req, res) {
    descriptiveControl();
    res.end();
});

/////////////////////////////////////////////////////////

// Used to disarm the alarm (need a password)
app.get("/api/alarmDisarm", function (req, res) {
    alarmDisarm();
    res.end();
});

// Used to enable or disable Chime
app.get("/api/alarmChimeToggle", function (req, res) {
    alarmChimeToggle();
    res.end();
});

// Used to activate Panic Siren
app.get("/api/alarmPanic", function (req, res) {
    alarmPanic();
    res.end();
});

// Used to activate Fire Siren
app.get("/api/alarmFire", function (req, res) {
    alarmFire();
    res.end();
});

// Used to activate Ambulance
app.get("/api/alarmAmbulance", function (req, res) {
    alarmAmbulance();
    res.end();
});


// Used to Set Alarm Date and Time
app.get("/api/alarmSetDate", function (req, res) {
    alarmSetDate();
    res.end();
});

// Used to Set Alarm Date and Time
app.get("/api/alarmUpdate", function (req, res) {
    alarmUpdate();
    res.end();
});

/**
 * Subscribe route used by Hubitat Hub to register for callback/notifications and write to config.json
 * @param {String} host - The Hubitat Hub IP address and port number
 */
app.get('/subscribe/:host', function (req, res) {
    let parts = req.params.host.split(":");
    nconf.set('notify:address', parts[0]);
    nconf.set('notify:port', parts[1]);
    nconf.save(function (err) {
      if (err) {
        log.error('Subscribe: Configuration error: '+err.message);
        res.status(500).json({ error: 'Configuration error: '+err.message });
        return;
      }
    });
    res.end();
    log.info('Subscribe: Hubitat IpAddress: '+parts[0] +' Port: '+ parts[1]);
});

// Used to save the Alarm password coming from Hubitat App
app.get('/config/:host', function (req, res) {
    let parts = req.params.host;
    if(parts != "null"){
        nconf.set('alarm:alarmpassword', parts);
        nconf.save(function (err) {
            if (err) {
                log.error('SaveConfig: Configuration error: '+err.message);
                res.status(500).json({ error: 'Configuration error: '+err.message });
                return;
            }
        });
        log.info('SaveConfig: Alarm Panel Code Saved: '+parts);
        alarmPassword = nconf.get('alarm:alarmpassword');
        log.info('SaveConfig: Alarm Panel Reloading Config File '+alarmPassword);
        
    }
    else{
        log.error('SaveConfig: Failed to save Alarm Panel Code password cannot be null');
    }
    res.end();
    
});

/**
 * discover
 */
// Used to send all zones back to Hubitat
app.get("/discover", function (req, res) {
    alarmDiscover();
    res.end();
}); 

log.info('HTTP Endpoint: All HTTP endpoints loaded');

////////////////////////////////////////
// Creating Server
////////////////////////////////////////
let httpport = nconf.get('httpport');
server.listen(httpport);
log.info('HTTP Endpoint: HTTP Server Created at port: ' + httpport);

// log.error('Writing log error');
// log.warn('Writing log warn');
// log.info('Writing log info');
// log.http('Writing log http');
// log.verbose('Writing log verbose');
// log.debug('Writing log debug');
// log.silly('Writing log silly');