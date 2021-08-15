let EventEmitter = require('events')
let Tail = require('tail').Tail;
var emitter;

class FileWatcher extends EventEmitter {
    constructor(){
        super();
        emitter = this;
        this.tail = new Tail("test.txt");
        this.readAlarmData();
        //this.testEvent();
    }
    readAlarmData(){
        this.tail.on("line", function(data) {
            //console.log("Log - new line in file: "+data);
            emitter.emit("read",data);
        });

        this.tail.on("error", function(error) {
            console.log('ERROR: ', error);
            emitter.emit("error",error);
        });        
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
exports.FileWatcher = FileWatcher