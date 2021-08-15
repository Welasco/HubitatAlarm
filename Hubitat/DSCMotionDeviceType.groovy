/**
 *  DSCOpenCloseDeviceType
 *
 *  Author: Victor Santana
 *   based on work by XXX
 *  
 *  Date: 2017-03-26
 */

// for the UI
metadata {
  definition (name: "DSCAlarmV2 Zone Motion", namespace: "DSCAlarmV2", author: "victor@hepoca.com") {
    // Change or define capabilities here as needed
    capability "Motion Sensor"
    capability "Sensor"

    // Add commands as needed
    command "updatedevicezone"
  }

  simulator {
    // Nothing here, you could put some testing stuff here if you like
  }

  tiles {
    // Main Row
		standardTile("zone", "device.motion", width: 2, height: 2) {
			state("active", label:'motion', icon:"st.motion.motion.active", backgroundColor:"#53a7c0")
			state("inactive", label:'no motion', icon:"st.motion.motion.inactive", backgroundColor:"#ffffff")
		}    

    // This tile will be the tile that is displayed on the Hub page.
    main "zone"

    // These tiles will be displayed when clicked on the device, in the order listed here.
    details(["zone"])
  }
}

// handle commands
def updatedevicezone(String cmd) {
  parent.writeLog("DSCAlarmSmartAppV2 Motion Device Type - Processing command: $cmd")
	if(cmd.substring(3,9).substring(0,3) == "609"){
		sendEvent (name: "motion", value: "active")
    parent.writeLog("DSCAlarmSmartAppV2 Motion Device Type - Changed to: Active")
	}
	else if (cmd.substring(3,9).substring(0,3) == "610"){
		sendEvent (name: "motion", value: "inactive")
    parent.writeLog("DSCAlarmSmartAppV2 Motion Device Type - Changed to: Inactive")
	}
}
