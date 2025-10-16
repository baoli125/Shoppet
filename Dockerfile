FROM node:18-alpine

WORKDIR /app

# Tạo thư mục data và backups
RUN mkdir -p /app/data /app/backups

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

