FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN npm run build
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
