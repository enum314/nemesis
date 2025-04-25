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
