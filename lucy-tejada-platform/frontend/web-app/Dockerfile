# ============================================
# DOCKERFILE - FRONTEND WEB APP
# ============================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and workspaces
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy workspace packages
COPY packages ./packages

# Copy frontend files
COPY frontend/web-app ./frontend/web-app

# Install all dependencies from root
RUN npm install

# Build shared packages first
RUN npm run build --workspace=@lucy-tejada/shared --if-present
RUN npm run build --workspace=@lucy-tejada/types --if-present

# Build the frontend
RUN npm run build --workspace=web-app

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy nginx configuration
COPY frontend/web-app/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/frontend/web-app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
