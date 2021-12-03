# Hubitat Alarm

Hubitat Alarm is a solution to integrate [DSC (IT-100 or Envisalink)](https://www.dsc.com/) and [Honeywell (Envisalink)](https://www.honeywellhome.com/) alarm system to Hubitat.

Currently it support the following scenarios:

## DSC Alarm

**DSC with IT-100**

IT-100 is a serial board (RS-232) that can be integrated with DSC Alarm system. It implement an interface to interact with DSC main Alarm board by sending/receiving commands. [Detailed information.](./Documentation/DSC-it100.pdf)

**DSC with Envisalink**

- Envisalink is a Ethernet board that can be integrated with DSC Alarm system. It implement an interface to interact with DSC main Alarm board by sending/receiving commands. [Detailed information.](./Documentation/EnvisaLinkTPI-ADEMCO-1-03.pdf)

## Honeywell Alarm

**Honeywell with Envisalink**

- Envisalink is a Ethernet board that can be integrated with DSC Alarm system. It implement an interface to interact with DSC main Alarm board by sending/receiving commands. [Detailed information.](./Documentation/EnvisaLinkTPI-ADEMCO-1-03.pdf)

You can chose what better fit your automation plan.

Here is a diagram how of how it works:

![Hubitat Diagram](./media/HubitatAlarm.svg)