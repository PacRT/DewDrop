# Get Ubuntu Image

FROM ubuntu:14.04

# Docker Maintainer

MAINTAINER sandeep

# get all the required base packages to build and make

RUN sudo apt-get --assume-yes install software-properties-common

RUN sudo add-apt-repository "deb http://archive.ubuntu.com/ubuntu $(lsb_release -sc) main universe"

RUN sudo apt-get update \

    && sudo apt-get --assume-yes install build-essential \

    && sudo apt-get --assume-yes install wget \

    && sudo apt-get --assume-yes install python \

    && sudo apt-get --assume-yes install git

# Download NodeJS and build it

WORKDIR /tmp

RUN wget https://nodejs.org/dist/v4.3.1/node-v4.3.1.tar.gz

RUN sudo tar -xzf node-v4.3.1.tar.gz

WORKDIR node-v4.3.1

RUN ./configure && make && make install 

# Remove the default OpenSSL from Ubuntu distro

RUN apt-get --assume-yes remove openssl

# Get OpenSSL version NodeJS 4.2.4 used

WORKDIR /tmp

RUN git clone --branch OpenSSL_1_0_2f git://github.com/openssl/openssl.git

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

WORKDIR /broker

RUN npm install

RUN npm install bunyan -g

RUN npm install pm2 -g

WORKDIR /broker/client-tmpl

RUN npm install

WORKDIR /broker

#ENTRYPOINT ["/bin/bash"]

#ENTRYPOINT ["node", "mqtt-server.js"]
