import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import {
  getAllUsers, updateUserRole, toggleUserActive, getUserByUsername,
  getAllPages, getPageById, getPageBySlug, createPage, updatePage, deletePage,
  getAllNews, getNewsById, createNews, updateNews, deleteNews,
  getAllProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getAllMedia, createMedia, deleteMedia,
  getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch,
  getAllSettings, upsertSetting,
  logActivity, getRecentActivity, getDashboardMetrics,
} from "./db";
import { storagePut, isStorageConfigured } from "./storage";
import { nanoid } from "nanoid";
import { notifyOwner } from "./_core/notification";
import { analyticsRouter } from "./analyticsRouter";

// ─── Middleware: editor or admin ──────────────────────────────────────────────
const editorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "editor") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Editor or Admin access required" });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Dashboard Router ─────────────────────────────────────────────────────────
const dashboardRouter = router({
  getMetrics: editorProcedure.query(async () => {
    return getDashboardMetrics();
  }),
  getRecentActivity: editorProcedure.query(async () => {
    return getRecentActivity(20);
  }),
});

// ─── Pages Router ─────────────────────────────────────────────────────────────
const pagesRouter = router({
  list: editorProcedure.query(async () => getAllPages()),

  getById: editorProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const page = await getPageById(input.id);
    if (!page) throw new TRPCError({ code: "NOT_FOUND" });
    return page;
  }),

  getBySlug: editorProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const page = await getPageBySlug(input.slug);
    if (!page) throw new TRPCError({ code: "NOT_FOUND" });
    return page;
  }),

  create: editorProcedure
    .input(z.object({
      title: z.string().min(1),
      titleUz: z.string().optional(),
      titleEn: z.string().optional(),
      slug: z.string().min(1),
      content: z.string().optional(),
      contentUz: z.string().optional(),
      contentEn: z.string().optional(),
      metaTitle: z.string().optional(),
      metaTitleUz: z.string().optional(),
      metaTitleEn: z.string().optional(),
      metaDescription: z.string().optional(),
      metaDescriptionUz: z.string().optional(),
      metaDescriptionEn: z.string().optional(),
      status: z.enum(["draft", "published"]).default("draft"),
    }))
    .mutation(async ({ input, ctx }) => {
      await createPage({ ...input, authorId: ctx.user.id });
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "created", entity: "page", entityTitle: input.title });
      return { success: true };
    }),

  update: editorProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      titleUz: z.string().optional(),
      titleEn: z.string().optional(),
      slug: z.string().min(1).optional(),
      content: z.string().optional(),
      contentUz: z.string().optional(),
      contentEn: z.string().optional(),
      metaTitle: z.string().optional(),
      metaTitleUz: z.string().optional(),
      metaTitleEn: z.string().optional(),
      metaDescription: z.string().optional(),
      metaDescriptionUz: z.string().optional(),
      metaDescriptionEn: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updatePage(id, data);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "updated", entity: "page", entityId: id, entityTitle: data.title });
      return { success: true };
    }),

  delete: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const page = await getPageById(input.id);
      await deletePage(input.id);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "deleted", entity: "page", entityId: input.id, entityTitle: page?.title });
      return { success: true };
    }),

  bulkDelete: editorProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(input.ids.map((id) => deletePage(id)));
      await logActivity({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Unknown",
        action: "deleted",
        entity: "page",
        entityTitle: `Bulk delete (${input.ids.length})`,
      });
      return { success: true };
    }),

  bulkStatus: editorProcedure
    .input(z.object({ ids: z.array(z.number()).min(1), status: z.enum(["draft", "published"]) }))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(input.ids.map((id) => updatePage(id, { status: input.status })));
      await logActivity({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Unknown",
        action: "updated",
        entity: "page",
        entityTitle: `Bulk status ${input.status} (${input.ids.length})`,
      });
      return { success: true };
    }),

  toggleStatus: editorProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "published"]) }))
    .mutation(async ({ input, ctx }) => {
      await updatePage(input.id, { status: input.status });
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: input.status === "published" ? "published" : "unpublished", entity: "page", entityId: input.id });
      return { success: true };
    }),

  upsert: editorProcedure
    .input(z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      titleUz: z.string().optional(),
      titleEn: z.string().optional(),
      content: z.string().optional(),
      contentUz: z.string().optional(),
      contentEn: z.string().optional(),
      metaTitle: z.string().optional(),
      metaTitleUz: z.string().optional(),
      metaTitleEn: z.string().optional(),
      metaDescription: z.string().optional(),
      metaDescriptionUz: z.string().optional(),
      metaDescriptionEn: z.string().optional(),
      status: z.enum(["draft", "published"]).default("published"),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getPageBySlug(input.slug);
      if (existing) {
        await updatePage(existing.id, { ...input });
        await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "updated", entity: "page", entityId: existing.id, entityTitle: input.title });
      } else {
        await createPage({ ...input, authorId: ctx.user.id });
        await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "created", entity: "page", entityTitle: input.title });
      }
      return { success: true };
    }),
});

// ─── News Router ──────────────────────────────────────────────────────────────
const newsRouter = router({
  list: editorProcedure.query(async () => getAllNews()),

  getById: editorProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const item = await getNewsById(input.id);
    if (!item) throw new TRPCError({ code: "NOT_FOUND" });
    return item;
  }),

  create: editorProcedure
    .input(z.object({
      title: z.string().min(1),
      titleUz: z.string().optional(),
      titleEn: z.string().optional(),
      slug: z.string().min(1),
      content: z.string().optional(),
      contentUz: z.string().optional(),
      contentEn: z.string().optional(),
      excerpt: z.string().optional(),
      excerptUz: z.string().optional(),
      excerptEn: z.string().optional(),
      coverImageUrl: z.string().optional(),
      coverImageKey: z.string().optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      status: z.enum(["draft", "published", "scheduled"]).default("draft"),
      publishedAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await createNews({ ...input, authorId: ctx.user.id });
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "created", entity: "news", entityTitle: input.title });
      return { success: true };
    }),

  update: editorProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      titleUz: z.string().optional(),
      titleEn: z.string().optional(),
      slug: z.string().min(1).optional(),
      content: z.string().optional(),
      contentUz: z.string().optional(),
      contentEn: z.string().optional(),
      excerpt: z.string().optional(),
      excerptUz: z.string().optional(),
      excerptEn: z.string().optional(),
      coverImageUrl: z.string().optional(),
      coverImageKey: z.string().optional(),
      category: z.string().optional(),
      tags: z.string().optional(),
      status: z.enum(["draft", "published", "scheduled"]).optional(),
      publishedAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateNews(id, data);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "updated", entity: "news", entityId: id, entityTitle: data.title });
      return { success: true };
    }),

  delete: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const item = await getNewsById(input.id);
      await deleteNews(input.id);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "deleted", entity: "news", entityId: input.id, entityTitle: item?.title });
      return { success: true };
    }),

  bulkDelete: editorProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(input.ids.map((id) => deleteNews(id)));
      await logActivity({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Unknown",
        action: "deleted",
        entity: "news",
        entityTitle: `Bulk delete (${input.ids.length})`,
      });
      return { success: true };
    }),

  bulkStatus: editorProcedure
    .input(z.object({
      ids: z.array(z.number()).min(1),
      status: z.enum(["draft", "published", "scheduled"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const updateData: { status: "draft" | "published" | "scheduled"; publishedAt?: Date } = {
        status: input.status,
      };
      if (input.status === "published") updateData.publishedAt = new Date();

      await Promise.all(input.ids.map((id) => updateNews(id, updateData)));
      await logActivity({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Unknown",
        action: "updated",
        entity: "news",
        entityTitle: `Bulk status ${input.status} (${input.ids.length})`,
      });
      return { success: true };
    }),

  toggleStatus: editorProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "published", "scheduled"]) }))
    .mutation(async ({ input, ctx }) => {
      const updateData: { status: "draft" | "published" | "scheduled"; publishedAt?: Date } = { status: input.status };
      if (input.status === "published") updateData.publishedAt = new Date();
      await updateNews(input.id, updateData);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: input.status, entity: "news", entityId: input.id });
      return { success: true };
    }),
});

// ─── Products Router ──────────────────────────────────────────────────────────
const productsRouter = router({
  list: editorProcedure.query(async () => getAllProducts()),

  getById: editorProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const item = await getProductById(input.id);
    if (!item) throw new TRPCError({ code: "NOT_FOUND" });
    return item;
  }),

  create: editorProcedure
    .input(z.object({
      title: z.string().min(1),
      titleUz: z.string().optional(),
      titleEn: z.string().optional(),
      description: z.string().optional(),
      descriptionUz: z.string().optional(),
      descriptionEn: z.string().optional(),
      iconUrl: z.string().optional(),
      iconKey: z.string().optional(),
      tariffs: z.string().optional(),
      tariffHtml: z.string().optional(),
      ctaLink: z.string().optional(),
      category: z.string().optional(),
      coverageItems: z.string().optional(),
      risks: z.string().optional(),
      faq: z.string().optional(),
      steps: z.string().optional(),
      duration: z.string().optional(),
      durationUz: z.string().optional(),
      durationEn: z.string().optional(),
      extraSections: z.string().optional(),
      pageBlocks: z.string().optional(),
      sortOrder: z.number().default(0),
      status: z.enum(["active", "inactive"]).default("active"),
    }))
    .mutation(async ({ input, ctx }) => {
      await createProduct(input);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "created", entity: "product", entityTitle: input.title });
      return { success: true };
    }),

  update: editorProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      titleUz: z.string().optional(),
      titleEn: z.string().optional(),
      description: z.string().optional(),
      descriptionUz: z.string().optional(),
      descriptionEn: z.string().optional(),
      iconUrl: z.string().optional(),
      iconKey: z.string().optional(),
      tariffs: z.string().optional(),
      tariffHtml: z.string().optional(),
      ctaLink: z.string().optional(),
      category: z.string().optional(),
      coverageItems: z.string().optional(),
      risks: z.string().optional(),
      faq: z.string().optional(),
      steps: z.string().optional(),
      duration: z.string().optional(),
      durationUz: z.string().optional(),
      durationEn: z.string().optional(),
      extraSections: z.string().optional(),
      pageBlocks: z.string().optional(),
      sortOrder: z.number().optional(),
      status: z.enum(["active", "inactive"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateProduct(id, data);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "updated", entity: "product", entityId: id, entityTitle: data.title });
      return { success: true };
    }),

  delete: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteProduct(input.id);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "deleted", entity: "product", entityId: input.id });
      return { success: true };
    }),

  bulkDelete: editorProcedure
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(input.ids.map((id) => deleteProduct(id)));
      await logActivity({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Unknown",
        action: "deleted",
        entity: "product",
        entityTitle: `Bulk delete (${input.ids.length})`,
      });
      return { success: true };
    }),

  bulkStatus: editorProcedure
    .input(z.object({ ids: z.array(z.number()).min(1), status: z.enum(["active", "inactive"]) }))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(input.ids.map((id) => updateProduct(id, { status: input.status })));
      await logActivity({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Unknown",
        action: "updated",
        entity: "product",
        entityTitle: `Bulk status ${input.status} (${input.ids.length})`,
      });
      return { success: true };
    }),

  reorder: editorProcedure
    .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(input.map(({ id, sortOrder }) => updateProduct(id, { sortOrder })));
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "reordered", entity: "product" });
      return { success: true };
    }),
});

// ─── Media Router ─────────────────────────────────────────────────────────────
const mediaRouter = router({
  list: editorProcedure.query(async () => getAllMedia()),

  upload: editorProcedure
    .input(z.object({
      filename: z.string(),
      originalName: z.string(),
      mimeType: z.string(),
      size: z.number(),
      base64: z.string(), // base64 encoded file content
    }))
    .mutation(async ({ input, ctx }) => {
      if (!isStorageConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "File upload is not configured. Please set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY environment variables to enable file uploads."
        });
      }

      const ext = input.originalName.split(".").pop() ?? "bin";
      const fileKey = `media/${ctx.user.id}-${nanoid(8)}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      await createMedia({
        filename: input.filename,
        originalName: input.originalName,
        url,
        fileKey,
        mimeType: input.mimeType,
        size: input.size,
        uploadedBy: ctx.user.id,
      });

      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "uploaded", entity: "media", entityTitle: input.originalName });
      return { url, fileKey };
    }),

  delete: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const item = await deleteMedia(input.id);
      // Note: S3 file cleanup can be added when storageDelete is available
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "deleted", entity: "media", entityId: input.id, entityTitle: item?.originalName ?? undefined });
      return { success: true };
    }),
});

// ─── Branches Router ──────────────────────────────────────────────────────────
const branchesRouter = router({
  list: editorProcedure.query(async () => getAllBranches()),

  getById: editorProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const item = await getBranchById(input.id);
    if (!item) throw new TRPCError({ code: "NOT_FOUND" });
    return item;
  }),

  create: editorProcedure
    .input(z.object({
      name: z.string().min(1),
      nameUz: z.string().optional(),
      nameEn: z.string().optional(),
      address: z.string().optional(),
      addressUz: z.string().optional(),
      addressEn: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      workingHours: z.string().optional(),
      workingHoursUz: z.string().optional(),
      workingHoursEn: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      await createBranch(input);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "created", entity: "branch", entityTitle: input.name });
      return { success: true };
    }),

  update: editorProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      nameUz: z.string().optional(),
      nameEn: z.string().optional(),
      address: z.string().optional(),
      addressUz: z.string().optional(),
      addressEn: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      workingHours: z.string().optional(),
      workingHoursUz: z.string().optional(),
      workingHoursEn: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await updateBranch(id, data);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "updated", entity: "branch", entityId: id, entityTitle: data.name });
      return { success: true };
    }),

  delete: editorProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteBranch(input.id);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "deleted", entity: "branch", entityId: input.id });
      return { success: true };
    }),
});

// ─── Users Router ─────────────────────────────────────────────────────────────
const usersRouter = router({
  list: adminProcedure.query(async () => {
    const all = await getAllUsers();
    return all.map(({ passwordHash: _ph, ...rest }) => rest);
  }),

  updateRole: adminProcedure
    .input(z.object({ id: z.number(), role: z.enum(["user", "admin", "editor"]) }))
    .mutation(async ({ input, ctx }) => {
      await updateUserRole(input.id, input.role);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "role_changed", entity: "user", entityId: input.id });
      return { success: true };
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await toggleUserActive(input.id, input.isActive);
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: input.isActive ? "activated" : "deactivated", entity: "user", entityId: input.id });
      return { success: true };
    }),
});

// ─── Settings Router ──────────────────────────────────────────────────────────
const settingsRouter = router({
  getAll: editorProcedure.query(async () => {
    const rows = await getAllSettings();
    const result: Record<string, string> = {};
    rows.forEach((r) => { result[r.key] = r.value ?? ""; });
    return result;
  }),

  update: adminProcedure
    .input(z.record(z.string(), z.string()))
    .mutation(async ({ input, ctx }) => {
      await Promise.all(Object.entries(input).map(([key, value]) => upsertSetting(key, value)));
      await logActivity({ userId: ctx.user.id, userName: ctx.user.name ?? "Unknown", action: "updated", entity: "settings" });
      return { success: true };
    }),
});

// ─── Notifications Router ─────────────────────────────────────────────────────
const notificationsRouter = router({
  claimSubmission: publicProcedure
    .input(z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().optional(),
      message: z.string().optional(),
      type: z.enum(["claim", "contact"]),
    }))
    .mutation(async ({ input }) => {
      const title = input.type === "claim" ? "New Insurance Claim Submission" : "New Contact Request";
      const content = `**Name:** ${input.name}\n**Phone:** ${input.phone}\n${input.email ? `**Email:** ${input.email}\n` : ""}${input.message ? `**Message:** ${input.message}` : ""}`;
      await notifyOwner({ title, content });
      return { success: true };
    }),
});

// ─── Locale helper ────────────────────────────────────────────────────────────
type Locale = "ru" | "uz" | "en";

/** Pick the locale-specific value, falling back to RU (base) if empty */
function loc<T extends string | null | undefined>(base: T, uz: T, en: T, locale: Locale): T {
  if (locale === "uz") return (uz || base) as T;
  if (locale === "en") return (en || base) as T;
  return base as T;
}

// ─── Public Router (no auth required) ───────────────────────────────────────
const publicRouter = router({
  // Active insurance products sorted by sortOrder, locale-aware
  getProducts: publicProcedure
    .input(z.object({ locale: z.enum(["ru", "uz", "en"]).default("ru") }))
    .query(async ({ input }) => {
      const all = await getAllProducts();
      const locale = input.locale as Locale;
      return all
        .filter((p) => p.status === "active")
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((p) => ({
          ...p,
          title: loc(p.title, p.titleUz, p.titleEn, locale),
          description: loc(p.description, p.descriptionUz, p.descriptionEn, locale),
        }));
    }),

  // Single active product by ID, locale-aware
  getProductById: publicProcedure
    .input(z.object({ id: z.number(), locale: z.enum(["ru", "uz", "en"]).default("ru") }))
    .query(async ({ input }) => {
      const item = await getProductById(input.id);
      if (!item || item.status !== "active") return null;
      const locale = input.locale as Locale;
      return {
        ...item,
        title: loc(item.title, item.titleUz, item.titleEn, locale),
        description: loc(item.description, item.descriptionUz, item.descriptionEn, locale),
        duration: loc(item.duration, item.durationUz, item.durationEn, locale),
        tariffHtml: item.tariffHtml ?? null,
        // section JSON arrays are returned raw — client parses and picks locale
        coverageItems: item.coverageItems ?? null,
        risks: item.risks ?? null,
        faq: item.faq ?? null,
        steps: item.steps ?? null,
        extraSections: item.extraSections ?? null,
        pageBlocks: item.pageBlocks ?? null,
      };
    }),

  // Published news articles (latest first), locale-aware
  getNews: publicProcedure
    .input(z.object({ limit: z.number().default(10), category: z.string().optional(), locale: z.enum(["ru", "uz", "en"]).default("ru") }))
    .query(async ({ input }) => {
      const all = await getAllNews();
      const locale = input.locale as Locale;
      let published = all.filter((n) => n.status === "published");
      if (input.category) published = published.filter((n) => n.category === input.category);
      return published
        .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())
        .slice(0, input.limit)
        .map((n) => ({
          ...n,
          title: loc(n.title, n.titleUz, n.titleEn, locale),
          excerpt: loc(n.excerpt, n.excerptUz, n.excerptEn, locale),
          content: loc(n.content, n.contentUz, n.contentEn, locale),
        }));
    }),

  // Single published news article by slug, locale-aware
  getNewsBySlug: publicProcedure
    .input(z.object({ slug: z.string(), locale: z.enum(["ru", "uz", "en"]).default("ru") }))
    .query(async ({ input }) => {
      const all = await getAllNews();
      const locale = input.locale as Locale;
      const item = all.find((n) => n.slug === input.slug && n.status === "published");
      if (!item) return null;
      return {
        ...item,
        title: loc(item.title, item.titleUz, item.titleEn, locale),
        excerpt: loc(item.excerpt, item.excerptUz, item.excerptEn, locale),
        content: loc(item.content, item.contentUz, item.contentEn, locale),
      };
    }),

  // Single published page by slug, locale-aware
  getPageBySlug: publicProcedure
    .input(z.object({ slug: z.string(), locale: z.enum(["ru", "uz", "en"]).default("ru") }))
    .query(async ({ input }) => {
      const all = await getAllPages();
      const locale = input.locale as Locale;
      const page = all.find((p) => p.slug === input.slug && p.status === "published");
      if (!page) return null;
      return {
        ...page,
        title: loc(page.title, page.titleUz, page.titleEn, locale),
        content: loc(page.content, page.contentUz, page.contentEn, locale),
        metaTitle: loc(page.metaTitle, page.metaTitleUz, page.metaTitleEn, locale),
        metaDescription: loc(page.metaDescription, page.metaDescriptionUz, page.metaDescriptionEn, locale),
      };
    }),

  // Active branches, locale-aware
  getBranches: publicProcedure
    .input(z.object({ locale: z.enum(["ru", "uz", "en"]).default("ru") }))
    .query(async ({ input }) => {
      const all = await getAllBranches();
      const locale = input.locale as Locale;
      return all
        .filter((b) => b.isActive)
        .map((b) => ({
          ...b,
          name: loc(b.name, b.nameUz, b.nameEn, locale),
          address: loc(b.address, b.addressUz, b.addressEn, locale),
          workingHours: loc(b.workingHours, b.workingHoursUz, b.workingHoursEn, locale),
        }));
    }),

  // Site-wide settings as key-value map (locale-aware: returns _uz/_en variants merged)
  getSettings: publicProcedure
    .input(z.object({ locale: z.enum(["ru", "uz", "en"]).default("ru") }))
    .query(async ({ input }) => {
      const rows = await getAllSettings();
      const locale = input.locale as Locale;
      const all: Record<string, string> = {};
      rows.forEach((r) => { all[r.key] = r.value ?? ""; });
      // Build locale-resolved map: for each base key, prefer locale-specific variant
      const result: Record<string, string> = {};
      rows.forEach((r) => {
        // Skip locale-variant keys (they are merged below)
        if (r.key.endsWith("_uz") || r.key.endsWith("_en")) return;
        const uzVal = all[`${r.key}_uz`];
        const enVal = all[`${r.key}_en`];
        if (locale === "uz") result[r.key] = uzVal || r.value || "";
        else if (locale === "en") result[r.key] = enVal || r.value || "";
        else result[r.key] = r.value ?? "";
      });
      return result;
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => {
      const u = opts.ctx.user;
      if (!u) return null;
      const { passwordHash: _ph, ...rest } = u;
      return rest;
    }),
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByUsername(input.username);
        if (!user || !sdk.verifyPassword(input.password, user.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
        }
        if (!user.isActive) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Account is disabled" });
        }
        const sessionToken = await sdk.signSession(
          { userId: user.id, username: user.username, name: user.name || "" },
          { expiresInMs: ONE_YEAR_MS }
        );
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { ok: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: dashboardRouter,
  pages: pagesRouter,
  news: newsRouter,
  products: productsRouter,
  media: mediaRouter,
  branches: branchesRouter,
  users: usersRouter,
  settings: settingsRouter,
  notifications: notificationsRouter,
  public: publicRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
