# Простейший Dockerfile для Railway
FROM node:18-slim

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем код (исправлено для Railway)
COPY . .
RUN ls -la

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Запуск
CMD ["node", "server.js"]