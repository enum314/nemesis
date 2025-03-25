FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Development stage
FROM base AS development
# Install development dependencies
RUN pnpm install
# Copy source files
COPY . .
# Set default port to 3001
ENV PORT=3001
# Expose port 3001
EXPOSE 3001
# Start development server
CMD ["pnpm", "dev"]

# Build stage
FROM base AS build
# Install all dependencies
RUN pnpm install --frozen-lockfile
# Copy source files
COPY . .
# Build the app
RUN pnpm build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
# Set default port to 3001
ENV PORT=3001
# Expose port 3001
EXPOSE 3001

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./
# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built app from build stage
COPY --from=build /app/dist ./dist

# Start the application
CMD ["node", "dist/index.js"] 