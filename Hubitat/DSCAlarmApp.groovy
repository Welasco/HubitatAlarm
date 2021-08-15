/**
 *  DSCAlarmApp
 *
 *  Author: Victor Santana
 *  Date: 07-11-2021
 */

definition(
    name: "DSCAlarmV2 App",
    namespace: "dscalarmappv2",
    author: "Victor Santana",
    description: "SmartApp DSCAlarmV2",
    category: "Safety & Security",
    iconUrl: "https://graph.api.smartthings.com/api/devices/icons/st.Home.home3-icn",
    iconX2Url: "https://graph.api.smartthings.com/api/devices/icons/st.Home.home3-icn?displaySize=2x",
    iconX3Url: "https://graph.api.smartthings.com/api/devices/icons/st.Home.home3-icn?displaySize=3x",
    singleInstance: true,
    oauth: true
)

import groovy.json.JsonBuilder
import groovy.json.JsonSlurper

preferences {
	page(name: "page1")
}

def page1() {
  dynamicPage(name: "page1", install: true, uninstall: true) {
    section("NodeAlarm Raspberry") {
      input "proxyAddress", "text", title: "Proxy Address", description: "(ie. 192.168.1.10)", required: true
      input "proxyPort", "text", title: "Proxy Port", description: "(ie. 3000)", required: true, defaultValue: "3000"
    }
    section("DSCAlarm Arm Disarm") {
      input "securityCode", "password", title: "Security Code", description: "User code to arm/disarm the security panel", required: true
      input "enableDiscovery", "bool", title: "Discover Zones (WARNING: all existing zones will be removed)", required: false, defaultValue: false
    }

    section("Smart Home Monitor") {
      input "enableSHM", "bool", title: "Integrate with Smart Home Monitor", required: true, defaultValue: true
    }

		section("Enable Debug Log at Hubitat IDE"){
			input "idelog", "bool", title: "Select True or False:", defaultValue: false, required: false
		}     
  }
}

def installed() {
  writeLog("info","DSCAlarmSmartAppV2 - DSCInstalled with settings: ${settings}")
	initialize()
  addDSCAlarmDeviceType()
  updated()
}

def updated() {
  if (settings.enableDiscovery) {
    removeZoneChildDevices()
  }  
  writeLog("info","DSCAlarmSmartAppV2 - Updated with settings: ${settings}")
  updateDSCAlarmDeviceType()
	//unsubscribe()
	initialize()
  sendCommand('/subscribe/'+getNotifyAddress())
  sendCommand('/config/'+settings.securityCode)
  if (settings.enableDiscovery) {
    //delay discovery for 5 seconds
    runIn(5, discoverChildDevices)
    runIn(15, alarmUpdate)
    settings.enableDiscovery = false
  }
  
}

def initialize() {
    subscribe(location, null, lanResponseHandler, [filterEvents:false])
    //subscribe(location, "alarmSystemStatus", alarmHandler)
    subscribe(location, "hsmStatus", alarmHandler)
    subscribe(location, "hsmRules", alarmHandlerhsmRules)
    subscribe (location, "hsmAlerts", alarmHandlerhsmAlerts)
    writeLog("info","DSCAlarmSmartAppV2 - Initialize")
}

def uninstalled() {
    removeChildDevices()
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
    //writeLog("debug","DSCAlarmSmartAppV2 - Method lanResponseHandler: ${map}")
    // def headers = getHttpHeaders(map.headers);
    // def body = getHttpBody(map.body);

    def headers = map.headers;
    def body = map.data;      

    if (headers.'device' != 'dscalarm') {
      writeLog("debug","DSCAlarmSmartAppV2 - Received event ${evt} but it didn't came from DSCAlarm")
      writeLog("debug","DSCAlarmSmartAppV2 - Received event but it didn't came from DSCAlarm headers:  ${headers}")
      writeLog("debug","DSCAlarmSmartAppV2 - Received event but it didn't came from DSCAlarm body: ${body}")      
      return
    }

    //log.trace "Honeywell Security event: ${evt.stringValue}"
    //writeLog("debug","DSCAlarmSmartAppV2 - Received event headers:  ${headers}")
    //writeLog("debug","DSCAlarmSmartAppV2 - Received event body: ${body}")
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
    //sendLocationEvent(name: "hsmSetArm", value: atomicState.alarmSystemStatus)
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

def discoverChildDevices() {
  sendCommand('/discover')
  writeLog("info","DSCAlarmSmartAppV2 - Sending discovery request")
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
  //def deviceId = 'dscalrpanel'

  //def deviceIP = settings.proxyAddress
  //def devicePort = settings.proxyPort
  //def deviceSettings = deviceIP+":"+devicePort
  def deviceId = GetDSCAlarmID()
  if (!getChildDevice(deviceId)) {
    def d = addChildDevice("DSCAlarmV2", "DSCAlarmV2 Alarm Panel", deviceId, ["name": "DSCAlarmV2 Alarm Panel", label: "DSCAlarmV2 Alarm Panel", completedSetup: true])
    //def d = addChildDevice("TemperatureSensor", "Temperature Sensor", deviceIdhex, ["name": deviceSettings, label: deviceName, completedSetup: true])
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
  //return settings.hostHub.localIP + ":" + settings.hostHub.localSrvPortTCP
  def hub = location.hubs[0]
  //writeLog("debug","DSCAlarmSmartAppV2 - Method getNotifyAddress called: localIP: " + hub.localIP + " - localSrvPortTCP: " + hub.localSrvPortTCP)
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

private getHttpHeaders(headers) {
  def obj = [:]
  writeLog("debug","DSCAlarmSmartAppV2 - Method getHttpHeaders ${headers}")
  // new String(headers.decodeBase64()).split("\r\n").each {param ->
  //   def nameAndValue = param.split(":")
  //   obj[nameAndValue[0]] = (nameAndValue.length == 1) ? "" : nameAndValue[1].trim()
  // }
  new String(headers).split("\r\n").each {param ->
    def nameAndValue = param.split(":")
    obj[nameAndValue[0]] = (nameAndValue.length == 1) ? "" : nameAndValue[1].trim()
  }  
  return obj
}

private getHttpBody(body) {
  writeLog("debug","DSCAlarmSmartAppV2 - Method getHttpBody ${body}")
  def obj = null;
  if (body) {
    def slurper = new JsonSlurper()
    //obj = slurper.parseText(new String(body.decodeBase64()))
    obj = slurper.parseText(body)
  }
  return obj
}

private String convertIPtoHex(ipAddress) {
  return ipAddress.tokenize( '.' ).collect {  String.format( '%02x', it.toInteger() ) }.join().toUpperCase()
}

private String GetDSCAlarmID(){
    def deviceIP = settings.proxyAddress
    def deviceId = deviceIP.tokenize( '.' )*.toInteger().asType( byte[] ).encodeHex().toString().toUpperCase()
    return deviceId
}

private String convertPortToHex(port) {
  return port.toString().format( '%04x', port.toInteger() ).toUpperCase()
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