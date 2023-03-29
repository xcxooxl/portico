FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

EXPOSE 9229

CMD [ "npm", "start" ]
