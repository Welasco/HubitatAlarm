/**
 *  DSCOpenCloseDeviceType
 *
 *  Author: Victor Santana
 *  
 *  Date: 07/11/2021
 */

// for the UI
metadata {
  definition (name: "DSCAlarmV2 Zone Contact", namespace: "DSCAlarmV2", author: "victor@hepoca.com") {
    // Change or define capabilities here as needed
    capability "Refresh"
    capability "Contact Sensor"
    capability "Polling"
    capability "Sensor"

    // Add commands as needed
    command "updatedevicezone"
  }
}

// handle commands
def updatedevicezone(String cmd) {
  parent.writeLog("DSCAlarmSmartAppV2 Contact Device Type - Processing command: $cmd")
	if(cmd.substring(3,9).substring(0,3) == "609"){
		sendEvent (name: "contact", value: "open")
    //parent.writeLog("info","DSC Zone ${device} value: Open")
	}
	else if (cmd.substring(3,9).substring(0,3) == "610"){
		sendEvent (name: "contact", value: "closed")
    //parent.writeLog("info","DSC Zone ${device} value: Closed")
	}
}