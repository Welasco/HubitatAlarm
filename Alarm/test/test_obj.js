const _checkSchema = require('../tools/checkJsonSchema').checkSchema;
const nconf = require('nconf');
nconf.file({ file: './test_config.json' });

function get_alarm_config(data) {
    //nconf.set('alarm:alarmpassword', parts);
}

let alarm_received_obj = {
    "alarmpassword": "1234",
    "SHM": true,
    "dsc_it100":{
      "linuxSerialUSBtty": "/dev/ttyUSB0",
      "baudRate": 9600
    },
    "envisalink":{
      "ip": "127.0.0.1",
      "port": "3001",
      "password": "user"
    },
    "alarmType": "DSC",
    "connectionType": "Envisalink",
    "communicationType":"WSS",
    "panelConfig": {
      "type": "discover",
      "zones": [
        {
          "zone": "001",
          "type": "contact",
          "networkId": "zone-001",
          "name": "Alarm Zone001"
        },
        {
          "zone": "002",
          "type": "contact",
          "networkId": "zone-002",
          "name": "Alarm Zone002"
        },
        {
          "zone": "003",
          "type": "contact",
          "networkId": "zone-003",
          "name": "Alarm Zone003"
        },
        {
          "zone": "004",
          "type": "contact",
          "networkId": "zone-004",
          "name": "Alarm Zone004"
        },
        {
          "zone": "005",
          "type": "contact",
          "networkId": "zone-005",
          "name": "Alarm Zone005"
        },
        {
          "zone": "006",
          "type": "contact",
          "networkId": "zone-006",
          "name": "Alarm Zone006"
        }
      ]
    }
};
console.log(alarm_received_obj);

let alarm_config = '';
if (_checkSchema('alarmConfigSchema',alarm_received_obj)) {
    console.log('Valid schema');
    nconf.set('alarm', alarm_received_obj);
    nconf.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });
}
else{
    console.log('Schema Invalid');
}
// nconf.set('alarm', alarm_received_obj);
// nconf.save(function (err) {
//     if (err) {
//         console.log(err);
//         return;
//     }
// });

// let alarm_config = {};
// alarm_config.alarmpassword= '';
// alarm_config.SHM = true;
// alarm_config.dsc_it100={};
// alarm_config.dsc_it100.linuxSerialUSBtty= '/dev/ttyUSB0';
// alarm_config.dsc_it100.baudRate= 9600;
// alarm_config.envisalink={}
// alarm_config.envisalink.ip= '127.0.0.1';
// alarm_config.envisalink.port= '3001';
// alarm_config.envisalink.password = 'user';
// alarm_config.alarmType= 'DSC';
// alarm_config.connectionType= 'Envisalink';
// alarm_config.communicationType='WSS';
// alarm_config.panelConfig= {};
// alarm_config.panelConfig.type= 'discover';
// alarm_config.panelConfig.zones= [];
// alarm_config.panelConfig.zones.push(
//     {
//         zone= '001',
//         type= 'contact',
//         networkId= 'zone-001',
//         name= 'Alarm Zone001'
//     }
// );
// console.log(alarm_config);