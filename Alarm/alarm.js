#!/usr/bin/env node

const init_config = require('./tools/initialize_config');
init_config.init();
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
const alarm_interface = require('./alarminterface/alarm_interface').alarm_interface;
const http_handler = require('./tools/http_handler').http_handler;
const log = require('./tools/logger');
const nconf = require('nconf');
const _checkSchema = require('./tools/checkJsonSchema').checkJsonSchema;

// Load Alarm main config file
nconf.file({ file: './config/config.json' });

const _http_handler = new http_handler();
const communicationType = nconf.get('alarm:communicationType');
var wssend;

// Instantiate Alarm interface
var _alarm = new alarm_interface();
_alarm.on('read', function (data) {

    // Check if communicationType is set to api if so callBack with received data
    if (nconf.get('alarm:communicationType') == 'API') {
        log.verbose('[Alarm] Sending API client data: '+data);
        _http_handler.notify(data);
    }
    // Broadcast all Alarm received data to all WSS connected clients
    log.verbose('[Alarm] Sending WSS client data: '+data);
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
});
_alarm.on('error', function (error) {
    log.error('[Alarm] _alarm Error: ' + error);
});

// Alarm WebSocket implementation
const wss = new WebSocket.Server({ server: server, path: '/wss' });
wss.on('connection', function connection(ws) {

    log.verbose('[Alarm] WSS Client connected IP: ' + ws._socket.remoteAddress);

    wssend = ws;

    // Expected to received Alarm commands
    // Ex: JSON --> {"command":"alarmArmAway"}
    ws.on('message', function incoming(rcv_msg) {
        //log.verbose('[Alarm] WSS Server received message: ' + rcv_msg.toString('ascii'));
        let json_rcv_msg = JSON.parse(rcv_msg);
        if (_checkSchema('commandWSSSchema',json_rcv_msg)) {
            log.debug('[Alarm] WSS received a valid command: '+json_rcv_msg.command);
            try{
                let responseHandler = alarm_command_map[json_rcv_msg.command];
                responseHandler();
            }
            catch{
                log.info('[Alarm] WSS received a command thats not implemented');
            }
        }
        else{
            log.error('[Alarm] WSS received an invalid json schema');
        }
    });

    ws.on('close', function (code, reason) {
        log.info('[Alarm] Client disconnected: ' + ws._socket.remoteAddress + ' Code: ' + code + ' Reason: ' + reason);
    });

});

//////////////////////////////////////////////////////////////////
// Build Express Server - Creating Endpoints
//////////////////////////////////////////////////////////////////
//app.use(express.json());
// Used only to check if Alarm is running
app.get('/', function (req, res) {
    res.send('<html><body><h1>Hubitat Alarm Running</h1></body></html>');
});

app.get('/api/:command',function (req, res) {
    try {
        let responseHandler = alarm_command_map[req.params.command];
        responseHandler();
        res.end();
    } catch (error) {
        res.status(404).send("Alarm command not found: "+req.params.command);
    }
})

// Alarm command handlers map
const alarm_command_map = {
    'alarmArm': _alarm.alarm.alarmArm,
    'alarmArmAway': _alarm.alarm.alarmArmAway,
    'alarmArmStay': _alarm.alarm.alarmArmStay,
    'alarmArmNight': _alarm.alarm.alarmArmNight,
    'descriptiveControl': _alarm.alarm.descriptiveControl,
    'alarmDisarm': _alarm.alarm.alarmDisarm,
    'alarmChimeToggle': _alarm.alarm.alarmChimeToggle,
    'alarmPanic': _alarm.alarm.alarmPanic,
    'alarmFire': _alarm.alarm.alarmFire,
    'alarmAmbulance': _alarm.alarm.alarmAmbulance,
    'alarmSetDate': _alarm.alarm.alarmSetDate,
    'alarmUpdate': _alarm.alarm.alarmUpdate,
    'alarmSpeedKeyA': _alarm.alarm.alarmSpeedKeyA,
    'alarmSpeedKeyB': _alarm.alarm.alarmSpeedKeyB,
    'alarmSpeedKeyC': _alarm.alarm.alarmSpeedKeyC,
    'alarmSpeedKeyD': _alarm.alarm.alarmSpeedKeyD
}

/**
 * Subscribe route used by Hubitat Hub to register for callback/notifications and write to config.json
 * @param {String} host - The Hubitat Hub IP address and port number
 */
app.post('/subscribe', express.json({type: '*/*'}), function (req, res) {
    log.info('[Alarm] Subscribe HUB: '+JSON.stringify(req.body));
    if (_checkSchema('subscribeSchema',req.body)) {
        nconf.set('notify', req.body);
        nconf.save(function (err) {
            if (err) {
                log.error('[Alarm] Subscribe  Config error: ' + err.message);
                res.status(500).json({ error: '[Alarm] Subscribe Config error: ' + err.message });
                return;
            }
        });
        log.debug('[Alarm] Received a valid subscribed JSON. Configuration saved.');
    }
    else{
        log.error('[Alarm] Invalid subscribed Schema');
        res.status(500).json({ error: '[Alarm] Invalid subscribed Schema'});
    }
    res.end();
});

// Used to save the Alarm password coming from Hubitat App
app.get('/config', function (req, res) {
    if (nconf.get('alarm')) {
        log.info("[Alarm] Sending alarm config: " + JSON.stringify(nconf.get('alarm')));
        res.send(JSON.stringify(nconf.get('alarm')));
    } else {
        res.status(500).send('[Alarm] alarm section in config.json not set');
        log.error('[Alarm] alarm section in config.json not set');
    }
    res.end();
});

// Used to save alarm configuration settings
app.post('/config', express.json({type: '*/*'}), function (req, res) {
    log.info('[Alarm] Received configuration: '+JSON.stringify(req.body));
    if (_checkSchema('alarmConfigSchema',req.body)) {
        nconf.set('alarm', req.body);
        nconf.save(function (err) {
            if (err) {
                log.error('[Alarm] Config error: ' + err.message);
                res.status(500).json({ error: '[Alarm] Config error: ' + err.message });
                return;
            }
        });
        log.debug('[Alarm] Received a valid config.json. Configuration saved.');
        res.end();
        log.debug('[Alarm] Configuration change detected. Force process shutdown in 5 seconds. Linux systemd will restart the service.');
        setTimeout(function() { process.exit(0); }, 5000);
    }
    else{
        log.error('[Alarm] Invalid Schema');
        res.status(500).json({ error: '[Alarm] Invalid Schema'});
    }
    res.end();
});

log.info('[Alarm] HTTP Endpoint: All HTTP endpoints loaded');

////////////////////////////////////////
// Creating Server
////////////////////////////////////////
let httpport = nconf.get('httpport');
server.listen(httpport);
log.info('[Alarm] HTTP Endpoint: HTTP Server started at port: ' + httpport);