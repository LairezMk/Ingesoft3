# ============================================
# DOCKERFILE - AUTH SERVICE
# ============================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and workspaces
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy workspace packages
COPY packages ./packages

# Copy service files
COPY services/auth-service ./services/auth-service

# Install all dependencies from root
RUN npm install

# Build shared packages first
RUN npm run build --workspace=@lucy-tejada/shared --if-present
RUN npm run build --workspace=@lucy-tejada/types --if-present

# Build the service
RUN npm run build --workspace=auth-service

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace packages
COPY packages ./packages

# Copy service package.json
COPY services/auth-service/package*.json ./services/auth-service/

# Install only production dependencies
RUN npm install --omit=dev --workspace=auth-service --include-workspace-root

# Copy built application
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/packages ./packages

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

WORKDIR /app/services/auth-service

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/main.js"]
