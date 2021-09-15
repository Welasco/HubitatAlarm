#!/bin/bash

INSTALL_DIR=/opt/Alarm

#Step 1) Check if root--------------------------------------
if [[ $EUID -ne 0 ]]; then
   echo "Please execute the installation script as root."
   exit 1
fi
#-----------------------------------------------------------

echo "Uninstalling Hubitat Alarm"

echo "Removing Hubitat Alarm service"
rm -rf /lib/systemd/system/alarm.service
if [ $? -eq 0 ]; then
    echo "Hubitat Alarm service removed success"
else
    echo "Fail to remove Hubitat Alarm service. Exiting instalation. Error Code:" $?
    #exit 1
fi

echo "Reloading daemon"
sudo systemctl stop alarm
sudo systemctl daemon-reload
if [ $? -eq 0 ]; then
    echo "Daemon reloaded"
else
    echo "Fail to relload daemon. Exiting instalation. Error Code:" $?
    #exit 1
fi

echo "Removing Hubitat Alarm"
rm -rf /opt/Alarm
if [ $? -eq 0 ]; then
    echo "Hubitat Alarm Removed"
else
    echo "Fail to remove Hubitat Alarm. Exiting instalation. Error Code:" $?
    #exit 1
fi