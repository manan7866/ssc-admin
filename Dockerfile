# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:20-alpine AS deps

# Install libc6-compat for Prisma compatibility on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# ============================================================
# Stage 2: Builder
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# ============================================================
# Stage 3: Runner (Production)
# ============================================================
FROM node:20-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public files
COPY --from=builder /app/public ./public

# Copy standalone output (Next.js optimized build)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3050
EXPOSE 3050

# Set environment variables
ENV PORT=3050
ENV HOSTNAME="0.0.0.0"
ENV MAIN_APP_URL=http://ssc-app:3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3050/ || exit 1

# Start the application
CMD ["node", "server.js"]
