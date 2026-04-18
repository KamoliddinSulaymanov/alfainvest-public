# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files first for layer caching
COPY package.json pnpm-lock.yaml ./
# Patches must be available before pnpm install (pnpm applies them during install)
COPY patches ./patches

# Install all dependencies (including devDependencies needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Umami analytics tracking (baked into the frontend bundle at build time)
ARG VITE_ANALYTICS_ENDPOINT
ARG VITE_ANALYTICS_WEBSITE_ID
ENV VITE_ANALYTICS_ENDPOINT=$VITE_ANALYTICS_ENDPOINT
ENV VITE_ANALYTICS_WEBSITE_ID=$VITE_ANALYTICS_WEBSITE_ID

# Yandex Maps API key (baked into the frontend bundle at build time)
ARG VITE_YANDEX_MAPS_KEY
ENV VITE_YANDEX_MAPS_KEY=$VITE_YANDEX_MAPS_KEY

# Build: Vite (client) + esbuild (server)
RUN pnpm build

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install all dependencies (vite and plugins are referenced in the bundle even in prod)
RUN pnpm install --frozen-lockfile

# Copy built artifacts from builder stage
# Server bundle goes to dist/index.js
# Client bundle goes to dist/public/ (served as static files)
COPY --from=builder /app/dist ./dist

# Copy drizzle migrations (needed for db:push at runtime)
COPY --from=builder /app/drizzle ./drizzle

# Copy drizzle config (needed for migrations)
COPY drizzle.config.ts ./

# Copy entrypoint script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start production server (runs migrations first)
ENV NODE_ENV=production
ENTRYPOINT ["./entrypoint.sh"]
