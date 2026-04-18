import { Link } from "wouter";
import {
  Shield, Home, Plane, Car, Briefcase, HeartPulse,
  ArrowRight, Phone, CheckCircle2, Star, Award, TrendingUp, Users,
  ChevronRight, Newspaper,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useProducts, useNews, useSettings } from "@/lib/useCms";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";

const ICON_MAP: Record<string, React.ElementType> = {
  имущество: Home, квартир: Home, дом: Home, mulk: Home, uy: Home,
  личн: HeartPulse, несчастн: HeartPulse, здоровь: HeartPulse, shaxsiy: HeartPulse, sog: HeartPulse,
  путешеств: Plane, авиа: Plane, перелет: Plane, sayohat: Plane,
  ответственност: Car, авто: Car, transport: Car,
  корпоратив: Briefcase, бизнес: Briefcase, груз: Briefcase, korporativ: Briefcase,
};

function getProductIcon(title: string): React.ElementType {
  const lower = title.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Shield;
}

const FALLBACK_PRODUCTS = [
  { id: 1, title: "Страхование имущества", description: "Защита вашей недвижимости и ценного имущества от непредвиденных рисков.", icon: "home", category: "property", ctaLink: null },
  { id: 2, title: "Личное страхование", description: "Комплексная защита жизни и здоровья для вас и вашей семьи.", icon: "heart", category: "personal", ctaLink: null },
  { id: 3, title: "Страхование путешественников", description: "Полная страховая защита во время поездок по всему миру.", icon: "plane", category: "travel", ctaLink: null },
  { id: 4, title: "Корпоративное страхование", description: "Комплексные решения для защиты бизнеса и сотрудников.", icon: "briefcase", category: "corporate", ctaLink: null },
  { id: 5, title: "Страхование ответственности", description: "Защита от финансовых потерь при причинении вреда третьим лицам.", icon: "car", category: "liability", ctaLink: null },
  { id: 6, title: "Страхование грузов", description: "Надёжная защита грузов при транспортировке любым видом транспорта.", icon: "briefcase", category: "corporate", ctaLink: null },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const { data: products, loading: productsLoading } = useProducts(locale);
  const { data: news, loading: newsLoading } = useNews(3, undefined, locale);
  const { data: settings } = useSettings(locale);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const companyName = settings?.company_name || "ALFA INVEST";
  const phone = settings?.contact_phone || "+998 78 120 00 80";
  const shortPhone = settings?.contact_short_phone || "1182";

  const displayProducts = (products && products.length > 0) ? products : FALLBACK_PRODUCTS;

  const WHY_FEATS = [
    t("why_feat_1"), t("why_feat_2"), t("why_feat_3"),
    t("why_feat_4"), t("why_feat_5"), t("why_feat_6"),
  ];

  // Theme-aware classes
  const sectionBg = isDark ? "bg-[#1D283A]" : "bg-[#F8FAFC]";
  const altBg = isDark ? "bg-[#162031] border-white/5" : "bg-slate-100 border-slate-200";
  const cardBorder = isDark ? "border-white/8 bg-white/[0.02] hover:border-[#13D6D1]/30 hover:bg-[#13D6D1]/5" : "border-slate-200 bg-white hover:border-[#13D6D1]/40 hover:shadow-md";
  const cardTitle = isDark ? "text-white" : "text-slate-900";
  const cardDesc = isDark ? "text-white/50" : "text-slate-600";
  const statValue = isDark ? "text-white" : "text-slate-900";
  const statLabel = isDark ? "text-white/60" : "text-slate-600";
  const statSub = isDark ? "text-white/30" : "text-slate-500";
  const sectionLabel = "text-[#13D6D1] text-sm font-semibold uppercase tracking-widest mb-2";
  const sectionTitle = isDark ? "text-3xl md:text-4xl font-bold text-white" : "text-3xl md:text-4xl font-bold text-slate-900";
  const heroBg = isDark
    ? "bg-gradient-to-br from-[#1D283A] via-[#1D3A4A] to-[#1D283A]"
    : "bg-gradient-to-br from-[#E8F4F4] via-[#F0FAFA] to-[#E8F4F4]";
  const heroTitle = isDark ? "text-white" : "text-slate-900";
  const heroSubtitle = isDark ? "text-white/60" : "text-slate-600";
  const heroSecondaryBtn = isDark
    ? "border-white/15 text-white/80 hover:bg-white/5"
    : "border-slate-300 text-slate-700 hover:bg-slate-100";
  const whyBg = isDark ? "bg-[#162A3A]" : "bg-[#E8F4F4]";
  const whyTitle = isDark ? "text-white" : "text-slate-900";
  const whySubtitle = isDark ? "text-white/60" : "text-slate-600";
  const whyFeatText = isDark ? "text-white/80" : "text-slate-700";
  const newsBorder = isDark ? "border-white/8 bg-white/[0.02] hover:border-[#13D6D1]/30" : "border-slate-200 bg-white hover:border-[#13D6D1]/40 hover:shadow-md";
  const newsDate = isDark ? "text-white/40" : "text-slate-500";
  const newsTitle2 = isDark ? "text-white" : "text-slate-900";
  const newsExcerpt = isDark ? "text-white/50" : "text-slate-600";
  const newsPlaceholder = isDark ? "bg-white/5" : "bg-slate-100";

  const STATS = [
    { icon: Award, value: "2003", label: t("stat_founded_label"), sub: t("stat_founded_sub") },
    { icon: TrendingUp, value: "83,1 млрд", label: t("stat_capital_label"), sub: t("stat_capital_sub") },
    { icon: Star, value: "B2", label: t("stat_moody_label"), sub: t("stat_moody_sub") },
    { icon: Users, value: "UzA++", label: t("stat_national_label"), sub: t("stat_national_sub") },
  ];

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className={`relative overflow-hidden ${heroBg}`} style={{ minHeight: "351px" }}>
        {isDark && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(19,214,209,0.12),transparent)]" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </>
        )}
        {!isDark && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(19,214,209,0.08),transparent)]" />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13D6D1]/10 border border-[#13D6D1]/20 text-[#13D6D1] text-xs font-medium mb-6">
              <Shield className="h-3.5 w-3.5" />
              {t("hero_badge")}
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${heroTitle} leading-tight mb-6`}>
              {t("hero_title")}{" "}
              <span className="text-[#13D6D1]">{t("hero_title_accent")}</span>
            </h1>
            <p className={`text-lg ${heroSubtitle} leading-relaxed mb-8 max-w-xl`}>
              {t("hero_subtitle").replace("ALFA INVEST", companyName)}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] font-semibold hover:bg-[#0fc4bf] transition-all hover:shadow-lg hover:shadow-[#13D6D1]/20"
              >
                {t("hero_cta_primary")} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${shortPhone}`}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border ${heroSecondaryBtn} font-medium transition-all`}
              >
                <Phone className="h-4 w-4" />
                {t("nav_short_number")} {shortPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className={`py-12 px-4 sm:px-6 lg:px-8 border-y ${altBg}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 mb-3">
                <Icon className="h-5 w-5 text-[#13D6D1]" />
              </div>
              <div className={`text-2xl font-bold ${statValue} mb-0.5`}>{value}</div>
              <div className={`text-xs font-medium ${statLabel}`}>{label}</div>
              <div className={`text-xs ${statSub}`}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRODUCTS ─── */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${sectionBg}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className={sectionLabel}>{t("products_section_label")}</p>
              <h2 className={sectionTitle}>{t("products_section_title")}</h2>
            </div>
            <Link href="/services" className="hidden sm:inline-flex items-center gap-2 text-sm text-[#13D6D1] hover:underline">
              {t("all_products")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className={`rounded-2xl border ${isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50"} p-6 animate-pulse`}>
                  <div className={`w-10 h-10 rounded-xl ${isDark ? "bg-white/5" : "bg-slate-200"} mb-4`} />
                  <div className={`h-4 ${isDark ? "bg-white/5" : "bg-slate-200"} rounded mb-2 w-3/4`} />
                  <div className={`h-3 ${isDark ? "bg-white/5" : "bg-slate-200"} rounded mb-1`} />
                  <div className={`h-3 ${isDark ? "bg-white/5" : "bg-slate-200"} rounded w-2/3`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayProducts.slice(0, 6).map((product) => {
                const Icon = getProductIcon(product.title);
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className={`group rounded-2xl border ${cardBorder} transition-all hover:-translate-y-0.5 p-6 flex flex-col`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mb-4 group-hover:bg-[#13D6D1]/20 transition-all">
                      <Icon className="h-5 w-5 text-[#13D6D1]" />
                    </div>
                    <h3 className={`text-base font-semibold ${cardTitle} mb-2 group-hover:text-[#13D6D1] transition-colors`}>{product.title}</h3>
                    <p className={`text-sm ${cardDesc} leading-relaxed flex-1 line-clamp-3`}>
                      {product.description || t("no_data")}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs text-[#13D6D1] font-medium">
                      {t("read_more")} <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${whyBg}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className={sectionLabel}>{t("why_section_label")}</p>
              <h2 className={`text-3xl md:text-4xl font-bold ${whyTitle} mb-4`}>{t("why_section_title")}</h2>
              <p className={`${whySubtitle} leading-relaxed mb-8`}>{t("why_section_subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13D6D1] text-[#1D283A] font-semibold text-sm hover:bg-[#0fc4bf] transition-all"
                >
                  {t("why_btn_about")} <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`tel:${phone}`}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border ${isDark ? "border-white/15 text-white/70 hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"} text-sm font-medium transition-all`}
                >
                  <Phone className="h-4 w-4" />{phone}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {WHY_FEATS.map((feat, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? "bg-white/3 border border-white/5" : "bg-white border border-slate-200 shadow-sm"}`}>
                  <CheckCircle2 className="h-5 w-5 text-[#13D6D1] shrink-0 mt-0.5" />
                  <span className={`text-sm ${whyFeatText} leading-relaxed`}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEWS ─── */}
      {(newsLoading || (news && news.length > 0)) && (
        <section className={`py-20 px-4 sm:px-6 lg:px-8 ${sectionBg}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className={sectionLabel}>{t("news_section_label")}</p>
                <h2 className={sectionTitle}>{t("news_section_title")}</h2>
              </div>
              <Link href="/news" className="hidden sm:inline-flex items-center gap-2 text-sm text-[#13D6D1] hover:underline">
                {t("news_all")} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {newsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map((i) => (
                  <div key={i} className={`rounded-2xl border ${isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50"} overflow-hidden animate-pulse`}>
                    <div className={`h-48 ${isDark ? "bg-white/5" : "bg-slate-200"}`} />
                    <div className="p-5 space-y-2">
                      <div className={`h-3 ${isDark ? "bg-white/5" : "bg-slate-200"} rounded w-1/3`} />
                      <div className={`h-4 ${isDark ? "bg-white/5" : "bg-slate-200"} rounded`} />
                      <div className={`h-3 ${isDark ? "bg-white/5" : "bg-slate-200"} rounded w-2/3`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news!.map((article) => {
                  const excerpt = article.content
                    ? article.content.replace(/<[^>]+>/g, "").slice(0, 120) + "..."
                    : "";
                  return (
                    <Link
                      key={article.id}
                      href={`/news/${article.slug}`}
                      className={`group rounded-2xl border ${newsBorder} overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col`}
                    >
                      {article.coverImageUrl ? (
                        <img src={article.coverImageUrl} alt={article.title} className="w-full h-48 object-cover" />
                      ) : (
                        <div className={`h-48 ${newsPlaceholder} flex items-center justify-center`}>
                          <Newspaper className="h-10 w-10 text-[#13D6D1]/30" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {article.category && (
                            <span className="text-xs font-medium text-[#13D6D1] bg-[#13D6D1]/10 px-2 py-0.5 rounded-full">
                              {article.category}
                            </span>
                          )}
                          <span className={`text-xs ${newsDate}`}>
                            {new Date(article.publishedAt || article.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                        <h3 className={`text-sm font-semibold ${newsTitle2} mb-2 line-clamp-2 group-hover:text-[#13D6D1] transition-colors`}>
                          {article.title}
                        </h3>
                        {excerpt && <p className={`text-xs ${newsExcerpt} line-clamp-2 flex-1`}>{excerpt}</p>}
                        <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#13D6D1] font-medium">
                          {t("news_read_more")} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1D283A] via-[#1D3A4A] to-[#1D283A] p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(19,214,209,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta_title")}</h2>
              <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">{t("cta_subtitle")}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/contacts"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] font-semibold hover:bg-[#0fc4bf] transition-all"
                >
                  {t("cta_btn")} <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white/80 font-medium hover:bg-white/5 transition-all"
                >
                  <Phone className="h-4 w-4" />{phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
