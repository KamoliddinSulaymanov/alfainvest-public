import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export function registerOAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const user = await db.getUserByUsername(username);

    if (!user || !sdk.verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is disabled" });
      return;
    }

    const sessionToken = await sdk.signSession(
      { userId: user.id, username: user.username, name: user.name || "" },
      { expiresInMs: ONE_YEAR_MS }
    );

    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.json({ ok: true });
  });
}
