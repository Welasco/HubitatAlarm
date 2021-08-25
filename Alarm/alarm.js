#!/usr/bin/env node
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');
const alarm_interface = require('./alarminterface/alarm_interface').alarm_interface;
const log = require('./tools/logger');
const nconf = require('nconf');

// Load Alarm main config file
nconf.file({ file: './config/config.json' });

var wssend;

// Instantiate Alarm interface
var _alarm = new alarm_interface();
_alarm.on('read', function (data) {
    log.verbose('[Alarm] Sending WSS client data: '+data);
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
});
_alarm.on('error', function (error) {
    log.error('_alarm Error: ' + error);
});

// Alarm WebSocket implementation
const wss = new WebSocket.Server({ server: server, path: '/wss' });
wss.on('connection', function connection(ws) {

    log.verbose('[Alarm] WSS Client connected IP: ' + ws._socket.remoteAddress);

    wssend = ws;

    // Expected to received Alarm commands
    // Ex: JSON --> {"command":"alarmArmAway"}
    ws.on('message', function incoming(rcv_msg) {
        log.verbose('[Alarm] WSS Server received message: ' + JSON.stringify(rcv_msg.toString('ascii')));
        let responseHandler = alarm_command_map[json_rcv_msg.command];
        responseHandler();
    });

    ws.on('close', function (code, reason) {
        log.info('[Alarm] Client disconnected: ' + ws._socket.remoteAddress + ' Code: ' + code + ' Reason: ' + reason);
    });

});

//////////////////////////////////////////////////////////////////
// Build Express Server - Creating Endpoints
//////////////////////////////////////////////////////////////////

// Used only to check if Alarm is running
app.get('/', function (req, res) {
    res.send('<html><body><h1>Hubitat Alarm Running</h1></body></html>');
});

// Used to arm the alarm using the alarm password
app.get('/api/alarmArm', function (req, res) {
    alarmArm();
    res.end();
});

// Used to arm the alarm in Away Mode (password not required)
app.get('/api/alarmArmAway', function (req, res) {
    alarmArmAway();
    res.end();
});

// Used to arm the alarm in Stay Mode (password not required)
app.get('/api/alarmArmStay', function (req, res) {
    alarmArmStay();
    res.end();
});

// Used to arm the alarm in Night Mode (password required)
app.get('/api/alarmArmNight', function (req, res) {
    alarmArmNight();
    res.end();
});

// Used to enable descriptive control
app.get('/api/descriptiveControl', function (req, res) {
    descriptiveControl();
});

// Used to disarm the alarm (need a password)
app.get('/api/alarmDisarm', function (req, res) {
    alarmDisarm();
    res.end();
});

// Used to enable or disable Chime
app.get('/api/alarmChimeToggle', function (req, res) {
    alarmChimeToggle();
    res.end();
});

// Used to activate Panic Siren
app.get('/api/alarmPanic', function (req, res) {
    alarmPanic();
});

// Used to activate Fire Siren
app.get('/api/alarmFire', function (req, res) {
    alarmFire();
});

// Used to activate Ambulance
app.get('/api/alarmAmbulance', function (req, res) {
    alarmAmbulance();
});

// Used to Set Alarm Date and Time
app.get('/api/alarmSetDate', function (req, res) {
    alarmSetDate();
});

// Used to Set Alarm Date and Time
app.get('/api/alarmUpdate', function (req, res) {
    alarmUpdate();
});

app.get('/api/alarmSpeedKeyA', function (req, res) {
    alarmSpeedKeyA();
});

app.get('/api/alarmSpeedKeyB', function (req, res) {
    alarmSpeedKeyB();
});

app.get('/api/alarmSpeedKeyC', function (req, res) {
    alarmSpeedKeyC();
});

app.get('/api/alarmSpeedKeyD', function (req, res) {
    alarmSpeedKeyD();
});

/**
 * Subscribe route used by Hubitat Hub to register for callback/notifications and write to config.json
 * @param {String} host - The Hubitat Hub IP address and port number
 */
app.get('/subscribe/:host', function (req, res) {
    let parts = req.params.host.split(':');
    nconf.set('notify:address', parts[0]);
    nconf.set('notify:port', parts[1]);
    nconf.save(function (err) {
        if (err) {
            log.error('Subscribe: Configuration error: ' + err.message);
            res.status(500).json({ error: 'Configuration error: ' + err.message });
            return;
        }
    });
    res.end();
    log.info('Subscribe: Hubitat IpAddress: ' + parts[0] + ' Port: ' + parts[1]);
});

// Used to save the Alarm password coming from Hubitat App
app.get('/config/:host', function (req, res) {
    let parts = req.params.host;
    if (parts != 'null') {
        nconf.set('alarm:alarmpassword', parts);
        nconf.save(function (err) {
            if (err) {
                log.error('SaveConfig: Configuration error: ' + err.message);
                res.status(500).json({ error: 'Configuration error: ' + err.message });
                return;
            }
        });
        log.info('SaveConfig: Alarm Panel Code Saved: ' + parts);
        alarmPassword = nconf.get('alarm:alarmpassword');
        log.info('SaveConfig: Alarm Panel Reloading Config File ' + alarmPassword);

    }
    else {
        log.error('SaveConfig: Failed to save Alarm Panel Code password cannot be null');
    }
    res.end();
});

/**
 * discover
 */
// Used to send all zones back to Hubitat
app.get('/discover', function (req, res) {
    alarmDiscover();
});

function alarmDiscover() {
    if (nconf.get('dscalarm:panelConfig')) {
        notify(JSON.stringify(nconf.get('dscalarm:panelConfig')));
        logger("AlarmDiscover", "Seding zones back: " + JSON.stringify(nconf.get('dscalarm:panelConfig')));
    } else {
        logger("AlarmDiscover", "PanelConfig not set.");
    }
    return;
}

// Alarm command Handlers
function alarmArm() {
    _alarm.alarm.alarmArm();
}

function alarmArmAway() {
    _alarm.alarm.alarmArmAway();
}

function alarmArmStay() {
    _alarm.alarm.alarmArmStay();
}

function alarmArmNight() {
    _alarm.alarm.alarmArmNight();
}

function descriptiveControl() {
    try {
        _alarm.alarm.descriptiveControl();
    } catch (error) {
        log.error('Command descriptiveControl not implemented for Honeywell alarm.');
    }
}

function alarmDisarm() {
    _alarm.alarm.alarmDisarm();
}

function alarmChimeToggle() {
    _alarm.alarm.alarmChimeToggle();
}

function alarmPanic() {
    try {
        _alarm.alarm.alarmPanic();

    } catch (error) {
        log.error('Command alarmPanic not implemented for Honeywell alarm.');
    }
}

function alarmFire() {
    try {
        _alarm.alarm.alarmFire();

    } catch (error) {
        log.error('Command alarmFire not implemented for Honeywell alarm.');
    }
}

function alarmAmbulance() {
    try {
        _alarm.alarm.alarmAmbulance();

    } catch (error) {
        log.error('Command alarmAmbulance not implemented for Honeywell alarm.');
    }
}

function alarmSetDate() {
    try {
        _alarm.alarm.alarmSetDate();

    } catch (error) {
        log.error('Command alarmSetDate not implemented for Honeywell alarm.');
    }
}

function alarmUpdate() {
    try {
        _alarm.alarm.alarmUpdate();

    } catch (error) {
        log.silly('Command alarmUpdate not implemented for Honeywell alarm.');
    }
}

function alarmSpeedKeyA() {
    try {
        _alarm.alarm.alarmSpeedKeyA();

    } catch (error) {
        log.error('Command alarmSpeedKeyA not implemented for DSC alarm.');
    }
}

function alarmSpeedKeyB() {
    try {
        _alarm.alarm.alarmSpeedKeyB();

    } catch (error) {
        log.error('Command alarmSpeedKeyB not implemented for DSC alarm.');
    }
}

function alarmSpeedKeyC() {
    try {
        _alarm.alarm.alarmSpeedKeyC();

    } catch (error) {
        log.error('Command alarmSpeedKeyC not implemented for DSC alarm.');
    }
}

function alarmSpeedKeyD() {
    try {
        _alarm.alarm.alarmSpeedKeyD();
    } catch (error) {
        log.error('Command alarmSpeedKeyD not implemented for DSC alarm.');
    }
}

// Alarm command handlers map
var alarm_command_map = {
    'alarmArm': alarmArm,
    'alarmArmAway': alarmArmAway,
    'alarmArmStay': alarmArmStay,
    'alarmArmNight': alarmArmNight,
    'descriptiveControl': descriptiveControl,
    'alarmDisarm': alarmDisarm,
    'alarmChimeToggle': alarmChimeToggle,
    'alarmPanic': alarmPanic,
    'alarmFire': alarmFire,
    'alarmAmbulance': alarmAmbulance,
    'alarmSetDate': alarmSetDate,
    'alarmUpdate': alarmUpdate,
    'alarmSpeedKeyA': alarmSpeedKeyA,
    'alarmSpeedKeyB': alarmSpeedKeyB,
    'alarmSpeedKeyC': alarmSpeedKeyC,
    'alarmSpeedKeyD': alarmSpeedKeyD
}

log.info('HTTP Endpoint: All HTTP endpoints loaded');

////////////////////////////////////////
// Creating Server
////////////////////////////////////////
let httpport = nconf.get('httpport');
server.listen(httpport);
log.info('[Alarm] HTTP Endpoint: HTTP Server started at port: ' + httpport);