let EventEmitter = require('events')
const FileWatcher = require("./file_watcher").FileWatcher;
const Socket = require("./socket_client").Socket;

var emitter;
class Alarm extends EventEmitter {
    constructor(connectionType){
        super();
        emitter = this;
        switch (alarm_type) {
            case "dsc":
                //console.log("switch case File_Watcher");
                this.tail = new FileWatcher();
                this.read_FileWatcher();
                break;

            case "honeywell":
                this.read_Socket();
                break;
            default:
                break;
        }

        //this.testEvent();
    }
    read_FileWatcher(){
        this.tail.on("read", function(data) {
            emitter.emit("read",data);
        });

        this.tail.on("error", function(error) {
            console.log('ERROR: ', error);
            emitter.emit("error",error);
        });
    }
    read_Socket(){
        this.socket = new Socket();
        this.socket.on("read",function (data) {
            emitter.emit("read",data);
        })

        this.socket.on("error", function(error) {
            console.log('ERROR: ', error);
            emitter.emit("error",error);
        });
    }
    send(msg){
        switch (alarm_type) {
            case "File_Watcher":
                //console.log("switch case File_Watcher");
                // this.tail = new FileWatcher();
                // this.read_FileWatcher();
                break;

            case "Socket":
                this.socket.send(msg);
                break;
            default:
                break;
        }
    }
    stop(){
        this.tail.unwatch()
    }
    resume(){
        this.tail.watch()
    }
    testEvent(msg){
        this.emit("read",msg);
    }
}
exports.Alarm = Alarm