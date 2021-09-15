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
  if [ -d "$INSTALL_DIR" ]; then
    echo "Hubitat Alarm detected"
    backup

    installhubitatalarm
    installnpm

    restore
    setupsystemd

    echo "Update success"
    echo "Hubitat Alarm Installed at $INSTALL_DIR."
    echo "To watch the log use the command: sudo journalctl --follow -u alarm"

  else
    installhubitatalarm
    installnpm
    setupsystemd

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
    echo "Downloading node-v14.17.6-linux-armv6l.tar.xz"
    curl -o node-v14.17.6-linux-armv6l.tar.xz https://unofficial-builds.nodejs.org/download/release/v14.17.6/node-v14.17.6-linux-armv6l.tar.xz
    if [ $? -eq 0 ]; then
        echo "Download node-v14.17.6-linux-armv6l.tar.xz success"
    else
        echo "Fail to download node-v14.17.6-linux-armv6l.tar.xz. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Extracting node-v14.17.6-linux-armv6l.tar.xz"
    tar -xf node-v14.17.6-linux-armv6l.tar.xz
    if [ $? -eq 0 ]; then
        echo "Extract node-v14.17.6-linux-armv6l.tar.xz success"
    else
        echo "Fail to extract node-v14.17.6-linux-armv6l.tar.xz. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Installing node-v14.17.6-linux-armv6l"
    sudo cp -r node-v14.17.6-linux-armv6l/* /usr/local/
    if [ $? -eq 0 ]; then
        echo "Installing node-v14.17.6-linux-armv6l.tar.xz success"
    else
        echo "Fail to install/copy node-v14.17.6-linux-armv6l. Exiting instalation. Error Code:" $?
        exit 1
    fi

  else
    echo "Invoking NodeJS 14 script"
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    if [ $? -eq 0 ]; then
        echo "NodeJS 14 script success"
    else
        echo "Fail to invoke NodeJS 14 script. Exiting instalation. Error Code:" $?
        exit 1
    fi

    sudo apt-get install -y nodejs
    if [ $? -eq 0 ]; then
        echo "Installing NodeJS 14 success"
    else
        echo "Fail to install NodeJS 14. Exiting instalation. Error Code:" $?
        exit 1
    fi
  fi
}

installnpm (){
    cd $INSTALL_DIR
    echo "Installing NPM Modules"
    sudo npm install
    if [ $? -eq 0 ]; then
        echo "NPM Modules installation success"
    else
        echo "Fail to install NPM Modules. Exiting instalation. Error Code:" $?
        exit 1
    fi
}

installhubitatalarm (){
    echo "Installing/Updating Hubitat Alarm"
    echo "Downloading and extracting Hubitat Alarm"
    cd /opt
    wget -qO - https://github.com/Welasco/HubitatAlarm/archive/master.tar.gz | tar zx --strip-components=1 HubitatAlarm-master/Alarm
    if [ $? -eq 0 ]; then
        echo "Hubitat Alarm update success"
    else
        echo "Hubitat Alarm failt to update. Exiting instalation. Error Code:" $?
        exit 1
    fi
}

setupsystemd (){
    echo "Setting Hubitat Alarm as a systemd service"
    cp $INSTALL_DIR/alarm.service /lib/systemd/system
    if [ $? -eq 0 ]; then
        echo "Copied alarm.service success"
    else
        echo "Fail to copy alarm.service to /lib/systemd/system. Exiting instalation. Error Code:" $?
        exit 1
    fi

    sudo systemctl daemon-reload
    sudo systemctl enable alarm
    if [ $? -eq 0 ]; then
        echo "Enabling alarm.service success"
    else
        echo "Fail to enable alarm.service. Exiting instalation. Error Code:" $?
        exit 1
    fi

    echo "Starting alarm service"
    sudo systemctl start alarm
    if [ $? -eq 0 ]; then
        echo "Service alarm.service started"
    else
        echo "Fail to start alarm.service. Exiting instalation. Error Code:" $?
        exit 1
    fi
}

backup (){
    echo "Taking Backup of /opt/Alarm/config/config.json"
    cp /opt/Alarm/config/config.json /root
    if [ $? -eq 0 ]; then
        echo "Backup sucess"
    else
        echo "Backup Fail. Exiting instalation. Error Code:" $?
        exit 1
    fi
}

restore (){
    echo "Restoring Backup from /root/config.json to /opt/Alarm/config/config.json"
    cp /root/config.json /opt/Alarm/config/config.json
    if [ $? -eq 0 ]; then
        echo "Restore backup sucess"
    else
        echo "Fail to restore backup. Exiting instalation. Error Code:" $?
        exit 1
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