# ==============================================================================
# MedVault Frontend Production Dockerfile (Multi-Stage Build)
# Experiment 10 — Deploy Full-Stack Apps Using DevOps Tools and Docker
# ==============================================================================

# STAGE 1: Build Vite React Application
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for API URLs (defaulting to container service endpoints or production)
ARG VITE_API_URL=http://localhost:5000
ARG VITE_SOCKET_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: High-Performance Production Nginx Server
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built artifacts from Stage 1
COPY --from=builder /app/dist .

# Copy custom Nginx configuration with SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

