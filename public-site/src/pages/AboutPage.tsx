import { Shield, Award, TrendingUp, Users, CheckCircle2, ArrowRight, Building2 } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { usePage, useSettings } from "@/lib/useCms";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";

const TIMELINE = [
  { year: "2003", ru: "Основание компании АО «ALFA INVEST sug'urta kompaniyasi»", uz: "«ALFA INVEST sug'urta kompaniyasi» AJ tashkil etildi", en: "Founded ALFA INVEST insurance company" },
  { year: "2008", ru: "Расширение продуктовой линейки, выход на корпоративный рынок", uz: "Mahsulot liniyasini kengaytirish, korporativ bozorga chiqish", en: "Expanded product line, entered corporate market" },
  { year: "2015", ru: "Получение наивысшего национального рейтинга надёжности UzA++", uz: "Eng yuqori milliy ishonchlilik reytingi UzA++ olindi", en: "Received highest national reliability rating UzA++" },
  { year: "2019", ru: "Присвоение международного рейтинга B2 от Moody's Investors Service", uz: "Moody's Investors Service tomonidan B2 xalqaro reytingi berildi", en: "Received international B2 rating from Moody's" },
  { year: "2023", ru: "Уставной капитал достиг 83,1 млрд сум. Запуск онлайн-страхования", uz: "Ustav kapitali 83,1 mlrd so'mga yetdi. Onlayn sug'urtani ishga tushirish", en: "Charter capital reached 83.1 billion UZS. Launch of online insurance" },
];

export default function AboutPage() {
  const { t, locale } = useI18n();
  const { data: page, loading } = usePage("about", locale);
  const { data: settings } = useSettings(locale);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const companyName = settings?.company_name || "ALFA INVEST";

  const pageBg = isDark ? "bg-[#1D283A]" : "bg-[#F8FAFC]";
  const altBg = isDark ? "bg-[#162031] border-white/5" : "bg-slate-100 border-slate-200";
  const heroBg = isDark ? "bg-gradient-to-br from-[#1D283A] via-[#1D3A4A] to-[#1D283A]" : "bg-gradient-to-br from-[#E8F4F4] via-[#F0FAFA] to-[#E8F4F4]";
  const heroTitle = isDark ? "text-white" : "text-slate-900";
  const heroSub = isDark ? "text-white/60" : "text-slate-600";
  const sectionLabel = "text-[#13D6D1] text-sm font-semibold uppercase tracking-widest mb-2";
  const sectionTitle = isDark ? "text-3xl md:text-4xl font-bold text-white" : "text-3xl md:text-4xl font-bold text-slate-900";
  const cardBg = isDark ? "bg-white/[0.02] border-white/8 hover:border-[#13D6D1]/20" : "bg-white border-slate-200 shadow-sm hover:border-[#13D6D1]/30";
  const cardTitle = isDark ? "text-white" : "text-slate-900";
  const cardDesc = isDark ? "text-white/50" : "text-slate-600";
  const statBg = isDark ? "bg-white/[0.02] border-white/8" : "bg-white border-slate-200 shadow-sm";
  const statValue = isDark ? "text-white" : "text-slate-900";
  const statLabel = isDark ? "text-white/60" : "text-slate-600";
  const missionBg = isDark ? "bg-[#162A3A] border-[#13D6D1]/10" : "bg-[#E8F4F4] border-[#13D6D1]/20";
  const missionTitle = isDark ? "text-white" : "text-slate-900";
  const missionText = isDark ? "text-white/70" : "text-slate-600";
  const timelineText = isDark ? "text-white/70" : "text-slate-600";
  const timelineLine = isDark ? "border-white/10" : "border-slate-200";
  const timelineCardBg = isDark ? "border-white/8 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm";
  const proseClass = isDark ? "prose prose-invert max-w-none prose-headings:text-[#13D6D1] prose-a:text-[#13D6D1]" : "prose max-w-none prose-headings:text-[#0a9e9b] prose-a:text-[#0a9e9b]";

  const STATS = [
    { icon: Award, value: "2003", label: t("stat_founded_label"), sub: t("stat_founded_sub") },
    { icon: TrendingUp, value: "83,1 млрд", label: t("stat_capital_label"), sub: t("stat_capital_sub") },
    { icon: Shield, value: "B2", label: t("stat_moody_label"), sub: t("stat_moody_sub") },
    { icon: Users, value: "UzA++", label: t("stat_national_label"), sub: t("stat_national_sub") },
  ];

  const VALUES = [
    { title: t("about_val_reliability"), desc: t("about_val_reliability_desc") },
    { title: t("about_val_transparency"), desc: t("about_val_transparency_desc") },
    { title: t("about_val_speed"), desc: t("about_val_speed_desc") },
    { title: t("about_val_innovation"), desc: t("about_val_innovation_desc") },
  ];

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className={`relative overflow-hidden ${heroBg} py-24 md:py-32 px-4 sm:px-6 lg:px-8`}>
        {isDark && <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(19,214,209,0.12),transparent)]" />}
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13D6D1]/10 border border-[#13D6D1]/20 text-[#13D6D1] text-xs font-medium mb-6">
            <Building2 className="h-3.5 w-3.5" />
            {t("about_hero_badge")}
          </div>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${heroTitle} leading-tight mb-6`}>
            {t("about_hero_title")} <span className="text-[#13D6D1]">{t("about_hero_title_accent")}</span>
          </h1>
          <p className={`text-lg ${heroSub} leading-relaxed max-w-2xl`}>
            {t("about_hero_subtitle").replace("ALFA INVEST", companyName)}
          </p>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className={`py-12 px-4 sm:px-6 lg:px-8 border-y ${altBg}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className={`text-center p-4 rounded-2xl border ${statBg}`}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 mb-3">
                <Icon className="h-5 w-5 text-[#13D6D1]" />
              </div>
              <div className={`text-2xl font-bold ${statValue} mb-0.5`}>{value}</div>
              <div className={`text-xs font-medium ${statLabel}`}>{label}</div>
              <div className={`text-xs ${isDark ? "text-white/30" : "text-slate-500"}`}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CMS CONTENT ─── */}
      {(loading || page?.content) && (
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${pageBg}`}>
          <div className="max-w-4xl mx-auto">
            <p className={sectionLabel}>{t("about_cms_content_label")}</p>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-4 rounded ${isDark ? "bg-white/5" : "bg-slate-200"} ${i === 4 ? "w-2/3" : ""}`} />
                ))}
              </div>
            ) : (
              <div className={proseClass} dangerouslySetInnerHTML={{ __html: page!.content || "" }} />
            )}
          </div>
        </section>
      )}

      {/* ─── TIMELINE ─── */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${altBg}`}>
        <div className="max-w-7xl mx-auto">
          <p className={sectionLabel}>{t("about_history_label")}</p>
          <h2 className={`${sectionTitle} mb-12`}>{t("about_history_title")}</h2>
          <div className="relative max-w-2xl">
            {TIMELINE.map(({ year, ru, uz, en }, i) => {
              const eventText = locale === "uz" ? uz : locale === "en" ? en : ru;
              return (
                <div key={year} className={`flex gap-4 ${i < TIMELINE.length - 1 ? "pb-8" : ""}`}>
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-[#13D6D1] border-2 border-[#13D6D1]/30 shrink-0 mt-1" />
                    {i < TIMELINE.length - 1 && <div className={`w-px flex-1 border-l-2 border-dashed ${timelineLine} mt-2`} />}
                  </div>
                  <div className={`flex-1 pb-2 p-4 rounded-xl border ${timelineCardBg} transition-all`}>
                    <span className="text-[#13D6D1] font-bold text-sm block mb-1">{year}</span>
                    <p className={`text-sm ${timelineText}`}>{eventText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── MISSION ─── */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${pageBg}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-3xl border ${missionBg} p-10 md:p-14`}>
            <p className={sectionLabel}>{t("about_mission_label")}</p>
            <h2 className={`text-3xl md:text-4xl font-bold ${missionTitle} mb-6`}>{t("about_mission_title")}</h2>
            <p className={`text-lg ${missionText} leading-relaxed max-w-3xl`}>{t("about_mission_text")}</p>
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${altBg}`}>
        <div className="max-w-7xl mx-auto">
          <p className={sectionLabel}>{t("about_values_label")}</p>
          <h2 className={`${sectionTitle} mb-10`}>{t("about_values_title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ title, desc }) => (
              <div key={title} className={`rounded-2xl border ${cardBg} p-6 transition-all`}>
                <div className="w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-5 w-5 text-[#13D6D1]" />
                </div>
                <h3 className={`font-semibold ${cardTitle} mb-2`}>{title}</h3>
                <p className={`text-sm ${cardDesc} leading-relaxed`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1D283A] via-[#1D3A4A] to-[#1D283A] p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(19,214,209,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">{t("cta_title")}</h2>
              <p className="text-white/60 max-w-xl mx-auto mb-8">{t("cta_subtitle")}</p>
              <Link href="/contacts" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] font-semibold hover:bg-[#0fc4bf] transition-all">
                {t("cta_btn")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
