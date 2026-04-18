# Dockerfile para a aplicação web
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Porta do Vite definida no package.json/config: 5174
EXPOSE 5174
# Para produção, use "preview" ao invés de "dev"
CMD ["npm", "run", "preview"]
