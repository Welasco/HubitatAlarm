const EventEmitter = require('events');
const nconf = require('nconf');
nconf.file({ file: './config/config.json' });
const alarmType = nconf.get('alarm:alarmType');

var self;
// This class can only produce one instance of an object
// If an object from this class get created twice the Alarm access will fail
// Neither DSC-IT100 or Envisalink allow multiple connections.
class alarm_interface extends EventEmitter {
    constructor(){
        super();
        self = this;
        this.init();
    }
    init(){
        switch (nconf.get('alarm:alarmType')) {
            case 'DSC':
                this.#dsc();
                break;

            case 'Honeywell':
                this.#honeywell();
                break;
            default:
                break;
        }
    }
    #dsc(){
        this.alarm = new (require('./dsc_alarm')).dsc_alarm;
        this.alarm.on('read',function (data) {
            self.emit('read',data);
        });
        this.alarm.on('error',function (error) {
            self.emit('error',error);
        })
    }
    #honeywell(){
        this.alarm = new (require('./honeywell_alarm')).honeywell_alarm;
        this.alarm.on('read',function (data) {
            self.emit('read',data);
        });
        this.alarm.on('error',function (error) {
            self.emit('error',error);
        })
    }
}
exports.alarm_interface = alarm_interface