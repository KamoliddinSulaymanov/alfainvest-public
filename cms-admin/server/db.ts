import { eq, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users, pages, news, products, media, branches, settings, activityLog,
  InsertPage, InsertNewsItem, InsertProduct, InsertMedia, InsertBranch, InsertSetting, InsertActivityLog,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function createUser(data: {
  username: string;
  passwordHash: string;
  name?: string | null;
  email?: string | null;
  role?: "user" | "admin" | "editor";
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(users).values({
    username: data.username,
    passwordHash: data.passwordHash,
    name: data.name ?? null,
    email: data.email ?? null,
    role: data.role ?? "user",
    lastSignedIn: new Date(),
  });
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateLastSignedIn(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(id: number, role: "user" | "admin" | "editor") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function toggleUserActive(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isActive }).where(eq(users.id, id));
}

// ─── Pages ────────────────────────────────────────────────────────────────────
export async function getAllPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pages).orderBy(desc(pages.updatedAt));
}

export async function getPageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  return result[0];
}

export async function getPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return result[0];
}

export async function createPage(data: InsertPage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(pages).values(data);
  return result;
}

export async function updatePage(id: number, data: Partial<InsertPage>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(pages).set(data).where(eq(pages.id, id));
}

export async function deletePage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(pages).where(eq(pages.id, id));
}

// ─── News ─────────────────────────────────────────────────────────────────────
export async function getAllNews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).orderBy(desc(news.createdAt));
}

export async function getNewsById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return result[0];
}

export async function createNews(data: InsertNewsItem) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(news).values(data);
}

export async function updateNews(id: number, data: Partial<InsertNewsItem>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(news).set(data).where(eq(news.id, id));
}

export async function deleteNews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(news).where(eq(news.id, id));
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(asc(products.sortOrder));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(products).where(eq(products.id, id));
}

// ─── Media ────────────────────────────────────────────────────────────────────
export async function getAllMedia() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(media).orderBy(desc(media.createdAt));
}

export async function createMedia(data: InsertMedia) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(media).values(data);
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (result[0]) {
    await db.delete(media).where(eq(media.id, id));
    return result[0];
  }
  return null;
}

// ─── Branches ─────────────────────────────────────────────────────────────────
export async function getAllBranches() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(branches).orderBy(asc(branches.name));
}

export async function getBranchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  return result[0];
}

export async function createBranch(data: InsertBranch) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(branches).values(data);
}

export async function updateBranch(id: number, data: Partial<InsertBranch>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(branches).set(data).where(eq(branches.id, id));
}

export async function deleteBranch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(branches).where(eq(branches.id, id));
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings).orderBy(asc(settings.key));
}

export async function upsertSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(settings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLog).values(data);
}

export async function getRecentActivity(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(limit);
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return { totalPages: 0, publishedNews: 0, totalMedia: 0, totalProducts: 0, totalBranches: 0, totalUsers: 0 };

  const [pagesCount] = await db.select({ count: sql<number>`count(*)` }).from(pages);
  const [newsCount] = await db.select({ count: sql<number>`count(*)` }).from(news).where(eq(news.status, "published"));
  const [mediaCount] = await db.select({ count: sql<number>`count(*)` }).from(media);
  const [productsCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [branchesCount] = await db.select({ count: sql<number>`count(*)` }).from(branches);
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);

  return {
    totalPages: Number(pagesCount?.count ?? 0),
    publishedNews: Number(newsCount?.count ?? 0),
    totalMedia: Number(mediaCount?.count ?? 0),
    totalProducts: Number(productsCount?.count ?? 0),
    totalBranches: Number(branchesCount?.count ?? 0),
    totalUsers: Number(usersCount?.count ?? 0),
  };
}
