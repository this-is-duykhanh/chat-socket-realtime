# FROM node:20-bullseye-slim
FROM node:20-bullseye-slim@sha256:d53d277d135f4b383cab9ae0b268447325f08b1216f62d6ce0f46ae005d47192
# FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --only=production


COPY . .

# ENV NODE_ENV=production
ENV MONGO_URI=mongodb://mongo:27017/chatdb
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV HOST_NAME=0.0.0.0
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start"]
