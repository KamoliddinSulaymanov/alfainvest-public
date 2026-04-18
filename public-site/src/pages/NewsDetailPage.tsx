import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Tag, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import { api, type NewsArticle } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";

interface Props { slug: string }

export default function NewsDetailPage({ slug }: Props) {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    api.getNewsBySlug(slug, locale).then(article => {
      setArticle(article);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug, locale]);

  const pageBg = isDark ? "bg-[#1D283A]" : "bg-[#F8FAFC]";
  const backColor = isDark ? "text-white/40 hover:text-[#13D6D1]" : "text-slate-500 hover:text-[#0a9e9b]";
  const titleColor = isDark ? "text-white" : "text-slate-900";
  const dateColor = isDark ? "text-white/30" : "text-slate-500";
  const emptyIcon = isDark ? "text-white/20" : "text-slate-300";
  const emptyText = isDark ? "text-white/40" : "text-slate-500";
  const skeletonBg = isDark ? "bg-white/5" : "bg-slate-200";
  const imgBorder = isDark ? "border-white/8" : "border-slate-200";
  const noContent = isDark ? "text-white/50" : "text-slate-600";
  const proseClass = isDark ? "prose-cms prose-cms-dark" : "prose-cms prose-cms-light";
  const dateLocale = locale === "uz" ? "uz-UZ" : locale === "en" ? "en-US" : "ru-RU";

  return (
    <Layout>
      <div className={`min-h-screen ${pageBg}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/news" className={`inline-flex items-center gap-2 text-sm ${backColor} transition-colors mb-8`}>
            <ArrowLeft className="h-4 w-4" /> {t("back_to_news")}
          </Link>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className={`h-8 ${skeletonBg} rounded w-3/4`} />
              <div className={`h-4 ${skeletonBg} rounded w-1/3`} />
              <div className={`h-64 ${skeletonBg} rounded-2xl`} />
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => <div key={i} className={`h-4 ${skeletonBg} rounded`} />)}
              </div>
            </div>
          ) : !article ? (
            <div className="text-center py-20">
              <Shield className={`h-12 w-12 mx-auto mb-4 ${emptyIcon}`} />
              <p className={`${emptyText} mb-4`}>{t("news_not_found")}</p>
              <Link href="/news" className="inline-block text-sm text-[#13D6D1] hover:underline">
                {t("back_to_news")}
              </Link>
            </div>
          ) : (
            <article>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {article.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[#13D6D1] bg-[#13D6D1]/10 px-2 py-1 rounded">
                    <Tag className="h-3 w-3" />{article.category}
                  </span>
                )}
                <time className={`text-xs ${dateColor} flex items-center gap-1`}>
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishedAt ?? article.createdAt).toLocaleDateString(dateLocale, {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </time>
              </div>

              <h1 className={`text-3xl md:text-4xl font-bold ${titleColor} mb-6 leading-tight`}>{article.title}</h1>

              {article.coverImageUrl && (
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className={`w-full h-64 md:h-80 object-cover rounded-2xl mb-8 border ${imgBorder}`}
                />
              )}

              {article.content ? (
                <div className={proseClass} dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p className={noContent}>{t("news_no_content")}</p>
              )}

              <div className={`mt-12 pt-8 border-t ${isDark ? "border-white/8" : "border-slate-200"}`}>
                <Link href="/news" className={`inline-flex items-center gap-2 text-sm ${backColor} transition-colors`}>
                  <ArrowLeft className="h-4 w-4" /> {t("back_to_news")}
                </Link>
              </div>
            </article>
          )}
        </div>
      </div>
    </Layout>
  );
}
