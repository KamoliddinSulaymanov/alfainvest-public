import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./serve-static";
import { ENV } from "./env";
import { sdk } from "./sdk";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function seedAdminUser() {
  if (!ENV.adminPassword) {
    console.warn("[Seed] ADMIN_PASSWORD is not set — skipping admin user creation");
    return;
  }

  const existing = await db.getUserByUsername(ENV.adminUsername);
  if (existing) return;

  const passwordHash = sdk.hashPassword(ENV.adminPassword);
  await db.createUser({
    username: ENV.adminUsername,
    passwordHash,
    name: ENV.adminName,
    role: "admin",
  });

  console.log(`[Seed] Admin user "${ENV.adminUsername}" created`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Auth routes: POST /api/auth/login
  registerOAuthRoutes(app);

  // Nominatim suggest proxy — free OSM geocoder, returns suggestions with coordinates
  app.get("/api/geo/suggest", async (req, res) => {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q || q.length < 2) { res.json({ results: [] }); return; }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=7&accept-language=ru&addressdetails=1`;
      const upstream = await fetch(url, {
        headers: { "User-Agent": "AlfaInvest-CMS/1.0", "Accept": "application/json" },
      });
      const data = await upstream.json() as any[];
      const results = data.map((item: any) => {
        const addr = item.address ?? {};
        const title = [addr.road, addr.house_number].filter(Boolean).join(", ")
          || item.display_name.split(",")[0];
        const subtitle = [addr.city || addr.town || addr.village, addr.state].filter(Boolean).join(", ");
        return {
          title,
          subtitle,
          value: item.display_name,
          lat: parseFloat(item.lat).toFixed(6),
          lng: parseFloat(item.lon).toFixed(6),
        };
      });
      res.json({ results });
    } catch (err) {
      console.error("[Suggest proxy]", err);
      res.status(502).json({ error: "Upstream error" });
    }
  });

  // Nominatim Geocode proxy — forward geocoding: address → lat/lng (free, no key needed)
  app.get("/api/geo/geocode", async (req, res) => {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q) { res.json({ lat: null, lng: null }); return; }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=ru`;
      const upstream = await fetch(url, { headers: { "User-Agent": "AlfaInvest-CMS/1.0", "Accept": "application/json" } });
      const data = await upstream.json() as any[];
      if (!data.length) { res.json({ lat: null, lng: null }); return; }
      res.json({ lat: parseFloat(data[0].lat).toFixed(6), lng: parseFloat(data[0].lon).toFixed(6) });
    } catch (err) {
      console.error("[Geocode proxy]", err);
      res.status(502).json({ error: "Upstream error" });
    }
  });

  // ── Public widget HTML endpoint (no auth) ────────────────────────────────
  // Serves tariffHtml for a product as a real URL so the widget's
  // window.location.href is a valid http:// URL (not blob:) — required by
  // the bank API's success_url isUrl validation.
  app.get("/public/widget/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).send("Invalid ID"); return; }
    try {
      const product = await db.getProductById(id);
      if (!product?.tariffHtml) { res.status(404).send("Widget not found"); return; }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.send(product.tariffHtml);
    } catch (err) {
      console.error("[Widget]", err);
      res.status(500).send("Server error");
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    await seedAdminUser().catch(err =>
      console.error("[Seed] Failed to seed admin user:", err)
    );
  });
}

startServer().catch(console.error);
