FROM node:10

# Create app directory
WORKDIR /usr/src/csassess

COPY ./package*.json ./

RUN npm install --verbose

# Copy the app
COPY ./csassess.js .

#NO PORT EXPOSE NEEDED AS THIS ISN'T A WEBSERVICE

CMD [ "npm", "start" ]