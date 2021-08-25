const EventEmitter = require('events');
const honeywell_commands = require('./honeywell_commands').honeywell__commands;
const _honeywell_commands = new honeywell_commands();
const alarmEventParser = require('./honeywell_eventParser').honeywell_eventParser;
const _alarmEventParser = new alarmEventParser();

var second_socket_client_self;
class honeywell_alarm extends EventEmitter{
    constructor(){
        super();
        second_socket_client_self = this;
        this.init();
    }
    init(){
        this.#dsc();
    }
    #dsc(){
        this._socket_client = new (require('./envisalink')).envisalink;
        this._socket_client.on('read',function (data) {
            //second_socket_client_self.emit('read',data);
            data.toString('ascii').split('\r\n').forEach(function (item) {
                if (item.length != 0) {
                    //console.log('[HONEYWELL_ALARM] != 0');
                    console.log('[HONEYWELL_ALARM] item: '+item);
                    //console.log('[HONEYWELL_ALARM] item[0]: '+item[0]);
                    //logger('RX < '+data);
                    var code = item;
                    if (item[0] == '%' || item[0] == '^') {
                        code = item.split(',')[0];
                        item = item.slice(item.indexOf(',') + 1, -1);
                    }
                    console.log('[HONEYWELL_ALARM] Item: '+item+' Code: '+code);
                    var alarmEvent
                    try {
                        alarmEvent = _alarmEventParser.GetCode(code,item);
                        console.log('[HONEYWELL_ALARM] ItemalarmEvent: '+JSON.stringify(alarmEvent));
                        second_socket_client_self.emit('read',JSON.stringify(alarmEvent));
                    } catch (error) {
                        console.log('[HONEYWELL_ALARM] Error: '+error);
                    }
                    //var alarmEvent = _alarmEventParser.GetCode(code,item);
                    // console.log('[HONEYWELL_ALARM] ItemalarmEvent: '+JSON.stringify(alarmEvent));
                    // second_socket_client_self.emit('read',alarmEvent);
                    // the problem are here
                    // try {
                    //     second_socket_client_self.emit('read',_alarmEventParser.GetCode(code,item));
                    // } catch (error) {
                    //     console.log('[HONEYWELL_ALARM] Error: '+error);
                    // }

                }
            });
        })
        this._socket_client.on('error',function (error) {
            console.log('Error: '+error);
        })
    }
    sendCommand(cmd){
        this._socket_client.sendCommand(cmd);
    }
}
exports.honeywell_alarm = honeywell_alarm