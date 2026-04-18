# Alfa Invest — Docker Deployment Guide

This package contains everything needed to self-host the complete Alfa Invest platform using Docker Compose. The stack consists of five services that work together seamlessly.

## Architecture Overview

| Service | Image | Host Port | Description |
|---|---|---|---|
| `mysql` | mysql:8.0 | 3306 | CMS database (MySQL 8) |
| `cms-admin` | built locally | **3000** | CMS Admin Panel (Node.js + Express + tRPC) |
| `public-site` | built locally | **3001** | Public Website (Vite SPA + Nginx) |
| `postgres` | postgres:15-alpine | 5432 | Umami database (PostgreSQL 15) |
| `umami` | umami:postgresql-latest | **3002** | Umami Analytics self-hosted |

The `mysql` and `postgres` containers are on an **internal** network and are not reachable from the internet — only the application containers can connect to them.

---

## Prerequisites

- Docker Engine 24+ and Docker Compose v2 (`docker compose` command)
- At least 2 GB of free RAM
- At least 5 GB of free disk space

Verify your installation:

```bash
docker --version        # Docker version 24.x.x or higher
docker compose version  # Docker Compose version v2.x.x or higher
```

---

## Project Structure

```
alfainvest-docker/
├── docker-compose.yml          ← Main orchestration file
├── .env.example                ← Environment variable template
├── Makefile                    ← Convenience commands
├── README.md                   ← This file
├── cms-admin/
│   ├── Dockerfile              ← CMS admin image (multi-stage build)
│   ├── entrypoint.sh           ← Runs DB migrations then starts server
│   └── .dockerignore
└── public-site/
    ├── Dockerfile              ← Public site image (Vite + Nginx)
    ├── nginx.conf              ← Nginx SPA config with gzip & caching
    └── .dockerignore
```

> **Important:** The `cms-admin/` and `public-site/` directories must contain the actual source code of each project. See the **Setup** section below.

---

## Setup

### Step 1 — Copy source code

Copy your project source code into the corresponding directories:

```bash
# Copy CMS admin source (everything except node_modules and dist)
cp -r /path/to/alfainvest-cms-admin/. cms-admin/
# Remove any existing build artifacts
rm -rf cms-admin/node_modules cms-admin/dist

# Copy public site source
cp -r /path/to/alfainvest-public/. public-site/
rm -rf public-site/node_modules public-site/dist
```

### Step 2 — Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in **all required values**. The table below explains each variable:

| Variable | Required | Description |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | Yes | MySQL root password (keep secret) |
| `MYSQL_PASSWORD` | Yes | MySQL app user password |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password for Umami |
| `JWT_SECRET` | Yes | Session signing secret (min 64 chars) |
| `VITE_APP_ID` | Yes | Manus OAuth application ID |
| `OWNER_OPEN_ID` | Yes | Your Manus account Open ID |
| `OWNER_NAME` | Yes | Your name (shown in admin) |
| `UMAMI_APP_SECRET` | Yes | Umami token signing secret |
| `PUBLIC_SITE_CMS_URL` | Yes | CMS API URL **as seen from browser** |
| `UMAMI_USERNAME` | No | Pre-configure Umami admin username |
| `UMAMI_PASSWORD` | No | Pre-configure Umami admin password |

Generate secure secrets with:

```bash
openssl rand -hex 64   # for JWT_SECRET
openssl rand -hex 32   # for UMAMI_APP_SECRET
```

### Step 3 — Build and start

```bash
# Build all images (first time takes 3-5 minutes)
docker compose build

# Start all services in the background
docker compose up -d

# Check that all services are healthy
docker compose ps
```

### Step 4 — Verify services

Once all containers show `healthy` status, open:

| URL | Service |
|---|---|
| http://localhost:3000 | CMS Admin Panel |
| http://localhost:3001 | Public Website |
| http://localhost:3002 | Umami Analytics |

---

## First-time Umami Setup

On first launch, Umami creates a default admin account:

- **Username:** `admin`
- **Password:** `umami`

**Change this password immediately** after first login at http://localhost:3002.

Then create a website in Umami (Settings → Websites → Add website) and copy the **Website ID** (UUID). Enter this in the CMS Admin Panel under **Settings → Umami Analytics**.

---

## Connecting Umami to the Public Site

To track visitors on the public site, add the Umami tracking script to the public site's `index.html` before rebuilding:

```html
<script
  defer
  src="http://your-server-ip:3002/script.js"
  data-website-id="your-website-id-uuid"
></script>
```

After adding the script, rebuild the public site image:

```bash
docker compose build public-site
docker compose up -d public-site
```

---

## Production Deployment with a Reverse Proxy

For production, place Nginx or Traefik in front of the stack to handle HTTPS. A minimal Nginx reverse proxy config:

```nginx
server {
    listen 443 ssl;
    server_name cms.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    # ... same pattern for public-site on port 3001
}
```

When using HTTPS domains, update `PUBLIC_SITE_CMS_URL` in `.env` to the HTTPS URL of the CMS admin, then rebuild the public site.

---

## Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f cms-admin

# Rebuild a specific service after code changes
docker compose build cms-admin
docker compose up -d cms-admin

# Run database migrations manually
docker compose exec cms-admin sh entrypoint.sh

# Open MySQL shell
docker compose exec mysql mysql -u alfainvest -p alfainvest_cms

# Open PostgreSQL shell
docker compose exec postgres psql -U umami -d umami

# Full cleanup (WARNING: deletes all data)
docker compose down -v --rmi local
```

Or use the included Makefile shortcuts:

```bash
make up        # Start all
make down      # Stop all
make build     # Rebuild all images
make logs      # Tail all logs
make cms-logs  # Tail CMS admin logs only
```

---

## Updating

To update the CMS admin or public site after code changes:

```bash
# 1. Copy updated source code into the directory
cp -r /path/to/updated-source/. cms-admin/

# 2. Rebuild the image
docker compose build cms-admin

# 3. Restart the service (zero-downtime with --no-deps)
docker compose up -d --no-deps cms-admin
```

---

## Troubleshooting

**CMS admin fails to start with "DATABASE_URL is required"**
Ensure your `.env` file exists and `MYSQL_PASSWORD` is set. The `DATABASE_URL` is constructed automatically from `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE`.

**Public site shows blank page or API errors**
Check that `PUBLIC_SITE_CMS_URL` in `.env` matches the URL your browser uses to reach the CMS admin. This value is baked into the frontend bundle at build time — if you change it, you must rebuild the `public-site` image.

**Umami shows "Database connection failed"**
Wait 30–60 seconds for PostgreSQL to fully initialize. Umami performs its own schema migration on first boot. Check logs with `docker compose logs umami`.

**Port conflicts**
If ports 3000, 3001, 3002, 3306, or 5432 are already in use on your server, change the host-side port mappings in `docker-compose.yml` (e.g., `"8080:3000"` to use port 8080 instead of 3000).
