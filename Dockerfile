FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8888

EXPOSE 8888

CMD [ "node", "main.js" ]
