const http = require("http");
const nconf = require('nconf');
const log = require('./logger');

var self;
class http_handler{
    constructor(){
        self = this;
    }
    notify(data){
        if (!nconf.get('notify:address') || nconf.get('notify:address').length == 0 ||
          !nconf.get('notify:port') || nconf.get('notify:port') == 0) {
          log.error('[HTTP-Handler] Notify server address and port not set!');
          return;
        }

        var opts = {
          method: 'NOTIFY',
          host: nconf.get('notify:address'),
          port: nconf.get('notify:port'),
          path: '/notify',
          headers: {
            'CONTENT-TYPE': 'application/json',
            'CONTENT-LENGTH': Buffer.byteLength(data),
            'device': 'alarm'
          }
        };

        var req = http.request(opts);
        req.on('error', function(err, req, res) {
            log.error('[HTTP-Handler] Notify error: '+err);
        });
        req.write(data);
        req.end();
    }
}
exports.http_handler = http_handler