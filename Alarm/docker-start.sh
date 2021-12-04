# Running alarm in a container
# Install docker
sudo curl -sL get.docker.com | bash

# add permission to pi user to run docker
sudo usermod -a -G docker pi

# Run alarm conatiner
mkdir /home/pi/hubitatalarmConfig
# Run command for DSC-IT100
docker run --name=hubitatalarm -d -p 3000:3000 -v /home/pi/hubitatalarmConfig:/opt/Alarm/config --device=/dev/ttyUSB0 --restart always welasco/hubitatalarm:latest
# Run command for Envisalink
docker run --name=hubitatalarm -d -p 3000:3000 -v /home/pi/hubitatalarmConfig:/opt/Alarm/config --restart always welasco/hubitatalarm:latest

# Updating Alarm conatiner
docker pull welasco/hubitatalarm:latest
docker stop hubitatalarm
docker rm hubitatalarm
# Run command for DSC-IT100
docker run --name=hubitatalarm -d -p 3000:3000 -v /home/pi/hubitatalarmConfig:/opt/Alarm/config --device=/dev/ttyUSB0 --restart always welasco/hubitatalarm:latest
# Run command for Envisalink
docker run --name=hubitatalarm -d -p 3000:3000 -v /home/pi/hubitatalarmConfig:/opt/Alarm/config --restart always welasco/hubitatalarm:latest

# Troubleshooting
# List running conatiners
docker ps

# List all containers stopped/running
docker ps -a

# Checking logs
docker logs hubitatalarm
docker logs hubitatalarm -f