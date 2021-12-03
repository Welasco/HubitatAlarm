FROM node:fermium-alpine

WORKDIR /opt/Alarm
COPY . .

RUN apk update \
    && apk add curl wget tcpdump make gcc g++ linux-headers udev python2 python3

RUN npm install -g pm2 \
    && echo "cd /opt/Alarm" >> /etc/bash.bashrc \
    && cd /opt/Alarm \
    && npm install

EXPOSE 3000
ENV PORT 3000

ENV PATH ${PATH}:/opt/Alarm

CMD [ "pm2", "start", "alarm.js", "--no-daemon" ]