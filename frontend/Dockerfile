# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions and install using clean ci
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the production artifacts
RUN npm run build

# Stage 2: Serve the static files using Nginx
FROM nginx:alpine

# Use custom configuration for SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port inside the container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
