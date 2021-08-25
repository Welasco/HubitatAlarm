const EventEmitter = require('events');
const nconf = require('nconf');
nconf.file({ file: './config/config.json' });
const alarmType = nconf.get('alarm:alarmType');

var self;
class alarm_interface extends EventEmitter {
    constructor(){
        super();
        self = this;
        this.init();
    }
    init(){
        switch (alarmType) {
            case 'dsc':
                this.#dsc();
                break;

            case 'honeywell':
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