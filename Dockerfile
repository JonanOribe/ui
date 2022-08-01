FROM node:16

# Create app directory
WORKDIR /usr/src/app


COPY . .
# Install pg_dump
RUN apt-get update && \
    apt-get upgrade && \
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'  && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get -y update && \
    apt-get -y install postgresql-14

WORKDIR /usr/src/app/server
RUN npm i