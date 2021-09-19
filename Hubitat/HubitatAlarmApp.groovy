definition(
    name: "Hubitat Alarm",
    namespace: "hubitatalarm",
    author: "Victor Santana",
    description: "Hubitat Alarm App",
    category: "Safety & Security",
    iconUrl: "",
    iconX2Url: "",
    iconX3Url: "",
    importUrl: "https://github.com/Welasco/HubitatAlarm",
    singleInstance: true
)

import groovy.json.JsonBuilder
import groovy.json.JsonSlurper

///////////////////
// Menu Section
///////////////////
preferences {
  page(name: "mainpage")
  page(name: "zonesPage")
}

def mainpage() {
  dynamicPage(name: "mainpage", install: true, uninstall: true) {
    if(app.getInstallationState() == "INCOMPLETE"){
      section{
        input "importSettingsinput", "bool", title: "Import Settings", required: true, defaultValue: false, submitOnChange: true
      }
      if(importSettingsinput==true){
        section{
          paragraph "<b>Description: </b>It will import all settings (alarm password, zones, connection type, envisalink/dsc-it100):"
          input "proxyAddress", "text", title: "Alarm Address", description: "Enter Alarm Address (ie. 192.168.1.10)", required: true, width:4
          input "proxyPort", "text", title: "Alarm Port", description: "(ie. 3000)", required: true, defaultValue: "3000", width:4
        }
      }
    }
    if(importSettingsinput==false || importSettingsinput == null || app.getInstallationState() == "COMPLETE"){
      section{
        paragraph "<b>Alarm Settings</b>"
        input "proxyAddress", "text", title: "Alarm Address", description: "Enter Alarm Address (ie. 192.168.1.10)", required: true, width:4
        input "proxyPort", "text", title: "Alarm Port", description: "(ie. 3000)", required: true, defaultValue: "3000", width:4
        input "securityCode", "password", title: "Alarm Security Code", description: "User code to arm/disarm the security panel", required: true, width:4
        input "communicationType", "enum", title: "Choose alarm communication (WSS/API)", options: ["WSS","API"],required: true, defaultValue: "WSS", width:4
      }
      section{
        input "alarmtype", "enum", title: "Choose alarm type (DSC/Honewell):", options: ["DSC","Honeywell"], required: true, submitOnChange: true, multiple: false, width:4
      }
      if(alarmtype == "DSC"){
        section{
          input "alarmDSCconnectionType", "enum", title: "Choose DSC connection type (DSC-IT100/Envisalink):", options: ["DSC-IT100","Envisalink"], required: true, submitOnChange: true, multiple: false, width:4
        }
        if(alarmDSCconnectionType=="DSC-IT100"){
          section{
            input "alarmDSCserialPath", "text", title: "Type the connected USB Serial path:", required: true, submitOnChange: true, defaultValue: "/dev/ttyUSB0", width:4
          }
        }
        else if(alarmDSCconnectionType=="Envisalink"){
          section{
            paragraph "<b>Envisalink Settings</b>"
            input "envisalinkAddress", "text", title: "Envisalink Address", description: "(ie. 192.168.1.20)", required: true, width:4
            input "envisalinkPort", "text", title: "Envisalink Port", description: "(ie. 4025)", required: true, defaultValue: "4025", width:4
            input "envisalinksecurityCode", "password", title: "Envisalink Security Code", description: "By default Envisalink code is: user", required: true, defaultValue: "user", width:4
          }
        }
      }
      else if(alarmtype == "Honeywell"){
        section{
          paragraph "<b>Envisalink Settings</b>"
          input "envisalinkAddress", "text", title: "Envisalink Address", description: "(ie. 192.168.1.20)", required: true, width:4
          input "envisalinkPort", "text", title: "Envisalink Port", description: "(ie. 4025)", required: true, defaultValue: "4025", width:4
          input "envisalinksecurityCode", "password", title: "Envisalink Security Code", description: "By default Envisalink code is: user", required: true, defaultValue: "user", width:4
        }
      }

      if(app.getInstallationState() == "COMPLETE"){
        section {
          paragraph "<b>Configure Alarm Zones</b>"
          href (name: "zonesPage",
            title: "Configure Alarm Zones settings",
            description: none,
            image: "",
            required: true,
            page: "zonesPage",
            width:4
          )
        }
      }
      else{
        section{
          paragraph "<b>Configure Alarm Zones</b>"
          paragraph "Description: Add the amount of zones currently in use."
          input "zones", "number", title: "How many Zones? (1-64)", description: "Enter the amount of installed zones", range: "1..64", required: true, submitOnChange: true, width:4
        }
        if(zones>=1){
          if(zones<=64){
            section{
              (1..zones).each{
                def inputZoneCode = (it.toString().length() == 1) ? '00'+it.toString() : (it.toString().length() == 2)? '0'+it.toString(): it.toString();
                input name: "zone-networkid-$inputZoneCode", type: "number", title: "Set Zone Network ID for zone-$inputZoneCode", defaultValue: "$inputZoneCode", submitOnChange: false, width:4, required: true
                input name: "zone-$inputZoneCode", type: "text", title: "Set Zone Name for zone-$inputZoneCode", submitOnChange: false, width:4, required: true
                input name: "zonetype-$inputZoneCode", type: "enum", title: "Set Zone Type for zone-$inputZoneCode", options: ["contact","motion","smoke"], defaultValue: "contact", submitOnChange: false, width:4
                paragraph "<br>"
              }
            }
          }
        }
      }
      section("Smart Home Monitor") {
        input "enableSHM", "bool", title: "Integrate with Smart Home Monitor", required: true, defaultValue: true
      }
      section("Enable Debug Log at Hubitat IDE"){
        input "idelog", "bool", title: "Select True or False:", defaultValue: false, required: false
      }
    }
  }
}

def zonesPage(){
  dynamicPage(name: "zonesPage", title: "Configure Alarm Zones settings", install: false, uninstall: false) {
    section{
      paragraph "Description: Add the amount of zones currently in use."
      input "zones", "number", title: "How many Zones? (1-64)", description: "Enter the amount of installed zones", range: "1..64", required: true, submitOnChange: true, width:4
    }
    if(zones>=1){
      if(zones<=64){
        section{
          (1..zones).each{
            def inputZoneCode = (it.toString().length() == 1) ? '00'+it.toString() : (it.toString().length() == 2)? '0'+it.toString(): it.toString();
            input name: "zone-networkid-$inputZoneCode", type: "number", title: "Set Zone Network ID for zone-$inputZoneCode", defaultValue: "$inputZoneCode", submitOnChange: false, width:4, required: true
            input name: "zone-$inputZoneCode", type: "text", title: "Set Zone Name for zone-$inputZoneCode", submitOnChange: false, width:4, required: true
            input name: "zonetype-$inputZoneCode", type: "enum", title: "Set Zone Type for zone-$inputZoneCode", options: ["contact","motion","smoke"], defaultValue: "contact", submitOnChange: false, width:4
            paragraph "<br>"
          }
        }
      }
    }
  }
}

////////////////////////////////////////////////////////////
// Manage Alarm settings section
// Save all settings for a new instalation in the Alarm
// Update any possible changes in the Alarm
// Import settings from a previous instalation
////////////////////////////////////////////////////////////
def importAlarmSettings(){
  sendAsynchttpGet('config','importAlarmSettingsCallback')
}

def importAlarmSettingsCallback(response, data){
    log.info("Hubitat Alarm - importSettingsCallback status of http Get call is: ${response.status}")
    log.info("Hubitat Alarm - importSettingsCallback data is: ${response.data}")
    def slurper = new JsonSlurper()
    def obj = slurper.parseText(response.data)

    settings.securityCode = obj.alarmpassword
    app.updateSetting("securityCode", [type:"password", value: obj.alarmpassword])

    settings.enableSHM = obj.SHM
    app.updateSetting("enableSHM", [type:"bool", value: obj.SHM])

    settings.communicationType = obj.communicationType
    app.updateSetting("communicationType", [type:"enum", value: obj.communicationType])

    settings.alarmtype = obj.alarmType
    app.updateSetting("alarmtype", [type:"enum", value: obj.alarmType])

    settings.alarmDSCconnectionType = obj.connectionType
    app.updateSetting("alarmDSCconnectionType", [type:"enum", value: obj.connectionType])

    settings.alarmDSCserialPath = obj.dsc_it100.linuxSerialUSBtty
    app.updateSetting("alarmDSCserialPath", [type:"text", value: obj.dsc_it100.linuxSerialUSBtty])

    settings.envisalinkAddress = obj.envisalink.ip
    app.updateSetting("envisalinkAddress", [type:"text", value: obj.envisalink.ip])

    settings.envisalinkPort = obj.envisalink.port
    app.updateSetting("envisalinkPort", [type:"text", value: obj.envisalink.port])

    settings.envisalinksecurityCode = obj.envisalink.password
    app.updateSetting("envisalinksecurityCode", [type:"password", value: obj.envisalink.password])

    app.updateSetting("zones", [type:"number", value: obj.panelConfig.zones.size])
    settings.zones = obj.panelConfig.zones.size
    obj.panelConfig.zones.each{
      app.updateSetting("zone-$it.zone", [type:"text", value: it.name])
      settings."zone-$it.zone" = it.name

      app.updateSetting("zonetype-$it.zone", [type:"enum", value: it.type])

      settings."zone-networkid-$it.zone" = it.networkId
      app.updateSetting("zone-networkid-$it.zone", [type:"text", value: it.networkId])
    }
}

def updateAlarmSettings(){
  def alarmConfigTemplate = getAlarmConfig()
  alarmConfigTemplate.alarmpassword = settings.securityCode
  alarmConfigTemplate.SHM = settings.enableSHM
  alarmConfigTemplate.communicationType = settings.communicationType
  alarmConfigTemplate.alarmType = settings.alarmtype
  alarmConfigTemplate.connectionType = settings.alarmDSCconnectionType != null ? settings.alarmDSCconnectionType : ""
  alarmConfigTemplate.dsc_it100.linuxSerialUSBtty = settings.alarmDSCserialPath != null ? settings.alarmDSCserialPath : ""
  alarmConfigTemplate.envisalink.ip = settings.envisalinkAddress != null ? settings.envisalinkAddress : ""
  alarmConfigTemplate.envisalink.port = settings.envisalinkPort != null ? settings.envisalinkPort : ""
  alarmConfigTemplate.envisalink.password = settings.envisalinksecurityCode != null ? settings.envisalinksecurityCode : ""

  alarmConfigTemplate.panelConfig.zones = getZonesSettings()
  log.info("Hubitat Alarm - updateAlarmSettings alarmConfigTemplate: ${alarmConfigTemplate}")
  sendAsynchttpPost('config',alarmConfigTemplate,'updateAlarmSettingsCallback')
}

def getZonesSettings(){
  def configZones = []
  for(int i = 1;i<=settings.zones;i++) {
    def zoneindex = (i.toString().length() == 1) ? '00'+i.toString() : (i.toString().length() == 2)? '0'+i.toString(): i.toString();
    def zoneName = settings."zone-$zoneindex"
    def zoneType = settings."zonetype-$zoneindex"
    def zoneNetworkId = (settings."zone-networkid-$zoneindex".toString().length() == 1) ? '00'+settings."zone-networkid-$zoneindex" : (settings."zone-networkid-$zoneindex".toString().length() == 2)? '0'+settings."zone-networkid-$zoneindex": settings."zone-networkid-$zoneindex";
    configZones << [
      "zone": zoneindex,
      "type": zoneType,
      "networkId": zoneNetworkId,
      "name": zoneName
    ]
  }
  return configZones
}

def getZonesSettingsChild(){
  def configZones = []
  for(int i = 1;i<=settings.zones;i++) {
    def zoneindex = (i.toString().length() == 1) ? '00'+i.toString() : (i.toString().length() == 2)? '0'+i.toString(): i.toString();
    def zoneName = settings."zone-$zoneindex"
    def zoneType = settings."zonetype-$zoneindex"
    def zoneNetworkId = (settings."zone-networkid-$zoneindex".toString().length() == 1) ? '00'+settings."zone-networkid-$zoneindex" : (settings."zone-networkid-$zoneindex".toString().length() == 2)? '0'+settings."zone-networkid-$zoneindex": settings."zone-networkid-$zoneindex";
    configZones << [
      "zone": zoneindex,
      "type": zoneType,
      "networkId": "zone-$zoneNetworkId",
      "name": zoneName
    ]
  }
  return configZones
}

def updateAlarmSettingsCallback(response, data){
  log.info("Hubitat Alarm - updateSettingsCallback: ${response.status}")
}

def hubSubscribeCallbackSettings(){
  def hubSubscribeSettings = [
    "address": location.hubs[0].getDataValue("localIP"),
    "port": location.hubs[0].getDataValue("localSrvPortTCP")
  ]
  sendAsynchttpPost('subscribe',hubSubscribeSettings,'hubSubscribeCallbackSettingshttpPostCallback')
}

def hubSubscribeCallbackSettingshttpPostCallback(response, data){
  log.info("Hubitat Alarm - hubSubscribeCallbackSettingshttpPostCallback: ${response.status}")
}

def sendAsynchttpGet(path,callback) {
  def getParams = [
        uri: "http://$settings.proxyAddress:$settings.proxyPort/$path"
  ]
  asynchttpGet(callback, getParams)
}

def sendAsynchttpPost(path,body,callback) {
  def postParams = [
		uri: "http://$settings.proxyAddress:$settings.proxyPort/$path",
		requestContentType: 'application/json',
		contentType: 'application/json',
    body : body
	]

	asynchttpPost(callback, postParams)
}

def getAlarmConfig(){
  return [
    "alarmpassword": "",
    "SHM": true,
    "dsc_it100": [
      "linuxSerialUSBtty": "/dev/ttyUSB0",
      "baudRate": 9600
    ],
    "envisalink": [
      "ip": "127.0.0.1",
      "port": "3001",
      "password": "user"
    ],
    "alarmType": "",
    "connectionType": "",
    "communicationType": "",
    "panelConfig": [
      "type": "discover",
      "zones": [
        [
          "zone": "001",
          "type": "contact",
          "networkId": "zone-001",
          "name": "Alarm Zone001"
        ]
      ]
    ]
  ]
}

// Hubitat Implementation Methods
def installed() {
  if(importSettingsinput==true){
    importAlarmSettings()
    hubSubscribeCallbackSettings()
  }
  else{
    hubSubscribeCallbackSettings()
    updateAlarmSettings()
  }
  log.info("Hubitat Alarm - Installed with settings: ${settings}")
  addHubitatAlarmPanel()
  initialize()
}

def updated() {
  log.info("Hubitat Alarm - Updated")
  hubSubscribeCallbackSettings()
  updateAlarmSettings()
  updateHubitatAlarmPanel()
  getChildDevice(GetDSCAlarmID()).updated()
  initialize()
}

def initialize() {
  subscribe(location, "hsmStatus", alarmHandler)
  subscribe(location, "hsmRules", alarmHandlerhsmRules)
  subscribe (location, "hsmAlerts", alarmHandlerhsmAlerts)
  atomicState.commandfromAlarm == false
  log.info("Hubitat Alarm App - Initialized")
}

def uninstalled() {
    removeChildDevices()
}

private addHubitatAlarmPanel() {
  def deviceId = GetDSCAlarmID()
  if (!getChildDevice(deviceId)) {
    def d = addChildDevice("hubitatalarm", "Hubitat Alarm Panel", deviceId, ["name": "Hubitat Alarm Panel", label: "Hubitat Alarm Panel", isComponent: true])
    log.info("Hubitat Alarm - Added Hubitat Alarm Panel DisplayName: ${d.displayName} - deviceId: ${deviceId}")
    runIn(10, initializeAlarmPanel)
  }
}

def initializeAlarmPanel(){
  getChildDevice(GetDSCAlarmID()).installed()
}

private updateHubitatAlarmPanel() {
    def deviceId = GetDSCAlarmID()
    getAllChildDevices().each {
        if(it.name == "Hubitat Alarm Panel"){
          it.setDeviceNetworkId(deviceId)
        }
      }
    log.debug("Hubitat Alarm - Updating Hubitat Alarm Panel DeviceNetworkId: ${deviceId}")
}

private removeChildDevices() {
    getAllChildDevices().each { deleteChildDevice(it.deviceNetworkId) }
    log.info("Hubitat Alarm - Removing all child devices")
}

def getSettings(){
  return settings
}

private String GetDSCAlarmID(){
    def deviceIP = settings.proxyAddress
    def deviceId = deviceIP.tokenize( '.' )*.toInteger().asType( byte[] ).encodeHex().toString().toUpperCase()
    return deviceId
}

def alarmHandler(evt) {
  log.debug("Hubitat Alarm - alarmHandler Method HSM alarmHandler: ${evt} ${evt.value} ${evt.descriptionText}")
  if (!settings.enableSHM) {
    return
  }
  log.debug("Hubitat Alarm - alarmHandler state commandfromAlarm: ${atomicState.commandfromAlarm}")
  def panelChildDevice = getChildDevice(GetDSCAlarmID())
  if(atomicState.commandfromAlarm == false){
    log.debug("Hubitat Alarm - alarmHandler HSM current status per Hubitat Alarm - ${atomicState.alarmSystemStatus}")
    if (evt.value == "armedHome") {
      panelChildDevice.armHome()
      panelChildDevice.sendEvent(name: "switch", value: "on")
    }
    if (evt.value == "armedNight") {
      panelChildDevice.armNight()
      panelChildDevice.sendEvent(name: "switch", value: "on")
    }
    if (evt.value == "armedAway") {
      panelChildDevice.armAway()
      panelChildDevice.sendEvent(name: "switch", value: "on")
    }
    if (evt.value == "disarmed") {
      panelChildDevice.disarm()
      panelChildDevice.sendEvent(name: "switch", value: "off")
    }
    if (evt.value == "allDisarmed") {
      panelChildDevice.disarm()
      panelChildDevice.sendEvent(name: "switch", value: "off")
    }
    atomicState.commandfromAlarm = false
    log.debug("Hubitat Alarm - alarmHandler HSM Status change from Hubitat HSM state commandfromAlarm: ${atomicState.commandfromAlarm}")
  }
  else{
    atomicState.commandfromAlarm = false
    log.debug("Hubitat Alarm - alarmHandler HSM Status change from Alarm Board. Do nothing. commandfromAlarm: ${atomicState.commandfromAlarm}")
  }
  if(evt.value == "allDisarmed" || evt.value == "disarmed"){
    atomicState.alarmSystemStatus = "disarmed"
  }
  else{
    atomicState.alarmSystemStatus = evt.value
  }
}

def alarmHandlerhsmRules(evt){
  log.debug("Hubitat Alarm - Method HSM alarmHandlerhsmRules: ${evt} ${evt.value} ${evt.descriptionText}")
}

def alarmHandlerhsmAlerts(evt){
  log.debug("Hubitat Alarm - Method HSM alarmHandlerhsmAlerts: ${evt} ${evt.value} ${evt.descriptionText}")
}

private updateAlarmHSM(partitionstatus) {
  if (!settings.enableSHM) {
    return
  }
  log.debug("Hubitat Alarm - updateAlarmSystemStatus Location.hsmStatus: ${location.hsmStatus}")
  log.debug("Hubitat Alarm - updateAlarmSystemStatus getlocation().hsmStatus: ${getLocation().hsmStatus}")
  def lastAlarmSystemStatus = atomicState.alarmSystemStatus
  if (partitionstatus == "armedHome") {
    atomicState.alarmSystemStatus = "armedHome"
  }
  if (partitionstatus == "armedNight") {
    atomicState.alarmSystemStatus = "armedNight"
  }
  if (partitionstatus == "armedAway") {
    atomicState.alarmSystemStatus = "armedAway"
  }
  if (partitionstatus == "disarmed") {
    atomicState.alarmSystemStatus = "disarmed"
  }
  if (partitionstatus == "allDisarmed") {
    atomicState.alarmSystemStatus = "allDisarmed"
  }
  if (lastAlarmSystemStatus != atomicState.alarmSystemStatus) {
    atomicState.commandfromAlarm = true
    if(atomicState.alarmSystemStatus == "armedAway"){
      sendLocationEvent(name: "hsmSetArm", value: "armAway")
    }
    if(atomicState.alarmSystemStatus == "armedNight"){
      sendLocationEvent(name: "hsmSetArm", value: "armNight")
    }
    if(atomicState.alarmSystemStatus == "armedHome"){
      sendLocationEvent(name: "hsmSetArm", value: "armHome")
    }
    if(atomicState.alarmSystemStatus == "disarmed"){
      sendLocationEvent(name: "hsmSetArm", value: "disarm")
    }
    if(atomicState.alarmSystemStatus == "allDisarmed"){
      sendLocationEvent(name: "hsmSetArm", value: "disarmAll")
    }
    log.debug("Hubitat Alarm - updateAlarmSystemStatus change state commandfromAlarm to: ${atomicState.commandfromAlarm} partitionstatus: ${partitionstatus}")
  }
  log.debug("Hubitat Alarm - updateAlarmSystemStatus lastAlarmSystemStatus: ${lastAlarmSystemStatus} atomicState.alarmSystemStatus: ${atomicState.alarmSystemStatus} atomicState.commandfromAlarm: ${atomicState.commandfromAlarm}")
}

// need to be reviewed but most probably no longer in use
// private getalarmSystemStatus(){
//   return atomicState.alarmSystemStatus
// }

private getProxyAddress() {
  return settings.proxyAddress + ":" + settings.proxyPort
}