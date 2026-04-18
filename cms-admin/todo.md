# Alfa Invest CMS Admin Panel — TODO

## Database Schema
- [x] users table (id, openId, name, email, role, isActive, createdAt)
- [x] pages table (id, title, slug, content, metaTitle, metaDesc, status, createdAt, updatedAt)
- [x] news table (id, title, slug, content, coverImageUrl, category, status, publishedAt, createdAt)
- [x] products table (id, title, description, iconUrl, tariffs, ctaLink, sortOrder, status)
- [x] media table (id, filename, url, fileKey, mimeType, size, createdAt, uploadedBy)
- [x] branches table (id, name, address, phone, workingHours, lat, lng, createdAt)
- [x] settings table (id, key, value)
- [x] activityLog table (id, userId, userName, action, entity, entityId, entityTitle, createdAt)
- [x] DB migration applied (pnpm db:push)

## Backend API (tRPC Routers)
- [x] pages router (list, getById, create, update, delete, toggleStatus)
- [x] news router (list, getById, create, update, delete, toggleStatus)
- [x] products router (list, getById, create, update, delete, reorder)
- [x] media router (list, upload to S3, delete)
- [x] branches router (list, getById, create, update, delete)
- [x] users router (list, updateRole, toggleActive)
- [x] settings router (getAll, update)
- [x] dashboard router (getMetrics, getRecentActivity)
- [x] notifications router (claimSubmission — notifyOwner on claim/contact)

## Frontend — Layout & Navigation
- [x] Dark theme CSS variables in index.css (teal #13D6D1 accent)
- [x] DashboardLayout with sidebar (Dashboard, Pages, Products, News, Media, Branches, Users, Settings)
- [x] Route protection (admin/editor only, redirect to login)
- [x] App.tsx routing for all 8 pages

## Frontend — Pages
- [x] Dashboard Home (metrics cards + recent activity feed)
- [x] Pages Manager (list table + create/edit modal + SEO fields)
- [x] Insurance Products Manager (list table + create/edit modal + ordering arrows)
- [x] News & Press Center Manager (list table + create/edit modal + cover image + tags)
- [x] Media Library (grid view + drag-drop upload + CDN URL copy + preview dialog)
- [x] Branch/Office Manager (card grid + create/edit modal with map coordinates)
- [x] User & Role Management (list + role assignment + activate/deactivate)
- [x] Settings Page (grouped config form: company, contacts, social links, footer + floating save)

## Auth & Security
- [x] Role-based access control (admin/editor only)
- [x] adminProcedure middleware for admin-only operations
- [x] editorProcedure middleware for editor/admin operations
- [x] Login redirect for unauthenticated users

## Tests
- [x] auth.logout vitest
- [x] dashboard router vitest
- [x] pages router vitest
- [x] products router vitest
- [x] branches router vitest
- [x] settings router vitest
- [x] notifications router vitest

## Public Informational Pages (New)
- [x] PublicLayout component (header with nav, footer)
- [x] Public routes in App.tsx (/home-page, /about, /services)
- [x] HomePage — hero banner (1440x351), stats, products grid, CTA
- [x] AboutPage — company story, mission, key stats, values
- [x] ServicesPage — insurance products grid with category filters

## CMS Integration for Public Pages
- [x] publicProcedure endpoints: products.listPublic, pages.getBySlug, news.listPublic, settings.getPublic
- [x] HomePage: load products from DB, site settings (name, contacts) from DB
- [x] ServicesPage: load products from DB with category filter
- [x] AboutPage: load "about" page content from DB (Pages Manager)
- [x] PublicLayout: load site name, contacts, social links from Settings
- [x] Loading skeletons for all public pages
- [x] Empty/fallback states when CMS data is missing

## CMS Integration — Remaining Gaps
- [x] Public news endpoint (public.getNews) and render on public pages
- [x] HomePage: verify products + settings (company name, contacts) render from DB
- [x] ServicesPage: dynamic category filter from CMS product categories
- [x] AboutPage: render full rich-text body from Pages Manager (not just hero meta)
- [x] PublicLayout: bind social links (Telegram, Instagram, Facebook) from settings
- [x] Loading skeletons for HomePage and AboutPage (not just spinner)

## Multilingual Content Support (RU / UZ / EN)
- [x] DB schema: added _uz and _en columns to news (title, excerpt, content), products (title, description), pages (title, content, metaTitle, metaDescription), branches (name, address, workingHours)
- [x] DB migration applied (pnpm db:push)
- [x] LangTabs component created (reusable RU/UZ/EN tab switcher for forms)
- [x] NewsManager: language tabs for title, excerpt, content fields
- [x] ProductsManager: language tabs for title and description fields
- [x] BranchesManager: language tabs for name, address, workingHours fields
- [x] branches router: create/update accept nameUz, nameEn, addressUz, addressEn, workingHoursUz, workingHoursEn
- [x] news router: create/update accept titleUz, titleEn, excerptUz, excerptEn, contentUz, contentEn
- [x] products router: create/update accept titleUz, titleEn, descriptionUz, descriptionEn
- [x] Public router: all endpoints accept locale param (ru/uz/en) and return locale-resolved content
- [x] New public.getNewsBySlug endpoint with locale support
- [x] Public site api.ts: all API calls pass locale parameter
- [x] Public site useCms.ts: all hooks accept locale parameter and re-fetch on locale change
- [x] Public site pages: HomePage, ServicesPage, NewsPage, ContactsPage, AboutPage, NewsDetailPage all pass locale to hooks

## Umami Analytics Integration
- [x] Add UMAMI_URL, UMAMI_USERNAME, UMAMI_PASSWORD, UMAMI_WEBSITE_ID env vars to server env.ts
- [x] Build server/analyticsRouter.ts tRPC router (getStats, getPageviews, getTopPages, getTopReferrers, getActiveVisitors, getDevices, getCountries, getBrowsers, getStatus)
- [x] Build client/src/pages/AnalyticsPage.tsx with stats cards, pageviews chart, top pages, referrers, devices pie, countries bar, browsers bar
- [x] Add Analytics nav item (BarChart2 icon) to DashboardLayout sidebar
- [x] Register /analytics route in App.tsx

## Umami Settings from Admin UI
- [x] Add Umami Analytics section to SettingsPage with URL, username, password, website ID fields + Test Connection button
- [x] Add analytics.testConnection tRPC procedure to verify Umami credentials
- [x] Update analyticsRouter to read credentials from DB settings (fallback to ENV vars)
