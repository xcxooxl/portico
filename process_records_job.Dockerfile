FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9229

CMD [ "npm", "run", "start:process_records" ]
