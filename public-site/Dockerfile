# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# VITE_CMS_URL must be passed at build time so the frontend bundle knows
# where to fetch CMS data. Override with --build-arg VITE_CMS_URL=...
ARG VITE_CMS_URL=http://cms-admin:3000
ENV VITE_CMS_URL=$VITE_CMS_URL

ARG VITE_YANDEX_MAPS_KEY
ENV VITE_YANDEX_MAPS_KEY=$VITE_YANDEX_MAPS_KEY

RUN pnpm build

# ─── Stage 2: Nginx ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
