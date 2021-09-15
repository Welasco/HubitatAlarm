FROM node:16-buster

# Create app directory
WORKDIR /opt/Alarm
COPY . .

#COPY startup /opt/startup

RUN apt-get update \
    && apt-get install -y net-tools nano curl wget tcpdump dnsutils

RUN npm install -g pm2 \
    && echo "cd /opt/Alarm" >> /etc/bash.bashrc \
    && cd /opt/Alarm \
    && npm install

EXPOSE 3000
ENV PORT 3000

ENV PATH ${PATH}:/opt/Alarm

CMD [ "pm2", "start", "alarm.js", "--no-daemon" ]