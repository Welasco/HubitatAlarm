//https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/
'use strict';
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');
//const filename = path.join(__dirname, 'alarm.log');
var nconf = require('nconf');

nconf.file({ file: './config/config.json' });
const loglevel = nconf.get('log:loglevel');
const logtofile = nconf.get('log:logtofile');
const filename = nconf.get('log:logfilepath');

try { fs.unlinkSync(filename); }
catch (ex) { }

const logconsole = createLogger({
  level: loglevel,
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
      new transports.Console()
    ]
});

const logfile = createLogger({
    level: loglevel,
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.File({ filename })
      ]
});

function error(msg) {
    logconsole.error(msg);
    logtofile ? logfile.error(msg):null;
}

function warn(msg) {
    logconsole.warn(msg);
    logtofile ? logfile.warn(msg):null;
}

function info(msg) {
    logconsole.info(msg);
    logtofile ? logfile.info(msg):null;
}

function http(msg) {
    logconsole.http(msg);
    logtofile ? logfile.http(msg):null;
}

function verbose(msg) {
    logconsole.verbose(msg);
    logtofile ? logfile.verbose(msg):null;
}

function debug(msg) {
    logconsole.debug(msg);
    logtofile ? logfile.debug(msg):null;
}

function silly(msg) {
    logconsole.silly(msg);
    logtofile ? logfile.silly(msg):null;
}

module.exports.error = error;
module.exports.warn = warn;
module.exports.info = info;
module.exports.http = http;
module.exports.verbose = verbose;
module.exports.debug = debug;
module.exports.silly = silly;

