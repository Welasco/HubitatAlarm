#!/bin/bash

# curl -SL https://raw.githubusercontent.com/Welasco/HubitatAlarm/master/Alarm/install.sh | sudo -E bash -
# sudo apt-get purge --auto-remove nodejs


INSTALL_DIR=/opt/Alarm

#Step 1) Check if root--------------------------------------
if [[ $EUID -ne 0 ]]; then
   echo "Please execute the installation script as root."
   exit 1
fi
#-----------------------------------------------------------

echo "Installing Hubitat Alarm"

install (){
  if [-d "$INSTALL_DIR"]; then
    echo "Hubitat Alarm detected"
    echo "Taking Backup of /opt/Alarm/config/config.json"
    cp /opt/Alarm/config/config.json /root
    if [ $? -eq 0]; then
        echo "Backup sucess"
    else
        echo "Backup Fail. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Updating Hubitat Alarm"
    wget -qO - https://github.com/Welasco/HubitatAlarm/archive/master.tar.gz | tar zx --strip-components=1 HubitatAlarm-master/Alarm -C /opt
    if [ $? -eq 0]; then
        echo "Hubitat Alarm update success"
    else
        echo "Hubitat Alarm failt to update. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Restoring Backup from /root/config.json to /opt/Alarm/config/config.json"
    cp /root/config.json /opt/Alarm/config/config.json
    if [ $? -eq 0]; then
        echo "Restore backup sucess"
    else
        echo "Fail to restore backup. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Instalation success"
  else
    echo "Hubitat Alarm New instalation detected"
    # apt-get update && sudo apt-get install unzip -y > /dev/null 2>&1
    echo "Downloading and extracting Hubitat Alarm"
    #wget -qO - https://api.github.com/repos/Welasco/HubitatAlarm/tarball/Dev | tar zx --strip-components=1 HubitatAlarm-master/Alarm
    #wget -qO - https://github.com/Welasco/HubitatAlarm/archive/master.tar.gz | tar zx --strip-components=1 HubitatAlarm-master/Alarm
    #tar -xzf HubitatAlarm.tar.gz --strip-components=1 HubitatAlarm-master/Alarm
    wget -qO - https://github.com/Welasco/HubitatAlarm/archive/master.tar.gz | tar zx --strip-components=1 HubitatAlarm-master/Alarm -C /opt
    if [ $? -eq 0]; then
        echo "Hubitat Alarm instalation success"
    else
        echo "Fail to install Hubitat Alarm. Exiting instalation. Error Code:" $?
        exit 1
    fi

    cd $INSTALL_DIR
    echo "Installing NPM Modules"
    npm install > /dev/null 2>&1
    if [ $? -eq 0]; then
        echo "NPM Modules installation success"
    else
        echo "Fail to install NPM Modules. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Setting Hubitat Alarm as a systemd service"
    cp $INSTALL_DIR/alarm.service /lib/systemd/system
    if [ $? -eq 0]; then
        echo "Copied alarm.service success"
    else
        echo "Fail to copy alarm.service to /lib/systemd/system. Exiting instalation. Error Code:" $?
        exit 1
    fi

    systemctl daemon-reload
    systemctl enable alarm
    if [ $? -eq 0]; then
        echo "Enabling alarm.service success"
    else
        echo "Fail to enable alarm.service. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Starting alarm service"
    sudo systemctl start alarm
    if [ $? -eq 0]; then
        echo "Service alarm.service started"
    else
        echo "Fail to start alarm.service. Exiting instalation. Error Code:" $?
        exit 1
    fi
    echo " "
    echo "Hubitat Alarm Installed at $INSTALL_DIR."
    echo "To watch the log use the command: sudo journalctl --follow -u alarm"
  fi
}

installNodeJS (){
  if $(uname -m | grep -Eq ^armv6); then
    echo "ARMV6 detected installing node-v14.17.6-linux-armv6l.tar.xz"
    # reference: https://blog.rodrigograca.com/how-to-install-latest-nodejs-on-raspberry-pi-0-w/
    # https://unofficial-builds.nodejs.org/download/release/v14.15.2/node-v14.15.2-linux-armv6l.tar.xz
    curl -o node-v14.17.6-linux-armv6l.tar.xz https://unofficial-builds.nodejs.org/download/release/v14.17.6/node-v14.17.6-linux-armv6l.tar.xz
    if [ $? -eq 0]; then
        echo "Downloading node-v14.17.6-linux-armv6l.tar.xz"
    else
        echo "Fail to download node-v14.17.6-linux-armv6l.tar.xz. Exiting instalation. Error Code:" $?
        exit 1
    fi


    tar -xzf node-v14.15.2-linux-armv6l.tar.xz
    if [ $? -eq 0]; then
        echo "Extracting node-v14.17.6-linux-armv6l.tar.xz"
    else
        echo "Fail to extract node-v14.17.6-linux-armv6l.tar.xz. Exiting instalation. Error Code:" $?
        exit 1
    fi
    sudo cp -r node-v14.15.2-linux-armv6l/* /usr/local/

  else
    echo "Invoking NodeJS 14 script"
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    if [ $? -eq 0]; then
        echo "NodeJS 14 script success"
    else
        echo "Fail to invoke NodeJS 14 script. Exiting instalation. Error Code:" $?
        exit 1
    fi

    sudo apt-get install -y nodejs
    if [ $? -eq 0]; then
        echo "Installing NodeJS 14 success"
    else
        echo "Fail to install NodeJS 14. Exiting instalation. Error Code:" $?
        exit 1
    fi
  fi
}

# Script initialization
if ! [ -x "$(command -v node)" ]; then
  installNodeJS
  install
else
  echo "NodeJS installation detected"
  nodeversion=$(node --version)
  mainversion=${nodeversion:1:2}
  #if $(node --version | grep -Eq v14); then
  if (( $mainversion >= 14 )); then
    echo "NodeJS already installed"
    echo "Node Version: "$(node --version)
    install
  else
    echo "An old NodeJS version was detected. Please update NodeJS to at least version V14 and try again current version: "$(node --version)
  fi
fi