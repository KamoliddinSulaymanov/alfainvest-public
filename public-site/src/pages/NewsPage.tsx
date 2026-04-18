import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Shield, Calendar, Tag, ArrowRight, Newspaper } from "lucide-react";
import Layout from "@/components/Layout";
import { useNews } from "@/lib/useCms";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function NewsPage() {
  const { t, locale } = useI18n();
  const { data: news, loading } = useNews(50, undefined, locale);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    if (!news) return [];
    return Array.from(new Set(news.map(n => n.category).filter(Boolean))) as string[];
  }, [news]);

  const filtered = useMemo(() => {
    if (!news) return [];
    return activeCategory === "all" ? news : news.filter(n => n.category === activeCategory);
  }, [news, activeCategory]);

  // Theme classes
  const pageBg = isDark ? "bg-[#1D283A]" : "bg-[#F8FAFC]";
  const heroBg = isDark ? "bg-gradient-to-br from-[#1D283A] via-[#1D3A4A] to-[#1D283A]" : "bg-gradient-to-br from-[#E8F4F4] via-[#F0FAFA] to-[#E8F4F4]";
  const heroTitle = isDark ? "text-white" : "text-slate-900";
  const heroSub = isDark ? "text-white/60" : "text-slate-600";
  const filterBarBg = isDark ? "bg-[#162031] border-white/5" : "bg-slate-100 border-slate-200";
  const filterBtnActive = "bg-[#13D6D1] text-[#1D283A] font-semibold";
  const filterBtnInactive = isDark ? "border-white/10 text-white/60 hover:border-[#13D6D1]/30 hover:text-[#13D6D1]" : "border-slate-200 text-slate-600 bg-white hover:border-[#13D6D1]/40 hover:text-[#0a9e9b]";
  const cardBg = isDark ? "bg-white/[0.02] border-white/8 hover:border-[#13D6D1]/30 hover:bg-[#13D6D1]/5" : "bg-white border-slate-200 shadow-sm hover:border-[#13D6D1]/40 hover:shadow-md";
  const cardTitle = isDark ? "text-white" : "text-slate-900";
  const cardDesc = isDark ? "text-white/50" : "text-slate-600";
  const dateColor = isDark ? "text-white/30" : "text-slate-500";
  const emptyText = isDark ? "text-white/40" : "text-slate-500";
  const skeletonBg = isDark ? "bg-white/5" : "bg-slate-200";
  const skeletonCard = isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50";
  const placeholderBg = isDark ? "bg-gradient-to-br from-[#13D6D1]/10 to-transparent" : "bg-gradient-to-br from-[#13D6D1]/5 to-slate-50";

  const dateLocale = locale === "uz" ? "uz-UZ" : locale === "en" ? "en-US" : "ru-RU";

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className={`relative overflow-hidden ${heroBg} py-24 md:py-32 px-4 sm:px-6 lg:px-8`}>
        {isDark && <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(19,214,209,0.12),transparent)]" />}
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13D6D1]/10 border border-[#13D6D1]/20 text-[#13D6D1] text-xs font-medium mb-6">
            <Tag className="h-3.5 w-3.5" />
            {t("news_hero_badge")}
          </div>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${heroTitle} leading-tight mb-6`}>
            {t("news_hero_title")} <span className="text-[#13D6D1]">{t("news_hero_title_accent")}</span>
          </h1>
          <p className={`text-lg ${heroSub} leading-relaxed max-w-2xl mx-auto`}>
            {t("news_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* ─── CATEGORY FILTER ─── */}
      {categories.length > 0 && (
        <section className={`py-5 px-4 sm:px-6 lg:px-8 border-b ${filterBarBg}`}>
          <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${activeCategory === "all" ? filterBtnActive : filterBtnInactive}`}
            >
              {t("news_filter_all")}
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
        </section>
      )}

      {/* ─── NEWS GRID ─── */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${pageBg}`}>
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className={`rounded-2xl border ${skeletonCard} animate-pulse overflow-hidden`}>
                  <div className={`h-48 ${skeletonBg}`} />
                  <div className="p-5 space-y-3">
                    <div className={`h-3 ${skeletonBg} rounded w-1/3`} />
                    <div className={`h-5 ${skeletonBg} rounded w-3/4`} />
                    <div className={`h-3 ${skeletonBg} rounded`} />
                    <div className={`h-3 ${skeletonBg} rounded w-2/3`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Newspaper className={`h-12 w-12 ${emptyText} mx-auto mb-4`} />
              <h3 className={`text-lg font-semibold ${emptyText} mb-2`}>{t("news_empty_title")}</h3>
              <p className={`text-sm ${emptyText}`}>{t("news_empty_subtitle")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(article => (
                <article
                  key={article.id}
                  className={`group rounded-2xl border ${cardBg} transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col`}
                >
                  {article.coverImageUrl ? (
                    <img src={article.coverImageUrl} alt={article.title} className="h-48 w-full object-cover" />
                  ) : (
                    <div className={`h-48 ${placeholderBg} flex items-center justify-center`}>
                      <Shield className="h-10 w-10 text-[#13D6D1]/30" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {article.category && (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#13D6D1] bg-[#13D6D1]/10 px-2 py-0.5 rounded">
                          {article.category}
                        </span>
                      )}
                      <time className={`text-xs ${dateColor} flex items-center gap-1`}>
                        <Calendar className="h-3 w-3" />
                        {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString(dateLocale, {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </time>
                    </div>
                    <h3 className={`text-base font-semibold ${cardTitle} mb-2 line-clamp-2`}>{article.title}</h3>
                    <p className={`text-sm ${cardDesc} leading-relaxed line-clamp-3 flex-1`}>
                      {article.content?.replace(/<[^>]+>/g, "").slice(0, 150)}...
                    </p>
                    <Link
                      href={`/news/${article.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#13D6D1] font-medium group-hover:underline"
                    >
                      {t("read_more")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
