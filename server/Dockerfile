# ==============================================================================
# MedVault Backend Production Dockerfile (Multi-Stage Build)
# Experiment 10 — Deploy Full-Stack Apps Using DevOps Tools and Docker
# ==============================================================================

# STAGE 1: Dependency Installation
FROM node:20-alpine AS dependencies
WORKDIR /app

# Install system dependencies if required
RUN apk add --no-cache libc6-compat

# Install package definitions first to maximize Docker layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# STAGE 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create a dedicated non-root application user for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medvault

# Copy installed production node_modules from Stage 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy application source code
COPY --chown=medvault:nodejs . .

# Run as non-root user
USER medvault

# Expose backend REST API and WebSocket port
EXPOSE 5000

# Docker Health Check targeting the MedVault telemetry endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start production server
CMD ["node", "server.js"]

