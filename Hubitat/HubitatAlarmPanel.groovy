metadata {
  definition (name: "Hubitat Alarm Panel", namespace: "hubitatalarm", author: "victor@hepoca.com") {
    capability "Initialize"
    capability "Alarm"
    capability "Switch"
    capability "Refresh"

    attribute "alarmStatus", "string"
    attribute "systemStatus", "string"
    attribute "chime", "string"

    command "armAway"
    command "armHome"
    command "armNight"
    command "disarm"
    command "chimeToggle"
    command "alarmSetDate"

  }
}

def installed(){
  addChildDevices()
  webSocketConnect()
}

def updated(){
  addChildDevices()
  webSocketConnect()
}

def initialize() {
  webSocketConnect()
}

def uninstalled(){
  removeChildDevices()
}

private addChildDevices() {
  def zoneSettings = parent.getZonesSettingsChild()

  zoneSettings.each {
    def deviceId = it.networkId
    def deviceType = it.type == "contact" ? "Generic Component Contact Sensor" : it.type == "motion" ? "Generic Component Motion Sensor" : "Generic Component Smoke Detector"
    if (!getChildDevice(deviceId)) {
      def d = addChildDevice("hubitat", deviceType, deviceId, ["name": it.name, label: it.name, isComponent: true])
      log.info("Hubitat Alarm - Added zone device: DisplayName: ${d.displayName} - deviceId: ${deviceId}")
    }
  }
  getChildDevices().each{
    def findalldev = !zoneSettings.findAll{z -> z.networkId == it.deviceNetworkId}
    if(findalldev){
      log.info("Hubitat Alarm - Orphan Child Device detected. Deleting DisplayName: ${it.displayName} - deviceId: ${it.deviceNetworkId}")
      deleteChildDevice(it.deviceNetworkId)
    }
  }
}

private removeChildDevices() {
    getChildDevices().each { deleteChildDevice(it.deviceNetworkId) }
    log.info("Hubitat Alarm Panel - Removing all Zones child devices")
}

def alarmPanelparse(evt) {
  log.debug("Hubitat Alarm Panel - alarmPanelparse Processing command: $evt")
  sendEvent(name: "systemStatus", value: evt.description)

  if(location.hsmStatus == "armedAway" || location.hsmStatus == "armedHome" || location.hsmStatus == "armedNight"){
    sendEvent(name: "switch", value: "on")
  }
  else{
    sendEvent(name: "switch", value: "off")
  }

  // handle DSC Arm/Disarm modes
  if(evt.hsmstate){
    log.info("Hubitat Alarm Panel - alarmPanelparse Checking if event is 652 evt.code: ${evt.code}")
    if(evt.code == "652"){
      log.info("Hubitat Alarm Panel - alarmPanelparse Checking location.hsmStatus: ${location.hsmStatus}")
      if(location.hsmStatus == "armedAway" || location.hsmStatus == "armedHome" || location.hsmStatus == "armedNight"){
        log.info("Hubitat Alarm Panel - alarmPanelparse Alarm already armed. returning.")
        return
      }
    }
    parent.updateAlarmHSM(evt.hsmstate)
    sendEvent(name: "alarmStatus", value: evt.hsmstate)
  }

  if(evt.code == "901"){
    sendEvent(name: "chime", value: evt.state)
  }
  log.warn("evt.description ${evt.description}")
  if(evt.description.contains("CHIME")){
    sendEvent(name: "chime", value: 'ON')
  }
  else{
    sendEvent(name: "chime", value: 'OFF')
  }
}

def alarmZoneparse(evt) {
  log.debug("Hubitat Alarm Panel - alarmZoneparse Processing command: $evt")
  def zoneChildDevice = getChildDevice("${evt.type}-${evt.zone}")
  if(evt.state == "open"){
    log.warn("Zone child device evt.state ${evt.state}")
    if(zoneChildDevice.supportedAttributes[0].toString() == "contact"){
      zoneChildDevice.sendEvent(name: "contact", value: "open")
    }
    if(zoneChildDevice.supportedAttributes[0].toString() == "motion"){
      zoneChildDevice.sendEvent(name: "motion", value: "active")
    }
    if(zoneChildDevice.supportedAttributes[0].toString() == "smoke"){
      zoneChildDevice.sendEvent(name: "smoke", value: "detected")
    }
  }
  else if(evt.state == "closed"){
    if(zoneChildDevice.supportedAttributes[0].toString() == "contact"){
      zoneChildDevice.sendEvent(name: "contact", value: "closed")
    }
    if(zoneChildDevice.supportedAttributes[0].toString() == "motion"){
      zoneChildDevice.sendEvent(name: "motion", value: "inactive")
    }
    if(zoneChildDevice.supportedAttributes[0].toString() == "smoke"){
      zoneChildDevice.sendEvent(name: "smoke", value: "clear")
    }
  }
}

def off() {
  log.info("Hubitat Alarm Panel - issued command: Off")
  sendAlarmCommand("alarmDisarm")
}

def on() {
  log.info("Hubitat Alarm Panel - issued command: On")
  sendAlarmCommand("alarmArmAway")
}

def armAway() {
  log.info("Hubitat Alarm Panel - Sending armAway")
  sendAlarmCommand("alarmArmAway")
}

def armNight() {
  log.info("Hubitat Alarm Panel - Sending armNight")
  sendAlarmCommand("alarmArmNight")
}

def armHome() {
  log.info("Hubitat Alarm Panel - Sending armHome")
  sendAlarmCommand("alarmArmStay")
}

def disarm() {
  log.info("Hubitat Alarm Panel - Sending disarm")
  sendAlarmCommand("alarmDisarm")
}

def chimeToggle() {
  log.info("Hubitat Alarm Panel - Sending Toggling chime")
  sendAlarmCommand("alarmChimeToggle")
}

def siren() {
  log.info("Hubitat Alarm Panel - Sending alarmPanic")
  sendAlarmCommand("alarmPanic")
}

def strobe() {
  log.info("Hubitat Alarm Panel - Sending alarmFire")
  sendAlarmCommand("alarmFire")
}

def alarmSetDate() {
  log.info("Hubitat Alarm Panel - Sending alarmSetDate")
  sendAlarmCommand("alarmSetDate")
}

def refresh() {
  log.info("Hubitat Alarm Panel - Sending alarmUpdate")
  sendAlarmCommand("alarmUpdate")
}

def sendAlarmCommand(command) {
  if(parent.getSettings().communicationType == "API"){
    def path = "/api/$command"
    sendAsynchttpGet(path,'sendAlarmCommandcallback')
  }
  else if(parent.getSettings().communicationType == "WSS"){
    interfaces.webSocket.sendMessage('{"command":"' + command + '"}')
  }
}

def sendAlarmCommandcallback(response, data){
  try{
    log.info("Hubitat Alarm Panel - sendAlarmCommandcallback http response code: ${response.status} http response data ${response.errorData}")
  }
  catch(e){
    log.info("Hubitat Alarm Panel - sendAlarmCommandcallback http response code: ${response.status}")
  }
}

def sendAsynchttpGet(path,callback) {
  def parentSettings = parent.getSettings()
  def getParams = [
    uri: "http://$parentSettings.proxyAddress:$parentSettings.proxyPort/$path"
  ]
  asynchttpGet(callback, getParams)
}

def webSocketConnect(){
  if(parent.getSettings().communicationType == "WSS"){
    def parentSettings = parent.getSettings()
    try {
      interfaces.webSocket.connect("ws://$parentSettings.proxyAddress:$parentSettings.proxyPort/wss", pingInterval: 60)
    }
    catch(e) {
      log.error "Hubitat Alarm Panel - WebSocket connect failed error: ${e.message}"
    }
  }
  else if(parent.getSettings().communicationType == "API"){
    interfaces.webSocket.close()
  }
}

def webSocketStatus(String status){
    log.debug "Hubitat Alarm Panel - WebSocket webSocketStatus ${status}"

    if(status.contains("failure:")) {
      log.warn("Hubitat Alarm Panel - WebSocket failure message from web socket ${status}")
      reconnectWebSocket()
    }
    else if(status == 'status: open') {
      log.info "Hubitat Alarm Panel - WebSocket is open"
    }
    else if (status == "status: closing"){
      log.warn "Hubitat Alarm Panel - WebSocket connection closing."
      reconnectWebSocket()
    }
    else {
      log.warn "Hubitat Alarm Panel - WebSocket error, reconnecting."
      reconnectWebSocket()
    }
}

def reconnectWebSocket() {
    log.info("Hubitat Alarm Panel - WebSocket reconnecting in 10 seconds")
    interfaces.webSocket.close()
    runIn(10, webSocketConnect)
}

// This method must exist
// it's used by hubitat to process the device message
def parse(evt) {
  if(parent.getSettings().communicationType == "API"){
    try{
      def map = parseLanMessage(evt)
      def headers = map.headers;
      def body = map.data;

      if (headers.'device' != 'alarm') {
        log.debug("Hubitat Alarm - Received event ${evt} but it didn't came from Alarm")
        return
      }

      log.debug("Hubitat Alarm Panel: Received Command ${body}")
      if(body.type == "partition"){
        // process Alarm panel partition event
        alarmPanelparse(body)
      }
      else if(body.type == "zone"){
        // process Alarm zone event
        alarmZoneparse(body)
      }
    }
    catch(MissingMethodException){
      // these are events with description: null and data: null, so we'll just pass.
      pass
    }
  }
  else if(parent.getSettings().communicationType == "WSS"){
    // process WSS message
    try{
      def wssevt = new groovy.json.JsonSlurper().parseText(evt)
      log.warn("Hubitat Alarm Panel - WSS received command ${wssevt}")
      if(wssevt.type == "partition"){
        alarmPanelparse(wssevt)
      }
      else if(wssevt.type == "zone"){
        alarmZoneparse(wssevt)
      }
    }
    catch(e){
      log.debug("Hubitat Alarm Failed to parse json wssevt = ${e}")
      return
    }
  }
}