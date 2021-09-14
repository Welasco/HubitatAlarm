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
    echo "Hubitat Alarm already installed!"
    exit 1
  else
    echo "Installing unzip"
    apt-get update && sudo apt-get install unzip -y > /dev/null 2>&1
    echo "Downloading NodeJSAzureDynamicDNS"
    wget -Nnv https://github.com/Welasco/NodeJSAzureDynamicDNS/archive/master.zip -O NodeJSAzureDynamicDNS.zip
    unzip NodeJSAzureDynamicDNS.zip -d /opt > /dev/null 2>&1
    mv /opt/NodeJSAzureDynamicDNS-master/ $INSTALL_DIR
    chmod +755 $INSTALL_DIR/UpdateAzureRMDDNS.js
    cd $INSTALL_DIR
    echo "Installing NPM Modules"
    npm install > /dev/null 2>&1
    cp $INSTALL_DIR/UpdateAzureRMDDNS.service /lib/systemd/system
    systemctl daemon-reload
    systemctl enable UpdateAzureRMDDNS
    echo " "
    echo "NodeJSAzureDynamicDNS Installed at $INSTALL_DIR."
    echo "You must setup the $INSTALL_DIR/config.json using your settings!"
    echo "Start the service after: sudo systemctl start UpdateAzureRMDDNS"
  fi
}

# Checking if Node.JS is installed
# Install Node.JS
if ! [ -x "$(command -v node)" ]; then
  if $(uname -m | grep -Eq ^armv6); then
    echo "ARMV6 detected installing node-v11.1.0-linux-armv6l.tar.gz"
    # reference: https://blog.rodrigograca.com/how-to-install-latest-nodejs-on-raspberry-pi-0-w/
    # https://unofficial-builds.nodejs.org/download/release/v14.15.2/node-v14.15.2-linux-armv6l.tar.xz
    curl -o node-v14.15.2-linux-armv6l.tar.xz https://unofficial-builds.nodejs.org/download/release/v14.15.2/node-v14.15.2-linux-armv6l.tar.xz
    tar -xzf node-v14.15.2-linux-armv6l.tar.xz
    sudo cp -r node-v14.15.2-linux-armv6l/* /usr/local/

  else
    echo "NodeJS Not found"
    echo "Installing NodeJS"
    curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
  install

else
  echo "NodeJS already installed"
  install
fi
