const Ajv = require('ajv');
const ajv = new Ajv({ allErrors:true, removeAdditional:'all' });
const alarmConfigSchema = {
    "required": [
        "alarmpassword",
        "SHM",
        "dsc_it100",
        "envisalink",
        "alarmType",
        "connectionType",
        "communicationType",
        "panelConfig"
    ],
    "properties": {
        "alarmpassword": {
            "$id": "#/properties/alarmpassword",
            "type": "string"
        },
        "SHM": {
            "$id": "#/properties/SHM",
            "type": "boolean"
        },
        "dsc_it100": {
            "required": [
                "linuxSerialUSBtty",
                "baudRate"
            ],
            "properties": {
                "linuxSerialUSBtty": {
                    "$id": "#/properties/dsc_it100/properties/linuxSerialUSBtty",
                    "type": "string"
                },
                "baudRate": {
                    "$id": "#/properties/dsc_it100/properties/baudRate",
                    "type": "integer"
                }
            },
            "$id": "#/properties/dsc_it100",
            "type": "object"
        },
        "envisalink": {
            "required": [
                "ip",
                "port",
                "password"
            ],
            "properties": {
                "ip": {
                    "$id": "#/properties/envisalink/properties/ip",
                    "type": "string"
                },
                "port": {
                    "$id": "#/properties/envisalink/properties/port",
                    "type": "string"
                },
                "password": {
                    "$id": "#/properties/envisalink/properties/password",
                    "type": "string"
                }
            },
            "$id": "#/properties/envisalink",
            "type": "object"
        },
        "alarmType": {
            "$id": "#/properties/alarmType",
            "type": "string"
        },
        "connectionType": {
            "$id": "#/properties/connectionType",
            "type": "string"
        },
        "communicationType": {
            "$id": "#/properties/communicationType",
            "type": "string"
        },
        "panelConfig": {
            "required": [
                "type",
                "zones"
            ],
            "properties": {
                "type": {
                    "$id": "#/properties/panelConfig/properties/type",
                    "type": "string"
                },
                "zones": {
                    "items": {
                        "required": [
                            "zone",
                            "type",
                            "networkId",
                            "name"
                        ],
                        "properties": {
                            "zone": {
                                "$id": "#/properties/panelConfig/properties/zones/items/properties/zone",
                                "type": "string"
                            },
                            "type": {
                                "$id": "#/properties/panelConfig/properties/zones/items/properties/type",
                                "type": "string"
                            },
                            "networkId": {
                                "$id": "#/properties/panelConfig/properties/zones/items/properties/networkId",
                                "type": "string"
                            },
                            "name": {
                                "$id": "#/properties/panelConfig/properties/zones/items/properties/name",
                                "type": "string"
                            }
                        },
                        "$id": "#/properties/panelConfig/properties/zones/items",
                        "type": "object"
                    },
                    "$id": "#/properties/panelConfig/properties/zones",
                    "type": "array"
                }
            },
            "$id": "#/properties/panelConfig",
            "type": "object"
        }
    },
    "$id": "http://example.org/alarm.json#",
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#"
}

const commandWSSSchema = {
    "required": [
        "command"
    ],
    "properties": {
        "command": {
            "$id": "#/properties/command",
            "type": "string"
        }
    },
    "$id": "http://example.org/commandwss.json#",
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#"
}

const subscribeSchema = {
    "required": [
        "address",
        "port"
    ],
    "properties": {
        "address": {
            "$id": "#/properties/address",
            "type": "string"
        },
        "port": {
            "$id": "#/properties/port",
            "type": "string"
        }
    },
    "$id": "http://example.org/subscribe.json#",
    "type": "object",
    "definitions": {},
    "$schema": "http://json-schema.org/draft-07/schema#"
}

const alarm_schema_map = {
    'alarmConfigSchema': alarmConfigSchema,
    'commandWSSSchema': commandWSSSchema,
    'subscribeSchema': subscribeSchema
}

function checkJsonSchema(schema,data){
    let schema_checker = alarm_schema_map[schema];
    if (ajv.validate(schema_checker,data)) {
        return true;
    }
    else{
        return false;
    }
}
module.exports.checkJsonSchema = checkJsonSchema;