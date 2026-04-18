import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import { useSettings, useBranches } from "@/lib/useCms";
import { api } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import BranchMapView from "@/components/BranchMapView";

export default function ContactsPage() {
  const { t, locale } = useI18n();
  const { data: settings } = useSettings(locale);
  const { data: branches, loading: branchesLoading } = useBranches(locale);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const phone = settings?.contact_phone || "+998 78 120 00 80";
  const shortPhone = settings?.contact_short_phone || "1182";
  const email = settings?.contact_email || "info@alfainvest.uz";
  const address = settings?.contact_address || "г. Ташкент, ул. Лабзак, 10";
  const workingHours = settings?.working_hours || "Пн–Пт 09:00–18:00";

  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.submitContact({
        name: form.name,
        phone: form.phone,
        message: form.message || undefined,
        type: "contact",
      });
      setSent(true);
    } catch (err) {
      console.error("Failed to submit contact form:", err);
    } finally {
      setSending(false);
    }
  };

  // Theme classes
  const pageBg = isDark ? "bg-[#1D283A]" : "bg-[#F8FAFC]";
  const heroBg = isDark ? "bg-gradient-to-br from-[#1D283A] via-[#1D3A4A] to-[#1D283A]" : "bg-gradient-to-br from-[#E8F4F4] via-[#F0FAFA] to-[#E8F4F4]";
  const heroTitle = isDark ? "text-white" : "text-slate-900";
  const heroSub = isDark ? "text-white/60" : "text-slate-600";
  const sectionTitle = isDark ? "text-white" : "text-slate-900";
  const cardBg = isDark ? "bg-white/[0.02] border-white/8 hover:border-[#13D6D1]/30 hover:bg-[#13D6D1]/5" : "bg-white border-slate-200 shadow-sm hover:border-[#13D6D1]/40 hover:shadow-md";
  const labelColor = isDark ? "text-white/40" : "text-slate-500";
  const valueColor = isDark ? "text-white font-semibold" : "text-slate-900 font-semibold";
  const inputBg = isDark ? "bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-[#13D6D1]/50 focus:bg-white/8" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#13D6D1]/50 focus:bg-white";
  const inputLabel = isDark ? "text-white/60" : "text-slate-600";
  const branchSectionBg = isDark ? "bg-[#162031] border-t border-white/5" : "bg-slate-100 border-t border-slate-200";
  const branchSectionLabel = isDark ? "text-[#13D6D1]" : "text-[#0a9e9b]";
  const branchCardBg = isDark ? "bg-white/[0.02] border-white/8 hover:border-[#13D6D1]/20" : "bg-white border-slate-200 shadow-sm hover:border-[#13D6D1]/30";
  const branchTitle = isDark ? "text-white" : "text-slate-900";
  const branchText = isDark ? "text-white/50" : "text-slate-600";
  const skeletonBg = isDark ? "bg-white/5" : "bg-slate-200";
  const skeletonCard = isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50";

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section className={`relative overflow-hidden ${heroBg} py-24 md:py-32 px-4 sm:px-6 lg:px-8`}>
        {isDark && <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(19,214,209,0.12),transparent)]" />}
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13D6D1]/10 border border-[#13D6D1]/20 text-[#13D6D1] text-xs font-medium mb-6">
            <MessageSquare className="h-3.5 w-3.5" />
            {t("contacts_hero_badge")}
          </div>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${heroTitle} leading-tight mb-6`}>
            {t("contacts_hero_title")} <span className="text-[#13D6D1]">{t("contacts_hero_title_accent")}</span>
          </h1>
          <p className={`text-lg ${heroSub} leading-relaxed max-w-2xl mx-auto`}>
            {t("contacts_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* ─── CONTACT INFO + FORM ─── */}
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${pageBg}`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className={`text-2xl font-bold ${sectionTitle} mb-8`}>{t("contacts_info_title")}</h2>
            <div className="space-y-4">
              <a href={`tel:${phone.replace(/\s/g, "")}`}
                className={`flex items-start gap-4 p-5 rounded-2xl border ${cardBg} transition-all group`}>
                <div className="w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center shrink-0 group-hover:bg-[#13D6D1]/20 transition-all">
                  <Phone className="h-5 w-5 text-[#13D6D1]" />
                </div>
                <div>
                  <p className={`text-xs ${labelColor} mb-0.5`}>{t("contacts_phone")}</p>
                  <p className={valueColor}>{phone}</p>
                  <p className="text-sm text-[#13D6D1]">{t("contacts_short_number")}: {shortPhone}</p>
                </div>
              </a>

              <a href={`mailto:${email}`}
                className={`flex items-start gap-4 p-5 rounded-2xl border ${cardBg} transition-all group`}>
                <div className="w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center shrink-0 group-hover:bg-[#13D6D1]/20 transition-all">
                  <Mail className="h-5 w-5 text-[#13D6D1]" />
                </div>
                <div>
                  <p className={`text-xs ${labelColor} mb-0.5`}>Email</p>
                  <p className={valueColor}>{email}</p>
                </div>
              </a>

              <div className={`flex items-start gap-4 p-5 rounded-2xl border ${isDark ? "border-white/8 bg-white/[0.02]" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-[#13D6D1]" />
                </div>
                <div>
                  <p className={`text-xs ${labelColor} mb-0.5`}>{t("contacts_address")}</p>
                  <p className={valueColor}>{address}</p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-5 rounded-2xl border ${isDark ? "border-white/8 bg-white/[0.02]" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="w-10 h-10 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-[#13D6D1]" />
                </div>
                <div>
                  <p className={`text-xs ${labelColor} mb-0.5`}>{t("contacts_working_hours")}</p>
                  <p className={valueColor}>{workingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className={`text-2xl font-bold ${sectionTitle} mb-8`}>{t("contacts_form_title")}</h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-[#13D6D1]" />
                </div>
                <h3 className={`text-xl font-bold ${sectionTitle} mb-2`}>{t("contacts_form_sent_title")}</h3>
                <p className={isDark ? "text-white/50" : "text-slate-600"}>{t("contacts_form_sent_subtitle")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm ${inputLabel} mb-1.5`}>{t("contacts_form_name")} *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={t("contacts_form_name_placeholder")}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm ${inputLabel} mb-1.5`}>{t("contacts_form_phone")} *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+998 90 000 00 00"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm ${inputLabel} mb-1.5`}>{t("contacts_form_message")} *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder={t("contacts_form_message_placeholder")}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none ${inputBg}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] font-semibold hover:bg-[#0fc4bf] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? t("contacts_form_sending") : t("contacts_form_submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── BRANCHES ─── */}
      {(branchesLoading || (branches && branches.length > 0)) && (
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${branchSectionBg}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className={`${branchSectionLabel} text-sm font-semibold uppercase tracking-widest mb-2`}>{t("contacts_branches_label")}</p>
              <h2 className={`text-3xl font-bold ${sectionTitle}`}>{t("contacts_branches_title")}</h2>
            </div>

            {branchesLoading ? (
              /* Skeleton */
              <div className={`rounded-2xl border ${isDark ? "border-white/8 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"} overflow-hidden`}>
                <div className="flex flex-col lg:flex-row" style={{ minHeight: 480 }}>
                  <div className="lg:w-2/5 border-b lg:border-b-0 lg:border-r border-inherit p-4 space-y-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-12 rounded-xl animate-pulse ${skeletonBg}`} />
                    ))}
                  </div>
                  <div className={`lg:w-3/5 animate-pulse ${skeletonBg}`} style={{ minHeight: 360 }} />
                </div>
              </div>
            ) : branches && branches.length > 0 ? (
              /* Accordion + Map */
              <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/8 bg-[#162031]" : "border-slate-200 bg-white shadow-sm"}`}>
                <div className="flex flex-col lg:flex-row" style={{ minHeight: 520 }}>

                  {/* Left: accordion list */}
                  <div className={`lg:w-2/5 overflow-y-auto border-b lg:border-b-0 lg:border-r ${isDark ? "border-white/8" : "border-slate-100"}`} style={{ maxHeight: 520 }}>
                    {branches.map((branch, idx) => {
                      const isOpen = selectedBranch === idx;
                      return (
                        <div key={branch.id} className={`border-b last:border-b-0 ${isDark ? "border-white/5" : "border-slate-100"}`}>
                          {/* Accordion header */}
                          <button
                            onClick={() => setSelectedBranch(idx)}
                            className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
                              isOpen
                                ? isDark ? "bg-[#13D6D1]/8" : "bg-[#13D6D1]/6"
                                : isDark ? "hover:bg-white/3" : "hover:bg-slate-50"
                            }`}
                          >
                            <span className={`text-sm font-medium leading-snug ${isOpen ? "text-[#13D6D1]" : isDark ? "text-white/80" : "text-slate-700"}`}>
                              {branch.name}
                            </span>
                            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#13D6D1]" : isDark ? "text-white/30" : "text-slate-500"}`} />
                          </button>

                          {/* Accordion body */}
                          {isOpen && (
                            <div className={`px-5 pb-5 pt-1 space-y-3 ${isDark ? "bg-[#13D6D1]/5" : "bg-[#f0fafa]"}`}>
                              <div>
                                <p className={`text-xs mb-0.5 ${isDark ? "text-white/35" : "text-slate-500"}`}>{t("contacts_branches_name_label") || "Наименование филиала"}</p>
                                <p className={`text-sm font-semibold leading-snug ${isDark ? "text-white" : "text-slate-800"}`}>{branch.name}</p>
                              </div>
                              {branch.address && (
                                <div className={`flex items-start gap-2 text-sm ${isDark ? "text-white/55" : "text-slate-600"}`}>
                                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#13D6D1]" />
                                  <span>{branch.address}</span>
                                </div>
                              )}
                              {branch.workingHours && (
                                <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/55" : "text-slate-600"}`}>
                                  <Clock className="h-4 w-4 shrink-0 text-[#13D6D1]" />
                                  <span>{branch.workingHours}</span>
                                </div>
                              )}
                              {branch.phone && (
                                <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className={`flex items-center gap-2 text-sm hover:text-[#13D6D1] transition-colors ${isDark ? "text-white/55" : "text-slate-600"}`}>
                                  <Phone className="h-4 w-4 shrink-0 text-[#13D6D1]" />
                                  <span>{branch.phone}</span>
                                </a>
                              )}
                              {branches[selectedBranch]?.lat && branches[selectedBranch]?.lng && (
                                <a
                                  href={`https://yandex.uz/maps/?pt=${branches[selectedBranch].lng},${branches[selectedBranch].lat}&z=16&l=map`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-[#13D6D1] hover:underline mt-1"
                                >
                                  <MapPin className="h-3.5 w-3.5" />
                                  {t("contacts_branches_directions") || "Как добраться"}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Yandex Map */}
                  <div className="lg:w-3/5 relative" style={{ minHeight: 360 }}>
                    {branches[selectedBranch] && (
                      <BranchMapView
                        key={branches[selectedBranch].id}
                        lat={branches[selectedBranch].lat ?? null}
                        lng={branches[selectedBranch].lng ?? null}
                        name={branches[selectedBranch].name}
                      />
                    )}
                    {/* Directions button overlay */}
                    {branches[selectedBranch]?.lat && branches[selectedBranch]?.lng && (
                      <a
                        href={`https://yandex.uz/maps/?pt=${branches[selectedBranch].lng},${branches[selectedBranch].lat}&z=16&l=map`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-medium shadow-md hover:shadow-lg transition-shadow border border-slate-200"
                      >
                        <MapPin className="h-3.5 w-3.5 text-[#13D6D1]" />
                        {t("contacts_branches_directions") || "Как добраться"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </Layout>
  );
}
