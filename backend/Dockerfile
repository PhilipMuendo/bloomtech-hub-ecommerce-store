# Backend API — Express + Sequelize (MySQL)
# Node 22 LTS: sharp >=0.34 requires Node >=20.9, and Node 18 is EOL.
FROM node:22-alpine

# dumb-init gives us proper signal handling (graceful shutdown) for PID 1.
RUN apk add --no-cache dumb-init

WORKDIR /app

# Install production dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source.
COPY . .

# The upload directory is a mounted volume in compose; ensure it exists and is
# owned by the non-root runtime user so the named volume inherits write access.
# `logs/` is where winston (utils/logger.js) writes error.log/combined.log.
RUN mkdir -p public/uploads logs && chown -R node:node public logs

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
