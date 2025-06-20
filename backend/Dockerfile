# Multi-stage build для Railway
FROM node:18-alpine AS base
WORKDIR /app

# Установка системных зависимостей
RUN apk add --no-cache libc6-compat

# Установка зависимостей
FROM base AS deps
COPY backend/package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Сборка приложения
FROM base AS builder  
COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY backend/ .

# Production образ
FROM base AS runner
WORKDIR /app

# Создание пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Копирование файлов
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app .

# Переключение на непривилегированного пользователя
USER nodejs

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# Запуск сервера
CMD ["node", "server.js"]