import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  getAllPages: vi.fn().mockResolvedValue([]),
  getPageById: vi.fn().mockResolvedValue(null),
  createPage: vi.fn().mockResolvedValue({ id: 1, title: "Test", slug: "test", status: "draft" }),
  updatePage: vi.fn().mockResolvedValue({ id: 1, title: "Updated", slug: "test", status: "draft" }),
  deletePage: vi.fn().mockResolvedValue({ id: 1 }),
  getAllProducts: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn().mockResolvedValue({ id: 1, title: "Auto Insurance", status: "active", sortOrder: 0 }),
  getAllNews: vi.fn().mockResolvedValue([]),
  createNews: vi.fn().mockResolvedValue({ id: 1, title: "News", slug: "news", status: "draft" }),
  getAllMedia: vi.fn().mockResolvedValue([]),
  getAllBranches: vi.fn().mockResolvedValue([]),
  createBranch: vi.fn().mockResolvedValue({ id: 1, name: "Main Office", address: "Tashkent" }),
  getAllSettings: vi.fn().mockResolvedValue([]),
  upsertSetting: vi.fn().mockResolvedValue(undefined),
  logActivity: vi.fn().mockResolvedValue(undefined),
  getRecentActivity: vi.fn().mockResolvedValue([]),
  getDashboardMetrics: vi.fn().mockResolvedValue({ totalPages: 0, publishedNews: 0, totalMedia: 0, totalProducts: 0, totalBranches: 0, totalUsers: 0 }),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  toggleUserActive: vi.fn().mockResolvedValue(undefined),
  getUserByUsername: vi.fn().mockResolvedValue(null),
  getUserById: vi.fn().mockResolvedValue(null),
  updateLastSignedIn: vi.fn().mockResolvedValue(undefined),
  getProductById: vi.fn().mockResolvedValue(null),
  updateProduct: vi.fn().mockResolvedValue(null),
  deleteProduct: vi.fn().mockResolvedValue(null),
  reorderProducts: vi.fn().mockResolvedValue(undefined),
  getNewsById: vi.fn().mockResolvedValue(null),
  updateNews: vi.fn().mockResolvedValue(null),
  deleteNews: vi.fn().mockResolvedValue(null),
  getMediaById: vi.fn().mockResolvedValue(null),
  createMedia: vi.fn().mockResolvedValue({ id: 1, url: "https://cdn.example.com/test.jpg", originalName: "test.jpg" }),
  deleteMedia: vi.fn().mockResolvedValue(null),
  getBranchById: vi.fn().mockResolvedValue(null),
  updateBranch: vi.fn().mockResolvedValue(null),
  deleteBranch: vi.fn().mockResolvedValue(null),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "media/test.jpg", url: "https://cdn.example.com/test.jpg" }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      username: "admin",
      passwordHash: "mock-hash",
      name: "Admin User",
      email: "admin@alfainvest.uz",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function createEditorCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      username: "editor",
      passwordHash: "mock-hash",
      name: "Editor User",
      email: "editor@alfainvest.uz",
      role: "editor",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as any,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

describe("Dashboard", () => {
  it("returns metrics for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.dashboard.getMetrics();
    expect(result).toHaveProperty("totalPages");
    expect(result).toHaveProperty("publishedNews");
    expect(result).toHaveProperty("totalMedia");
  });

  it("returns recent activity for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.dashboard.getRecentActivity();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Pages Router", () => {
  it("lists pages for editor", async () => {
    const caller = appRouter.createCaller(createEditorCtx());
    const result = await caller.pages.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a page for editor", async () => {
    const caller = appRouter.createCaller(createEditorCtx());
    const result = await caller.pages.create({
      title: "Test Page",
      slug: "test-page",
      content: "<p>Content</p>",
      metaTitle: "Test",
      metaDescription: "Description",
      status: "draft",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("Products Router", () => {
  it("lists products for editor", async () => {
    const caller = appRouter.createCaller(createEditorCtx());
    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a product for editor", async () => {
    const caller = appRouter.createCaller(createEditorCtx());
    const result = await caller.products.create({
      title: "Auto Insurance",
      description: "Comprehensive auto coverage",
      iconUrl: "",
      tariffs: "",
      ctaLink: "/products/auto",
      sortOrder: 0,
      status: "active",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("Branches Router", () => {
  it("lists branches for editor", async () => {
    const caller = appRouter.createCaller(createEditorCtx());
    const result = await caller.branches.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a branch for editor", async () => {
    const caller = appRouter.createCaller(createEditorCtx());
    const result = await caller.branches.create({
      name: "Main Office",
      address: "Tashkent, Uzbekistan",
      phone: "+998 71 123 45 67",
      workingHours: "Mon-Fri 9:00-18:00",
    });
    expect(result).toEqual({ success: true });
  });
});

describe("Settings Router", () => {
  it("returns all settings for editor", async () => {
    const caller = appRouter.createCaller(createEditorCtx());
    const result = await caller.settings.getAll();
    expect(typeof result).toBe("object");
  });

  it("updates settings for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.settings.update({ company_name: "Alfa Invest" });
    expect(result).toEqual({ success: true });
  });
});

describe("Notifications Router", () => {
  it("sends claim notification", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
    const result = await caller.notifications.claimSubmission({
      name: "John Doe",
      phone: "+998 90 123 45 67",
      email: "john@example.com",
      message: "I need to file a claim",
      type: "claim",
    });
    expect(result).toEqual({ success: true });
  });
});
