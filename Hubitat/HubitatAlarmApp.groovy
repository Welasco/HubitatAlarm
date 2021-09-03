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
        input "enableDiscovery", "bool", title: "Discover Zones (WARNING: all existing zones will be removed)", required: false, defaultValue: false
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
    writeLog("info","Hubitat Alarm - importSettingsCallback status of http Get call is: ${response.status}")
    writeLog("info","Hubitat Alarm - importSettingsCallback data is: ${response.data}")
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
      app.updateSetting(it.networkId, [type:"text", value: it.name])
      settings."$it.networkId" = it.name
      app.updateSetting("zonetype-$it.zone", [type:"enum", value: it.type])
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

  def configZones = []
  for(int i = 1;i<=settings.zones;i++) {
    def zoneindex = (i.toString().length() == 1) ? '00'+i.toString() : (i.toString().length() == 2)? '0'+i.toString(): i.toString();
    def zoneName = settings."zone-$zoneindex"
    def zoneType = settings."zonetype-$zoneindex"
    configZones << [
      "zone": zoneindex,
      "type": zoneType,
      "networkId": "zone-$zoneindex",
      "name": zoneName
    ]
  }
  alarmConfigTemplate.panelConfig.zones = configZones
  writeLog("info","Hubitat Alarm - updateAlarmSettings alarmConfigTemplate: ${alarmConfigTemplate}")
  sendAsynchttpPost('config',alarmConfigTemplate,'updateAlarmSettingsCallback')
}

def updateAlarmSettingsCallback(response, data){
  writeLog("info","Hubitat Alarm - updateSettingsCallback: ${response.status}")
}

def hubSubscribeCallbackSettings(){
  def hubSubscribeSettings = [
    "address": location.hubs[0].getDataValue("localIP"),
    "port": location.hubs[0].getDataValue("localSrvPortTCP")
  ]
  sendAsynchttpPost('subscribe',hubSubscribeSettings,'hubSubscribeCallbackSettingshttpPostCallback')
}

def hubSubscribeCallbackSettingshttpPostCallback(response, data){
  writeLog("info","Hubitat Alarm - hubSubscribeCallbackSettingshttpPostCallback: ${response.status}")
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
    updateAlarmSettings()
    hubSubscribeCallbackSettings()
  }
  writeLog("info","Hubitat Alarm - Installed with settings: ${settings}")
  initialize()

  //addDSCAlarmDeviceType()
  //updated()
}

def updated() {
  writeLog("info","Hubitat Alarm - Updated")
  updateAlarmSettings()
  hubSubscribeCallbackSettings()

  // if (settings.enableDiscovery) {
  //   removeZoneChildDevices()
  // }
  // writeLog("info","DSCAlarmSmartAppV2 - Updated with settings: ${settings}")
  // updateDSCAlarmDeviceType()
    // //unsubscribe()
    // initialize()
  // sendCommand('/subscribe/'+getNotifyAddress())
  // sendCommand('/config/'+settings.securityCode)
  // if (settings.enableDiscovery) {
  //   //delay discovery for 5 seconds
  //   runIn(5, discoverChildDevices)
  //   runIn(15, alarmUpdate)
  //   settings.enableDiscovery = false
  // }

}

def initialize() {
    // subscribe(location, null, lanResponseHandler, [filterEvents:false])
    // //subscribe(location, "alarmSystemStatus", alarmHandler)
    // subscribe(location, "hsmStatus", alarmHandler)
    // subscribe(location, "hsmRules", alarmHandlerhsmRules)
    // subscribe (location, "hsmAlerts", alarmHandlerhsmAlerts)
    // writeLog("info","DSCAlarmSmartAppV2 - Initialize")
}

def uninstalled() {
    //removeChildDevices()
}

private removeChildDevices() {
    getAllChildDevices().each { deleteChildDevice(it.deviceNetworkId) }
    writeLog("info","DSCAlarmSmartAppV2 - Removing all child devices")
}

private removeZoneChildDevices() {
    def deviceId = GetDSCAlarmID()
    getAllChildDevices().each {
        if(it.deviceNetworkId != deviceId){
          deleteChildDevice(it.deviceNetworkId)
        }
      }
    writeLog("info","DSCAlarmSmartAppV2 - Removing all Zone child devices")
}

def alarmHandler(evt) {
  writeLog("debug","DSCAlarmSmartAppV2 - alarmHandler Method HSM alarmHandler: ${evt} ${evt.value} ${evt.descriptionText}")
  if (!settings.enableSHM) {
    return
  }
  writeLog("debug","DSCAlarmSmartAppV2 - alarmHandler state commandfromAlarm: ${atomicState.commandfromAlarm}")
  if(atomicState.commandfromAlarm == false){
    writeLog("debug","DSCAlarmSmartAppV2 - alarmHandler HSM current status per DSCAlarmSmartAppV2 - ${atomicState.alarmSystemStatus}")
    if (evt.value == "armedHome") {
      sendCommand('/api/alarmArmStay');
    }
    if (evt.value == "armedNight") {
      sendCommand('/api/alarmArmNight');
    }
    if (evt.value == "armedAway") {
      sendCommand('/api/alarmArmAway');
    }
    if (evt.value == "disarmed") {
      sendCommand('/api/alarmDisarm');
    }
    if (evt.value == "allDisarmed") {
      sendCommand('/api/alarmDisarm');
    }
    atomicState.commandfromAlarm = false
    writeLog("debug","DSCAlarmSmartAppV2 - alarmHandler HSM Status change from Hubitat HSM state commandfromAlarm: ${atomicState.commandfromAlarm}")
  }
  else{
    atomicState.commandfromAlarm = false
    writeLog("debug","DSCAlarmSmartAppV2 - alarmHandler HSM Status change from Alarm Board. Do nothing. commandfromAlarm: ${atomicState.commandfromAlarm}")
  }
  if(evt.value == "allDisarmed" || evt.value == "disarmed"){
    atomicState.alarmSystemStatus = "disarmed"
  }
  else{
    atomicState.alarmSystemStatus = evt.value
  }
}

def alarmHandlerhsmRules(evt){
  writeLog("debug","DSCAlarmSmartAppV2 - Method HSM alarmHandlerhsmRules: ${evt} ${evt.value} ${evt.descriptionText}")
}

def alarmHandlerhsmAlerts(evt){
  writeLog("debug","DSCAlarmSmartAppV2 - Method HSM alarmHandlerhsmAlerts: ${evt} ${evt.value} ${evt.descriptionText}")
}

def lanResponseHandler(evt) {
  try{
    def map = parseLanMessage(evt)
    def headers = map.headers;
    def body = map.data;

    if (headers.'device' != 'dscalarm') {
      writeLog("debug","DSCAlarmSmartAppV2 - Received event ${evt} but it didn't came from DSCAlarm")
      writeLog("debug","DSCAlarmSmartAppV2 - Received event but it didn't came from DSCAlarm headers:  ${headers}")
      writeLog("debug","DSCAlarmSmartAppV2 - Received event but it didn't came from DSCAlarm body: ${body}")
      return
    }

    processEvent(body)
  }
  catch(MissingMethodException){
        // these are events with description: null and data: null, so we'll just pass.
        pass
  }
}

// Check if the received event is for discover or update zone/alarm status
private processEvent(evt) {
  if (evt.type == "discover") {
    addChildDevices(evt.zones)
  }
  if (evt.type == "zone") {
    parserDSCCommand(evt.command)
  }
}

def parserDSCCommand(cmd) {
    writeLog("debug","DSCAlarmSmartAppV2 - Received Alarm Command: ${cmd}")
    if(cmd.length() >= 4){
        if(cmd.substring(0,2) == "ZN"){
            updateZoneDeviceType(cmd)
          updateAlarmDeviceType(cmd)
        }
        else{
            updateAlarmDeviceType(cmd)
        }
    }
}

private updateZoneDeviceType(String cmd) {
    def zoneidx = cmd.substring(6,9)
    def zonedeviceNetworkID = "dscalrzone" + zoneidx
  def zonedevice = getChildDevice(zonedeviceNetworkID)
  if (zonedevice) {
    zonedevice.updatedevicezone("${cmd}")
    writeLog("debug","DSCAlarmSmartAppV2 - Updating zone ${zonedeviceNetworkID} using Command: ${cmd}")
  }
}

private updateAlarmDeviceType(String cmd) {
    def alarmdeviceNetworkID = GetDSCAlarmID()
  def alarmdevice = getChildDevice(alarmdeviceNetworkID)
  if (alarmdevice) {
    alarmdevice.dscalarmparse("${cmd}")
    writeLog("debug","DSCAlarmSmartAppV2 - Updating Alarm Device ${alarmdeviceNetworkID} using Command: ${cmd}")
  }
}


private updateAlarmSystemStatus(partitionstatus) {
  if (!settings.enableSHM) {
    return
  }
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
    writeLog("debug","DSCAlarmSmartAppV2 - updateAlarmSystemStatus change state commandfromAlarm to: ${atomicState.commandfromAlarm}")
  }
  writeLog("debug","DSCAlarmSmartAppV2 - updateAlarmSystemStatus lastAlarmSystemStatus: ${lastAlarmSystemStatus} atomicState.alarmSystemStatus: ${atomicState.alarmSystemStatus} atomicState.commandfromAlarm: ${atomicState.commandfromAlarm}")
}

private getalarmSystemStatus(){
  return atomicState.alarmSystemStatus
}

def alarmUpdate() {
  sendCommand('/api/alarmUpdate')
  writeLog("info","DSCAlarmSmartAppV2 - Sending Alarm Update request")
}

private addChildDevices(zones) {
  zones.each {
    def deviceId = 'dscalrzone'+it.zone
    if (!getChildDevice(deviceId)) {
      it.type = it.type.capitalize()
      def d = addChildDevice("DSCAlarmV2", "DSCAlarmV2 Zone "+it.type, deviceId, ["name": it.name, label: it.name, completedSetup: true])
      writeLog("info","DSCAlarmSmartAppV2 - Added zone device: DisplayName: ${d.displayName} - deviceId: ${deviceId}")
    }
  }
}

private addDSCAlarmDeviceType() {
  def deviceId = GetDSCAlarmID()
  if (!getChildDevice(deviceId)) {
    def d = addChildDevice("DSCAlarmV2", "DSCAlarmV2 Alarm Panel", deviceId, ["name": "DSCAlarmV2 Alarm Panel", label: "DSCAlarmV2 Alarm Panel", completedSetup: true])
    writeLog("info","DSCAlarmSmartAppV2 - Added DSCAlarmDeviceType DisplayName: ${d.displayName} - deviceId: ${deviceId}")
  }
}

private updateDSCAlarmDeviceType() {
    def deviceId = GetDSCAlarmID()
    getAllChildDevices().each {
        if(it.name == "DSCAlarmV2 Alarm Panel"){
          it.setDeviceNetworkId(deviceId)
        }
      }
    writeLog("debug","DSCAlarmSmartAppV2 - Updating DSCAlarmV2 Alarm Panel DeviceNetworkId: ${deviceId}")
}

private getProxyAddress() {
  return settings.proxyAddress + ":" + settings.proxyPort
}

private getNotifyAddress() {
  def hub = location.hubs[0]
  writeLog("debug","DSCAlarmSmartAppV2 - Method getNotifyAddress called: localIP: " + hub.getDataValue("localIP") + " - localSrvPortTCP: " + hub.getDataValue("localSrvPortTCP"))
  return hub.getDataValue("localIP") + ":" + hub.getDataValue("localSrvPortTCP")
}

private sendCommand(path) {
  if (settings.proxyAddress.length() == 0 || settings.proxyPort.length() == 0) {
    log.error "Hubitat's Node Proxy configuration not set!"
    return
  }

  def host = getProxyAddress()
  def headers = [:]
  headers.put("HOST", host)
  headers.put("Content-Type", "application/json")
  headers.put("stnp-auth", settings.authCode)

  def hubAction = new hubitat.device.HubAction(
      method: "GET",
      path: path,
      headers: headers
  )
  sendHubCommand(hubAction)
}

private String convertIPtoHex(ipAddress) {
  return ipAddress.tokenize( '.' ).collect {  String.format( '%02x', it.toInteger() ) }.join().toUpperCase()
}

private String GetDSCAlarmID(){
    def deviceIP = settings.proxyAddress
    def deviceId = deviceIP.tokenize( '.' )*.toInteger().asType( byte[] ).encodeHex().toString().toUpperCase()
    return deviceId
}

private writeLog(type,message)
{
  if(type == "debug"){
    if(idelog){
      log.debug "${message}"
    }
  }
  else{
    log.info "${message}"
  }
}