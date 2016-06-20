# Get Ubuntu Image

FROM ubuntu:16.04

# Docker Maintainer

MAINTAINER sandeep

# get all the required base packages to build and make

RUN apt-get update

RUN apt-get --assume-yes install software-properties-common

RUN add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) main universe"

RUN apt-get update \

    && apt-get --assume-yes install build-essential \

    && apt-get --assume-yes install wget \

    && apt-get --assume-yes install python \

    && apt-get --assume-yes install git

# Download NodeJS and build it

WORKDIR /tmp

RUN wget https://nodejs.org/dist/v4.4.5/node-v4.4.5.tar.gz

RUN tar -xzf node-v4.4.5.tar.gz

WORKDIR node-v4.4.5

RUN ./configure && make && make install 

# Remove the default OpenSSL from Ubuntu distro

RUN apt-get --assume-yes remove openssl

# Get OpenSSL version NodeJS 4.2.4 used

WORKDIR /tmp

RUN git clone --branch OpenSSL_1_0_2g git://github.com/openssl/openssl.git

WORKDIR /tmp/openssl

RUN ./config --prefix=/usr/local --openssldir=/usr/local/openssl

RUN make && make test && make install 

# DewDrop MQTT broker ports

EXPOSE 1883

EXPOSE 8883

EXPOSE 8443

EXPOSE 8000

# For now copying directory 

WORKDIR /

COPY broker broker

COPY client-tmpl client-tmpl

WORKDIR /broker

RUN npm install

RUN npm install bunyan -g

RUN npm install pm2 -g

WORKDIR /client-tmpl

RUN npm install

WORKDIR /broker

#ENTRYPOINT ["/bin/bash"]

#ENTRYPOINT ["node", "mqtt-server.js"]
