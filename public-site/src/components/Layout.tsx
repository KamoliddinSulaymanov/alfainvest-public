import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Phone, MapPin, Menu, X, Mail, Clock, Sun, Moon, Globe } from "lucide-react";
import { useSettings } from "@/lib/useCms";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";
import { LOCALES, type Locale } from "@/i18n/translations";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { data: settings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  const companyName = settings?.company_name || "ALFA INVEST";
  const phone = settings?.contact_phone || "+998 78 120 00 80";
  const shortPhone = settings?.contact_short_phone || "1182";
  const address = settings?.contact_address || "г. Ташкент, ул. Лабзак, 10";
  const email = settings?.contact_email || "info@alfainvest.uz";
  const workingHours = settings?.working_hours || "Пн–Пт 09:00–18:00";
  const footerText = settings?.footer_text || "";
  const socialTelegram = settings?.social_telegram;
  const socialInstagram = settings?.social_instagram;
  const socialFacebook = settings?.social_facebook;

  const NAV_LINKS = [
    { href: "/", label: t("nav_home") },
    { href: "/about", label: t("nav_about") },
    { href: "/services", label: t("nav_services") },
    { href: "/news", label: t("nav_news") },
    { href: "/contacts", label: t("nav_contacts") },
  ];

  const currentLocale = LOCALES.find(l => l.code === locale);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  // Theme-aware CSS classes
  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#1D283A]" : "bg-white";
  const headerBg = isDark ? "bg-[#1D283A]/95" : "bg-white/95";
  const topBarBg = isDark ? "bg-[#162031]" : "bg-[#F1F5F9]";
  const borderColor = isDark ? "border-white/8" : "border-slate-200";
  const textMuted = isDark ? "text-white/40" : "text-slate-600";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/60" : "text-slate-700";
  const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-slate-100";
  const footerBg = isDark ? "bg-[#111C2D]" : "bg-slate-900";
  const activeLinkBg = isDark ? "bg-[#13D6D1]/10" : "bg-[#13D6D1]/10";
  const cardBg = isDark ? "bg-[#162031]" : "bg-white";
  const mobileNavBg = isDark ? "bg-[#162031]" : "bg-white";
  const btnBg = isDark ? "bg-white/5 hover:bg-white/10 text-white/60" : "bg-slate-100 hover:bg-slate-200 text-slate-600";
  const langDropBg = isDark ? "bg-[#1E2E47] border-white/10" : "bg-white border-slate-200";
  const langItemHover = isDark ? "hover:bg-white/5" : "hover:bg-slate-50";

  return (
    <div className={`min-h-screen flex flex-col ${bg} transition-colors duration-300`}>
      {/* Top info bar */}
      <div className={`hidden lg:block ${topBarBg} border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-6 ${textMuted}`}>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />{address}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />{workingHours}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`mailto:${email}`} className={`flex items-center gap-1.5 hover:text-[#13D6D1] transition-colors ${textMuted}`}>
              <Mail className="h-3 w-3" />{email}
            </a>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className={`flex items-center gap-1.5 hover:text-[#13D6D1] transition-colors ${textMuted}`}>
              <Phone className="h-3 w-3" />{phone}
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 ${headerBg} backdrop-blur-md border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#13D6D1]/15 border border-[#13D6D1]/30 flex items-center justify-center group-hover:bg-[#13D6D1]/25 transition-all">
                <Shield className="h-4 w-4 text-[#13D6D1]" />
              </div>
              <div>
                <span className={`${textPrimary} font-bold text-sm tracking-wide`}>{companyName}</span>
                <span className={`block text-[10px] ${textMuted} leading-none`}>Sug'urta kompaniyasi</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(href)
                      ? `${activeLinkBg} text-[#13D6D1]`
                      : `${textSecondary} ${hoverBg} hover:text-[#13D6D1]`
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${borderColor} ${btnBg} text-xs font-medium transition-all cursor-pointer`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{currentLocale?.flag} {currentLocale?.label}</span>
                  <svg className="h-3 w-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {langOpen && (
                  <div
                    className={`absolute top-full right-0 mt-1.5 ${langDropBg} border rounded-xl shadow-xl overflow-hidden min-w-[130px] z-50`}
                    onMouseLeave={() => setLangOpen(false)}
                  >
                    {LOCALES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLocale(l.code as Locale); setLangOpen(false); }}
                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-all cursor-pointer ${langItemHover} ${
                          locale === l.code
                            ? "text-[#13D6D1] font-semibold bg-[#13D6D1]/10"
                            : textSecondary
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Светлая тема" : "Тёмная тема"}
                className={`w-9 h-9 rounded-lg border ${borderColor} ${btnBg} flex items-center justify-center transition-all cursor-pointer`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Phone CTA */}
              <a
                href={`tel:${shortPhone}`}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 text-[#13D6D1] text-sm font-semibold hover:bg-[#13D6D1]/20 transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                {shortPhone}
              </a>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-2 rounded-lg ${textSecondary} ${hoverBg} transition-all`}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className={`md:hidden border-t ${borderColor} ${mobileNavBg} px-4 py-3 flex flex-col gap-1`}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(href)
                    ? `${activeLinkBg} text-[#13D6D1]`
                    : `${textSecondary} ${hoverBg}`
                }`}
              >
                {label}
              </Link>
            ))}
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] text-sm font-bold"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer — always dark */}
      <footer className={`${footerBg} border-t border-white/8 mt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#13D6D1]/15 border border-[#13D6D1]/30 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-[#13D6D1]" />
                </div>
                <span className="text-white font-bold">{companyName}</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                {footerText || t("footer_tagline")}
              </p>
              {(socialTelegram || socialInstagram || socialFacebook) && (
                <div className="flex items-center gap-3 mt-4">
                  {socialTelegram && (
                    <a href={socialTelegram} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#13D6D1]/15 flex items-center justify-center transition-all text-white/40 hover:text-[#13D6D1]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.67l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.889z"/>
                      </svg>
                    </a>
                  )}
                  {socialInstagram && (
                    <a href={socialInstagram} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#13D6D1]/15 flex items-center justify-center transition-all text-white/40 hover:text-[#13D6D1]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                  )}
                  {socialFacebook && (
                    <a href={socialFacebook} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#13D6D1]/15 flex items-center justify-center transition-all text-white/40 hover:text-[#13D6D1]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">{t("footer_nav_title")}</h4>
              <ul className="space-y-2">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/40 hover:text-[#13D6D1] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">{t("footer_contacts_title")}</h4>
              <ul className="space-y-3">
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-start gap-2 text-sm text-white/40 hover:text-[#13D6D1] transition-colors">
                    <Phone className="h-4 w-4 mt-0.5 shrink-0" />{phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${email}`} className="flex items-start gap-2 text-sm text-white/40 hover:text-[#13D6D1] transition-colors">
                    <Mail className="h-4 w-4 mt-0.5 shrink-0" />{email}
                  </a>
                </li>
                <li className="flex items-start gap-2 text-sm text-white/40">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />{address}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} {companyName}. {t("footer_rights")}.</p>
            <p className="text-xs text-white/25">{t("footer_license")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
