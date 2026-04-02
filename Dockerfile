FROM node:22-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --build-from-source

COPY . .
RUN npm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.cjs"]
