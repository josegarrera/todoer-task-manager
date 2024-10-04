FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG MONGO_URI

RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist /app
COPY package.json package-lock.json ./
RUN npm install --production

ENV MONGO_URI=${MONGO_URI}

EXPOSE 3001
CMD ["node", "index.js"]
