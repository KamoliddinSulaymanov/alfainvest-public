import { useState, useMemo } from "react";
import { Shield, Home, Plane, Car, Briefcase, HeartPulse, ArrowRight, Search } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { useProducts } from "@/lib/useCms";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { Product } from "@/lib/api";

const ICON_MAP: Record<string, React.ElementType> = {
  имущество: Home, квартир: Home, дом: Home, mulk: Home, uy: Home,
  личн: HeartPulse, несчастн: HeartPulse, здоровь: HeartPulse, shaxsiy: HeartPulse,
  путешеств: Plane, авиа: Plane, sayohat: Plane,
  ответственност: Car, авто: Car,
  корпоратив: Briefcase, бизнес: Briefcase, груз: Briefcase, korporativ: Briefcase,
};

function getIcon(title: string): React.ElementType {
  const lower = title.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Shield;
}

const FALLBACK: Product[] = [
  { id: 1, title: "Страхование имущества", description: "Защита недвижимости, квартир, домов и ценного имущества от пожара, затопления, кражи и других рисков.", iconUrl: null, category: "Имущество", tariffs: null, ctaLink: null, sortOrder: 1, status: "active", createdAt: "" },
  { id: 2, title: "Личное страхование", description: "Комплексная защита жизни и здоровья, страхование от несчастных случаев и болезней.", iconUrl: null, category: "Личное", tariffs: null, ctaLink: null, sortOrder: 2, status: "active", createdAt: "" },
  { id: 3, title: "Страхование путешественников", description: "Медицинская страховка, страхование багажа и отмены поездки для путешествий по всему миру.", iconUrl: null, category: "Путешествия", tariffs: null, ctaLink: null, sortOrder: 3, status: "active", createdAt: "" },
  { id: 4, title: "Корпоративное страхование", description: "Комплексные решения для защиты бизнеса: страхование сотрудников, имущества и ответственности.", iconUrl: null, category: "Корпоративное", tariffs: null, ctaLink: null, sortOrder: 4, status: "active", createdAt: "" },
  { id: 5, title: "Страхование ответственности", description: "Защита от финансовых потерь при причинении вреда третьим лицам или их имуществу.", iconUrl: null, category: "Ответственность", tariffs: null, ctaLink: null, sortOrder: 5, status: "active", createdAt: "" },
  { id: 6, title: "Страхование грузов", description: "Надёжная защита грузов при транспортировке автомобильным, железнодорожным и воздушным транспортом.", iconUrl: null, category: "Корпоративное", tariffs: null, ctaLink: null, sortOrder: 6, status: "active", createdAt: "" },
];

export default function ServicesPage() {
  const { t, locale } = useI18n();
  const { data: products, loading } = useProducts(locale);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const displayProducts = (products && products.length > 0) ? products : FALLBACK;

  const categories = useMemo(() => {
    return Array.from(new Set(displayProducts.map(p => p.category).filter(Boolean))) as string[];
  }, [displayProducts]);

  const filtered = useMemo(() => {
    return displayProducts.filter(p => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [displayProducts, activeCategory, search]);

  // Theme classes
  const pageBg = isDark ? "bg-[#1D283A]" : "bg-[#F8FAFC]";
  const heroBg = isDark ? "bg-gradient-to-br from-[#1D283A] via-[#1D3A4A] to-[#1D283A]" : "bg-gradient-to-br from-[#E8F4F4] via-[#F0FAFA] to-[#E8F4F4]";
  const heroTitle = isDark ? "text-white" : "text-slate-900";
  const heroSub = isDark ? "text-white/60" : "text-slate-600";
  const filterBarBg = isDark ? "bg-[#162031] border-white/5" : "bg-slate-100 border-slate-200";
  const filterBtnActive = "bg-[#13D6D1] text-[#1D283A] font-semibold";
  const filterBtnInactive = isDark ? "border-white/10 text-white/60 hover:border-[#13D6D1]/30 hover:text-[#13D6D1]" : "border-slate-200 text-slate-600 bg-white hover:border-[#13D6D1]/40 hover:text-[#0a9e9b]";
  const searchBg = isDark ? "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#13D6D1]/50" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#13D6D1]/50";
  const searchIcon = isDark ? "text-white/30" : "text-slate-500";
  const cardBg = isDark ? "bg-white/[0.02] border-white/8 hover:border-[#13D6D1]/30 hover:bg-[#13D6D1]/5" : "bg-white border-slate-200 shadow-sm hover:border-[#13D6D1]/40 hover:shadow-md";
  const cardTitle = isDark ? "text-white" : "text-slate-900";
  const cardDesc = isDark ? "text-white/50" : "text-slate-600";
  const emptyIcon = isDark ? "text-white/20" : "text-slate-300";
  const emptyText = isDark ? "text-white/40" : "text-slate-500";
  const skeletonBg = isDark ? "bg-white/5" : "bg-slate-200";
  const skeletonCard = isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50";

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className={`relative overflow-hidden ${heroBg} py-24 md:py-32 px-4 sm:px-6 lg:px-8`}>
        {isDark && <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(19,214,209,0.12),transparent)]" />}
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13D6D1]/10 border border-[#13D6D1]/20 text-[#13D6D1] text-xs font-medium mb-6">
            <Shield className="h-3.5 w-3.5" />
            {t("services_hero_badge")}
          </div>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${heroTitle} leading-tight mb-6`}>
            {t("services_hero_title")} <span className="text-[#13D6D1]">{t("services_hero_title_accent")}</span>
          </h1>
          <p className={`text-lg ${heroSub} leading-relaxed max-w-2xl mx-auto`}>
            {t("services_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* ─── FILTERS + SEARCH ─── */}
      <section className={`py-6 px-4 sm:px-6 lg:px-8 border-b ${filterBarBg}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-xl text-sm border transition-all ${activeCategory === "all" ? filterBtnActive : filterBtnInactive}`}
              >
                {t("services_filter_all")}
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${activeCategory === cat ? filterBtnActive : filterBtnInactive}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${searchIcon}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("search")}
                className={`pl-9 pr-4 py-2 rounded-xl border text-sm outline-none transition-all w-52 ${searchBg}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS GRID ─── */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${pageBg}`}>
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className={`rounded-2xl border ${skeletonCard} p-6 animate-pulse`}>
                  <div className={`w-10 h-10 rounded-xl ${skeletonBg} mb-4`} />
                  <div className={`h-4 ${skeletonBg} rounded mb-2 w-3/4`} />
                  <div className={`h-3 ${skeletonBg} rounded mb-1`} />
                  <div className={`h-3 ${skeletonBg} rounded w-2/3`} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Shield className={`h-12 w-12 ${emptyIcon} mx-auto mb-4`} />
              <h3 className={`text-lg font-semibold ${emptyText} mb-2`}>{t("services_empty_title")}</h3>
              <p className={`text-sm ${emptyText}`}>{t("services_empty_subtitle")}</p>
              {activeCategory !== "all" && (
                <button onClick={() => setActiveCategory("all")} className="mt-4 text-sm text-[#13D6D1] hover:underline">
                  {t("services_filter_all")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(product => {
                const Icon = getIcon(product.title);
                return (
                  <Link key={product.id} href={`/products/${product.id}`} className={`group rounded-2xl border ${cardBg} transition-all hover:-translate-y-0.5 p-6 flex flex-col`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center group-hover:bg-[#13D6D1]/20 transition-all">
                        <Icon className="h-5 w-5 text-[#13D6D1]" />
                      </div>
                      {product.category && (
                        <span className="text-xs font-medium text-[#13D6D1] bg-[#13D6D1]/10 px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-semibold ${cardTitle} mb-2 group-hover:text-[#13D6D1] transition-colors`}>{product.title}</h3>
                    <p className={`text-sm ${cardDesc} leading-relaxed flex-1 line-clamp-3`}>
                      {product.description || t("no_data")}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs text-[#13D6D1] font-medium">
                      {t("learn_more")} <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1D283A] via-[#1D3A4A] to-[#1D283A] p-10 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(19,214,209,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t("services_cta_title")}</h2>
              <p className="text-white/60 max-w-xl mx-auto mb-6 text-sm">{t("services_cta_subtitle")}</p>
              <Link href="/contacts" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] font-semibold hover:bg-[#0fc4bf] transition-all">
                {t("services_cta_btn")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
