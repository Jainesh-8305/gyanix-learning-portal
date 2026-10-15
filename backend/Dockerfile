# backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files first (Docker cache optimization)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
USER nodeuser

EXPOSE 5000
CMD ["node", "server.js"]