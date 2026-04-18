import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, Building2, Award, Clock, Target, Heart } from "lucide-react";
import LangTabs, { type Lang } from "@/components/LangTabs";
import { UnsavedChangesBadge } from "@/components/UnsavedChangesBadge";

type I18n = { ru: string; uz: string; en: string };
const emptyI18n = (): I18n => ({ ru: "", uz: "", en: "" });

interface AboutData {
  hero: { badge: I18n; title: I18n; titleAccent: I18n; subtitle: I18n };
  stats: Array<{ value: string; label: I18n; sub: I18n }>;
  timeline: Array<{ year: string; text: I18n }>;
  mission: { label: I18n; title: I18n; text: I18n };
  values: Array<{ title: I18n; desc: I18n }>;
}

const defaults: AboutData = {
  hero: {
    badge: { ru: "О компании", uz: "Kompaniya haqida", en: "About the company" },
    title: { ru: "Надёжная защита с", uz: "Ishonchli himoya —", en: "Reliable protection with" },
    titleAccent: { ru: "2003 года", uz: "2003 yildan beri", en: "since 2003" },
    subtitle: {
      ru: "ALFA INVEST — одна из ведущих страховых компаний Узбекистана. Мы помогаем людям и бизнесу защищать то, что им важно.",
      uz: "ALFA INVEST — O'zbekistonning yetakchi sug'urta kompaniyalaridan biri. Biz odamlar va biznesga ular uchun muhim narsalarni himoya qilishda yordam beramiz.",
      en: "ALFA INVEST is one of Uzbekistan's leading insurance companies. We help people and businesses protect what matters to them.",
    },
  },
  stats: [
    { value: "2003", label: { ru: "Год основания", uz: "Ta'sis yili", en: "Founded" }, sub: { ru: "20+ лет на рынке", uz: "Bozorda 20+ yil", en: "20+ years in market" } },
    { value: "83,1 млрд", label: { ru: "Уставной капитал", uz: "Ustav kapitali", en: "Charter capital" }, sub: { ru: "сум", uz: "so'm", en: "UZS" } },
    { value: "B2", label: { ru: "Рейтинг Moody's", uz: "Moody's reytingi", en: "Moody's rating" }, sub: { ru: "международный", uz: "xalqaro", en: "international" } },
    { value: "UzA++", label: { ru: "Нац. рейтинг", uz: "Milliy reyting", en: "National rating" }, sub: { ru: "наивысший", uz: "eng yuqori", en: "highest" } },
  ],
  timeline: [
    { year: "2003", text: { ru: "Основание компании", uz: "Kompaniya ta'sis etildi", en: "Company founded" } },
    { year: "2008", text: { ru: "Расширение продуктовой линейки", uz: "Mahsulot liniyasini kengaytirish", en: "Product line expansion" } },
    { year: "2015", text: { ru: "Национальный рейтинг UzA++", uz: "Milliy UzA++ reytingi", en: "National UzA++ rating" } },
    { year: "2019", text: { ru: "Международный рейтинг B2", uz: "Xalqaro B2 reytingi", en: "International B2 rating" } },
    { year: "2023", text: { ru: "Запуск онлайн-страхования", uz: "Onlayn sug'urta ishga tushirildi", en: "Online insurance launched" } },
  ],
  mission: {
    label: { ru: "Наша миссия", uz: "Bizning missiyamiz", en: "Our mission" },
    title: { ru: "Защищать то, что дорого", uz: "Qadrli narsalarni himoya qilish", en: "Protect what matters" },
    text: { ru: "Мы создаём страховые решения, которые помогают людям и бизнесу чувствовать уверенность в завтрашнем дне.", uz: "Biz odamlar va biznesga ertangi kunga ishonch hosil qilishga yordam beradigan sug'urta yechimlarini yaratamiz.", en: "We build insurance solutions that help people and businesses feel confident about tomorrow." },
  },
  values: [
    { title: { ru: "Надёжность", uz: "Ishonchlilik", en: "Reliability" }, desc: { ru: "20+ лет стабильной работы и выполнения обязательств", uz: "20+ yil barqaror ish va majburiyatlarni bajarish", en: "20+ years of stable operation and fulfilling obligations" } },
    { title: { ru: "Прозрачность", uz: "Shaffoflik", en: "Transparency" }, desc: { ru: "Честные условия и понятные тарифы без скрытых пунктов", uz: "Halol shartlar va yashirin punktlarsiz tushunarli tariflar", en: "Honest terms and clear pricing without hidden clauses" } },
    { title: { ru: "Скорость", uz: "Tezlik", en: "Speed" }, desc: { ru: "Быстрое оформление и выплаты в кратчайшие сроки", uz: "Tez rasmiylashtirish va qisqa muddatda to'lovlar", en: "Fast onboarding and quick payouts" } },
    { title: { ru: "Инновации", uz: "Innovatsiyalar", en: "Innovation" }, desc: { ru: "Современные цифровые сервисы и онлайн-страхование", uz: "Zamonaviy raqamli xizmatlar va onlayn sug'urta", en: "Modern digital services and online insurance" } },
  ],
};

function parseOrDefault(raw: string | undefined): AboutData {
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch { return defaults; }
}

export default function AboutPageManager() {
  const utils = trpc.useUtils();
  const { data: page, isLoading } = trpc.pages.getBySlug.useQuery(
    { slug: "about" },
    { retry: false }
  );
  const upsertMutation = trpc.pages.upsert.useMutation({
    onSuccess: () => { utils.pages.list.invalidate(); toast.success("About page saved"); },
  });

  const [data, setData] = useState<AboutData>(defaults);
  const [snapshot, setSnapshot] = useState<string>("");
  const [lang, setLang] = useState<Lang>("ru");

  useEffect(() => {
    if (!page) return;
    const parsed = parseOrDefault(page.content);
    setData(parsed);
    setSnapshot(JSON.stringify(parsed));
  }, [page]);

  const dirty = JSON.stringify(data) !== snapshot;

  const handleSave = () => {
    upsertMutation.mutate(
      {
        slug: "about",
        title: "About",
        titleUz: "Biz haqida",
        titleEn: "About",
        content: JSON.stringify(data),
        contentUz: JSON.stringify(data),
        contentEn: JSON.stringify(data),
        metaTitle: "About",
        metaTitleUz: "Biz haqida",
        metaTitleEn: "About",
        metaDescription: "Learn about ALFA INVEST",
        status: "published",
      },
      { onSuccess: () => setSnapshot(JSON.stringify(data)) }
    );
  };

  const updateI18n = (path: (d: AboutData) => I18n, key: Lang, value: string) => {
    setData(prev => {
      const next = structuredClone(prev);
      path(next)[key] = value;
      return next;
    });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 rounded-xl" /></div>;

  const I18nField = ({ label, get }: { label: string; get: (d: AboutData) => I18n }) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-foreground">{label}</Label>
      <Input value={get(data)[lang]} onChange={e => updateI18n(get, lang, e.target.value)} className="bg-input border-border text-foreground" />
    </div>
  );

  const I18nTextarea = ({ label, get }: { label: string; get: (d: AboutData) => I18n }) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-foreground">{label}</Label>
      <Textarea value={get(data)[lang]} onChange={e => updateI18n(get, lang, e.target.value)} className="bg-input border-border text-foreground min-h-[80px]" />
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">About Page</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage hero, stats, timeline, mission and values on /about</p>
        </div>
        <LangTabs lang={lang} setLang={setLang} filled={{ ru: true, uz: true, en: true }} />
      </div>

      {/* HERO */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Hero section</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <I18nField label="Badge" get={d => d.hero.badge} />
          <div className="grid grid-cols-2 gap-4">
            <I18nField label="Title" get={d => d.hero.title} />
            <I18nField label="Title accent (colored part)" get={d => d.hero.titleAccent} />
          </div>
          <I18nTextarea label="Subtitle" get={d => d.hero.subtitle} />
        </CardContent>
      </Card>

      {/* STATS */}
      <Card className="bg-card border-border">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-foreground text-base flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Stats ({data.stats.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setData(p => ({ ...p, stats: [...p.stats, { value: "", label: emptyI18n(), sub: emptyI18n() }] }))}>
            <Plus className="h-3 w-3 mr-1" /> Add stat
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.stats.map((stat, i) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">#{i + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setData(p => ({ ...p, stats: p.stats.filter((_, j) => j !== i) }))}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input value={stat.value} onChange={e => setData(p => { const n = structuredClone(p); n.stats[i]!.value = e.target.value; return n; })} className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Label ({lang})</Label>
                  <Input value={stat.label[lang]} onChange={e => setData(p => { const n = structuredClone(p); n.stats[i]!.label[lang] = e.target.value; return n; })} className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Sub ({lang})</Label>
                  <Input value={stat.sub[lang]} onChange={e => setData(p => { const n = structuredClone(p); n.stats[i]!.sub[lang] = e.target.value; return n; })} className="bg-input border-border text-foreground" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* TIMELINE */}
      <Card className="bg-card border-border">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-foreground text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Timeline ({data.timeline.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setData(p => ({ ...p, timeline: [...p.timeline, { year: "", text: emptyI18n() }] }))}>
            <Plus className="h-3 w-3 mr-1" /> Add entry
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.timeline.map((t, i) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">#{i + 1}</span>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === 0} onClick={() => setData(p => { const n = structuredClone(p); [n.timeline[i - 1], n.timeline[i]] = [n.timeline[i]!, n.timeline[i - 1]!]; return n; })}><ChevronUp className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === data.timeline.length - 1} onClick={() => setData(p => { const n = structuredClone(p); [n.timeline[i + 1], n.timeline[i]] = [n.timeline[i]!, n.timeline[i + 1]!]; return n; })}><ChevronDown className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setData(p => ({ ...p, timeline: p.timeline.filter((_, j) => j !== i) }))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <Input value={t.year} onChange={e => setData(p => { const n = structuredClone(p); n.timeline[i]!.year = e.target.value; return n; })} className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Event ({lang})</Label>
                  <Input value={t.text[lang]} onChange={e => setData(p => { const n = structuredClone(p); n.timeline[i]!.text[lang] = e.target.value; return n; })} className="bg-input border-border text-foreground" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MISSION */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-foreground text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Mission</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <I18nField label="Label" get={d => d.mission.label} />
            <I18nField label="Title" get={d => d.mission.title} />
          </div>
          <I18nTextarea label="Text" get={d => d.mission.text} />
        </CardContent>
      </Card>

      {/* VALUES */}
      <Card className="bg-card border-border">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-foreground text-base flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Values ({data.values.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setData(p => ({ ...p, values: [...p.values, { title: emptyI18n(), desc: emptyI18n() }] }))}>
            <Plus className="h-3 w-3 mr-1" /> Add value
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.values.map((v, i) => (
            <div key={i} className="p-3 border border-border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">#{i + 1}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setData(p => ({ ...p, values: p.values.filter((_, j) => j !== i) }))}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Title ({lang})</Label>
                  <Input value={v.title[lang]} onChange={e => setData(p => { const n = structuredClone(p); n.values[i]!.title[lang] = e.target.value; return n; })} className="bg-input border-border text-foreground" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description ({lang})</Label>
                  <Textarea value={v.desc[lang]} onChange={e => setData(p => { const n = structuredClone(p); n.values[i]!.desc[lang] = e.target.value; return n; })} className="bg-input border-border text-foreground min-h-[60px]" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <UnsavedChangesBadge visible={dirty} onSave={handleSave} isSaving={upsertMutation.isPending} />
    </div>
  );
}
