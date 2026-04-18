import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["user", "admin", "editor"]).default("user").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Pages ────────────────────────────────────────────────────────────────────
export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleUz: varchar("titleUz", { length: 255 }),
  titleEn: varchar("titleEn", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  contentUz: text("contentUz"),
  contentEn: text("contentEn"),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaTitleUz: varchar("metaTitleUz", { length: 255 }),
  metaTitleEn: varchar("metaTitleEn", { length: 255 }),
  metaDescription: text("metaDescription"),
  metaDescriptionUz: text("metaDescriptionUz"),
  metaDescriptionEn: text("metaDescriptionEn"),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  authorId: int("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

// ─── News / Press Center ──────────────────────────────────────────────────────
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleUz: varchar("titleUz", { length: 255 }),
  titleEn: varchar("titleEn", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  contentUz: text("contentUz"),
  contentEn: text("contentEn"),
  excerpt: text("excerpt"),
  excerptUz: text("excerptUz"),
  excerptEn: text("excerptEn"),
  coverImageUrl: text("coverImageUrl"),
  coverImageKey: text("coverImageKey"),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array stored as text
  status: mysqlEnum("status", ["draft", "published", "scheduled"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  authorId: int("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsItem = typeof news.$inferSelect;
export type InsertNewsItem = typeof news.$inferInsert;

// ─── Insurance Products ───────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleUz: varchar("titleUz", { length: 255 }),
  titleEn: varchar("titleEn", { length: 255 }),
  description: text("description"),
  descriptionUz: text("descriptionUz"),
  descriptionEn: text("descriptionEn"),
  iconUrl: text("iconUrl"),
  iconKey: text("iconKey"),
  tariffs: text("tariffs"), // JSON stored as text (legacy)
  tariffHtml: text("tariffHtml"), // Raw HTML widget uploaded by editor
  ctaLink: varchar("ctaLink", { length: 500 }),
  category: varchar("category", { length: 100 }),
  // Page sections (JSON arrays stored as text)
  coverageItems: text("coverageItems"), // [{icon,title,titleUz,titleEn,description,descriptionUz,descriptionEn}]
  risks: text("risks"),                 // [{icon,title,titleUz,titleEn,description,descriptionUz,descriptionEn}]
  faq: text("faq"),                     // [{question,questionUz,questionEn,answer,answerUz,answerEn}]
  steps: text("steps"),                 // [{icon,title,titleUz,titleEn,description,descriptionUz,descriptionEn}]
  duration: text("duration"),
  durationUz: text("durationUz"),
  durationEn: text("durationEn"),
  extraSections: text("extraSections"),  // JSON array of custom grid sections (legacy)
  pageBlocks: text("pageBlocks"),        // JSON array of typed page blocks (cards|steps|faq|duration)
  sortOrder: int("sortOrder").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Media Library ────────────────────────────────────────────────────────────
export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }),
  url: text("url").notNull(),
  fileKey: text("fileKey").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"), // bytes
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

// ─── Branches / Offices ───────────────────────────────────────────────────────
export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameUz: varchar("nameUz", { length: 255 }),
  nameEn: varchar("nameEn", { length: 255 }),
  address: text("address"),
  addressUz: text("addressUz"),
  addressEn: text("addressEn"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  workingHours: varchar("workingHours", { length: 255 }),
  workingHoursUz: varchar("workingHoursUz", { length: 255 }),
  workingHoursEn: varchar("workingHoursEn", { length: 255 }),
  lat: float("lat"),
  lng: float("lng"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;

// ─── Site Settings ────────────────────────────────────────────────────────────
// Settings uses a key/value store. Multi-language values are stored as
// separate keys: e.g. company_name (RU), company_name_uz, company_name_en
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

// ─── Activity Log ─────────────────────────────────────────────────────────────
export const activityLog = mysqlTable("activityLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(), // created, updated, deleted, published
  entity: varchar("entity", { length: 100 }).notNull(), // page, news, product, media, branch
  entityId: int("entityId"),
  entityTitle: varchar("entityTitle", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
