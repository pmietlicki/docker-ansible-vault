FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install dependencies including i18next modules
RUN npm install --production --ignore-scripts

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "./bin/www" ]
