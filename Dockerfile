# Frontend — Vite/React build served by nginx.
# Stage 1: build the static assets.
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite inlines VITE_* vars at build time — must be passed as a build arg since
# .dockerignore excludes .env files from this build context (kept secret-free
# on purpose; this one value isn't secret, a Google OAuth client ID is public).
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# Stage 2: serve with nginx (also reverse-proxies /api and /public to backend).
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
