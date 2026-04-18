# Dockerfile para o backend server-ts
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install


COPY . .

# Remove DB seed from build, only build the app
RUN npx next build

EXPOSE 3001
ENTRYPOINT ["sh", "/app/entrypoint.sh"]
