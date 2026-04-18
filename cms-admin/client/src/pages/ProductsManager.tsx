import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus, MoreHorizontal, Pencil, Trash2, ShieldCheck,
  ArrowUp, ArrowDown, Star, X, ExternalLink, ArrowLeft,
  ChevronDown, ChevronRight, LayoutGrid, List, HelpCircle, Clock,
  FileCode2, UploadCloud, Eye, EyeOff, Trash,
} from "lucide-react";
import { useRef } from "react";
import LangTabs, { type Lang } from "@/components/LangTabs";
import { UnsavedChangesBadge } from "@/components/UnsavedChangesBadge";

const PUBLIC_SITE = import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3001";

// ─── Icon options ─────────────────────────────────────────────────────────────
const ICONS = [
  "Shield","Home","Building2","Package","Users","HeartPulse","Plane","Car","Briefcase",
  "Flame","Droplets","Lock","CloudLightning","Activity","Stethoscope","CalendarX",
  "Luggage","Globe","ClipboardList","CreditCard","FileCheck","Clock","CheckCircle2",
  "AlertTriangle","Zap","Wind","Snowflake","Thermometer","Wrench",
];

// ─── Tariff plan type ─────────────────────────────────────────────────────────
interface TariffPlan {
  price: string; period: string; recommended: boolean;
  name: string; features: string[];
  nameUz: string; featuresUz: string[];
  nameEn: string; featuresEn: string[];
}
const emptyPlan = (): TariffPlan => ({
  price: "", period: "год", recommended: false,
  name: "", features: [""], nameUz: "", featuresUz: [""], nameEn: "", featuresEn: [""],
});
function parseTariffs(raw: string): TariffPlan[] {
  if (!raw?.trim()) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.map((p: any) => ({
      price: p.price ?? "", period: p.period ?? "год", recommended: p.recommended ?? false,
      name: p.name ?? "", features: Array.isArray(p.features) ? p.features : [""],
      nameUz: p.nameUz ?? "", featuresUz: Array.isArray(p.featuresUz) ? p.featuresUz : [""],
      nameEn: p.nameEn ?? "", featuresEn: Array.isArray(p.featuresEn) ? p.featuresEn : [""],
    }));
  } catch { /**/ }
  return [];
}

// ─── Section item & FAQ types ─────────────────────────────────────────────────
interface SectionItem {
  icon: string;
  title: string; titleUz: string; titleEn: string;
  description: string; descriptionUz: string; descriptionEn: string;
}
interface FaqEntry {
  question: string; questionUz: string; questionEn: string;
  answer: string; answerUz: string; answerEn: string;
}
const emptySectionItem = (): SectionItem => ({
  icon: "Shield",
  title: "", titleUz: "", titleEn: "",
  description: "", descriptionUz: "", descriptionEn: "",
});
const emptyFaqEntry = (): FaqEntry => ({
  question: "", questionUz: "", questionEn: "",
  answer: "", answerUz: "", answerEn: "",
});

// ─── Page block types (Tilda-like builder) ────────────────────────────────────
interface CardsBlock {
  id: string; type: "cards";
  titleRu: string; titleUz: string; titleEn: string;
  columns: 2 | 3 | 4;
  items: SectionItem[];
}
interface StepsBlock {
  id: string; type: "steps";
  titleRu: string; titleUz: string; titleEn: string;
  items: SectionItem[];
}
interface FaqBlock {
  id: string; type: "faq";
  titleRu: string; titleUz: string; titleEn: string;
  items: FaqEntry[];
}
interface DurationBlock {
  id: string; type: "duration";
  textRu: string; textUz: string; textEn: string;
}
type PageBlock = CardsBlock | StepsBlock | FaqBlock | DurationBlock;

function makeId(): string { return Math.random().toString(36).slice(2, 10); }

function emptyBlock(type: PageBlock["type"]): PageBlock {
  const id = makeId();
  if (type === "cards")    return { id, type, titleRu: "", titleUz: "", titleEn: "", columns: 3, items: [] };
  if (type === "steps")    return { id, type, titleRu: "", titleUz: "", titleEn: "", items: [] };
  if (type === "faq")      return { id, type, titleRu: "", titleUz: "", titleEn: "", items: [] };
  return { id, type: "duration", textRu: "", textUz: "", textEn: "" };
}

function parsePageBlocks(raw: string | null | undefined): PageBlock[] {
  if (!raw?.trim()) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((b: any): PageBlock => {
      const id = b.id ?? makeId();
      if (b.type === "cards") return {
        id, type: "cards",
        titleRu: b.titleRu ?? "", titleUz: b.titleUz ?? "", titleEn: b.titleEn ?? "",
        columns: [2, 3, 4].includes(b.columns) ? b.columns : 3,
        items: Array.isArray(b.items) ? b.items : [],
      };
      if (b.type === "steps") return {
        id, type: "steps",
        titleRu: b.titleRu ?? "", titleUz: b.titleUz ?? "", titleEn: b.titleEn ?? "",
        items: Array.isArray(b.items) ? b.items : [],
      };
      if (b.type === "faq") return {
        id, type: "faq",
        titleRu: b.titleRu ?? "", titleUz: b.titleUz ?? "", titleEn: b.titleEn ?? "",
        items: Array.isArray(b.items) ? b.items : [],
      };
      if (b.type === "duration") return {
        id, type: "duration",
        textRu: b.textRu ?? "", textUz: b.textUz ?? "", textEn: b.textEn ?? "",
      };
      // Fallback: treat as cards
      return { id, type: "cards", titleRu: "", titleUz: "", titleEn: "", columns: 3, items: [] };
    });
  } catch { /**/ }
  return [];
}

/** Auto-migrate legacy separate columns → pageBlocks array (runs when pageBlocks is empty) */
function migrateOldData(p: any): PageBlock[] {
  const blocks: PageBlock[] = [];

  // helper: parse a grid section (old flat-array or {titleRu,columns,items})
  function parseOldGrid(raw: string | null | undefined): { titleRu: string; titleUz: string; titleEn: string; columns: 2|3|4; items: SectionItem[] } | null {
    if (!raw?.trim()) return null;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return { titleRu: "", titleUz: "", titleEn: "", columns: 3, items: parsed };
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return {
          titleRu: parsed.titleRu ?? "", titleUz: parsed.titleUz ?? "", titleEn: parsed.titleEn ?? "",
          columns: [2,3,4].includes(parsed.columns) ? parsed.columns : 3,
          items: parsed.items,
        };
      }
    } catch { /**/ }
    return null;
  }

  // coverageItems → CardsBlock
  const cover = parseOldGrid(p.coverageItems);
  if (cover) blocks.push({ id: makeId(), type: "cards", ...cover });

  // risks → CardsBlock
  const risk = parseOldGrid(p.risks);
  if (risk) blocks.push({ id: makeId(), type: "cards", ...risk });

  // duration → DurationBlock
  if (p.duration?.trim() || p.durationUz?.trim() || p.durationEn?.trim()) {
    blocks.push({ id: makeId(), type: "duration", textRu: p.duration ?? "", textUz: p.durationUz ?? "", textEn: p.durationEn ?? "" });
  }

  // steps → StepsBlock
  if (p.steps?.trim()) {
    try {
      const items = JSON.parse(p.steps);
      if (Array.isArray(items) && items.length > 0)
        blocks.push({ id: makeId(), type: "steps", titleRu: "", titleUz: "", titleEn: "", items });
    } catch { /**/ }
  }

  // faq → FaqBlock
  if (p.faq?.trim()) {
    try {
      const items = JSON.parse(p.faq);
      if (Array.isArray(items) && items.length > 0)
        blocks.push({ id: makeId(), type: "faq", titleRu: "", titleUz: "", titleEn: "", items });
    } catch { /**/ }
  }

  // extraSections → multiple CardsBlock
  if (p.extraSections?.trim()) {
    try {
      const arr = JSON.parse(p.extraSections);
      if (Array.isArray(arr)) {
        arr.forEach((s: any) => {
          const items = Array.isArray(s.items) ? s.items : [];
          if (items.length > 0) {
            blocks.push({
              id: s.id ?? makeId(), type: "cards",
              titleRu: s.titleRu ?? s.adminLabel ?? "", titleUz: s.titleUz ?? "", titleEn: s.titleEn ?? "",
              columns: [2,3,4].includes(s.columns) ? s.columns : 3,
              items,
            });
          }
        });
      }
    } catch { /**/ }
  }

  return blocks;
}

// ─── Product form (basic fields only — content goes in pageBlocks) ────────────
type ProductForm = {
  title: string; titleUz: string; titleEn: string;
  description: string; descriptionUz: string; descriptionEn: string;
  category: string; ctaLink: string; sortOrder: number; status: "active" | "inactive";
};
const emptyForm = (): ProductForm => ({
  title: "", titleUz: "", titleEn: "",
  description: "", descriptionUz: "", descriptionEn: "",
  category: "", ctaLink: "", sortOrder: 0, status: "active",
});

const CATEGORIES = ["Имущество","Личное","Путешествия","Ответственность","Корпоративное"];

// ─── Collapsible section wrapper ──────────────────────────────────────────────
function Section({ title, badge, children, defaultOpen = false }: {
  title: string; badge?: string | number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge !== undefined && (
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary/70 bg-primary/5 ml-1">
              {badge}
            </Badge>
          )}
        </div>
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

// ─── Generic section item editor (cards, steps) ───────────────────────────────
function SectionItemEditor({
  items, onChange, lang,
  titleLabel, descLabel, addLabel, titlePH, descPH,
}: {
  items: SectionItem[]; onChange: (v: SectionItem[]) => void; lang: Lang;
  titleLabel: Record<Lang, string>; descLabel: Record<Lang, string>;
  addLabel: Record<Lang, string>; titlePH: Record<Lang, string>; descPH: Record<Lang, string>;
}) {
  const add = () => onChange([...items, emptySectionItem()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<SectionItem>) =>
    onChange(items.map((item, idx) => idx === i ? { ...item, ...patch } : item));

  const titleKey = lang === "uz" ? "titleUz" : lang === "en" ? "titleEn" : "title";
  const descKey  = lang === "uz" ? "descriptionUz" : lang === "en" ? "descriptionEn" : "description";

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-lg border border-border bg-muted/20 p-4 space-y-3">
          <button type="button" onClick={() => remove(i)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="grid grid-cols-[120px_1fr] gap-3 pr-6">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Иконка</Label>
              <Select value={item.icon} onValueChange={v => update(i, { icon: v })}>
                <SelectTrigger className="bg-input border-border text-foreground h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-60">
                  {ICONS.map(ic => <SelectItem key={ic} value={ic} className="text-xs">{ic}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{titleLabel[lang]}</Label>
              <Input
                value={(item as any)[titleKey] ?? ""}
                onChange={e => update(i, { [titleKey]: e.target.value } as any)}
                placeholder={titlePH[lang]}
                className="bg-input border-border text-foreground h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{descLabel[lang]}</Label>
            <Textarea
              value={(item as any)[descKey] ?? ""}
              onChange={e => update(i, { [descKey]: e.target.value } as any)}
              placeholder={descPH[lang]}
              rows={2}
              className="bg-input border-border text-foreground resize-none text-sm"
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5 w-full border-dashed">
        <Plus className="h-3.5 w-3.5" /> {addLabel[lang]}
      </Button>
    </div>
  );
}

// ─── FAQ editor ───────────────────────────────────────────────────────────────
function FaqEditor({ items, onChange, lang }: { items: FaqEntry[]; onChange: (v: FaqEntry[]) => void; lang: Lang }) {
  const add = () => onChange([...items, emptyFaqEntry()]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<FaqEntry>) =>
    onChange(items.map((item, idx) => idx === i ? { ...item, ...patch } : item));

  const qKey = lang === "uz" ? "questionUz" : lang === "en" ? "questionEn" : "question";
  const aKey = lang === "uz" ? "answerUz"   : lang === "en" ? "answerEn"   : "answer";
  const qPH: Record<Lang, string> = { ru: "Как получить выплату?", uz: "To'lovni qanday olish mumkin?", en: "How to get payment?" };
  const aPH: Record<Lang, string> = { ru: "Позвоните по номеру 1182...", uz: "1182 ga qo'ng'iroq qiling...", en: "Call 1182..." };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-lg border border-border bg-muted/20 p-4 space-y-3">
          <button type="button" onClick={() => remove(i)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="space-y-1 pr-6">
            <Label className="text-xs text-muted-foreground">
              {lang === "ru" ? "Вопрос" : lang === "uz" ? "Savol" : "Question"}
            </Label>
            <Input
              value={(item as any)[qKey] ?? ""}
              onChange={e => update(i, { [qKey]: e.target.value } as any)}
              placeholder={qPH[lang]}
              className="bg-input border-border text-foreground h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              {lang === "ru" ? "Ответ" : lang === "uz" ? "Javob" : "Answer"}
            </Label>
            <Textarea
              value={(item as any)[aKey] ?? ""}
              onChange={e => update(i, { [aKey]: e.target.value } as any)}
              placeholder={aPH[lang]}
              rows={2}
              className="bg-input border-border text-foreground resize-none text-sm"
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5 w-full border-dashed">
        <Plus className="h-3.5 w-3.5" />
        {lang === "ru" ? "Добавить вопрос" : lang === "uz" ? "Savol qo'shish" : "Add question"}
      </Button>
    </div>
  );
}

// ─── Tariff editor ────────────────────────────────────────────────────────────
function TariffEditor({ plans, onChange, lang }: { plans: TariffPlan[]; onChange: (p: TariffPlan[]) => void; lang: Lang }) {
  const addPlan = () => onChange([...plans, emptyPlan()]);
  const removePlan = (i: number) => onChange(plans.filter((_, idx) => idx !== i));
  const updatePlan = (i: number, patch: Partial<TariffPlan>) =>
    onChange(plans.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  const nameKey = lang === "uz" ? "nameUz" : lang === "en" ? "nameEn" : "name";
  const featKey = lang === "uz" ? "featuresUz" : lang === "en" ? "featuresEn" : "features";
  const getFeatures = (plan: TariffPlan): string[] => (plan[featKey as keyof TariffPlan] as string[]) ?? [""];
  const addFeature = (i: number) => updatePlan(i, { [featKey]: [...getFeatures(plans[i]!), ""] } as any);
  const updateFeature = (pi: number, fi: number, val: string) =>
    updatePlan(pi, { [featKey]: getFeatures(plans[pi]!).map((f, idx) => idx === fi ? val : f) } as any);
  const removeFeature = (pi: number, fi: number) =>
    updatePlan(pi, { [featKey]: getFeatures(plans[pi]!).filter((_, idx) => idx !== fi) } as any);

  const namePH: Record<Lang, string> = { ru: "Базовый", uz: "Asosiy", en: "Basic" };
  const featPH: Record<Lang, string> = { ru: "Пожар и взрыв", uz: "Yong'in va portlash", en: "Fire and explosion" };

  return (
    <div className="space-y-3">
      {plans.map((plan, i) => (
        <div key={i} className="relative rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          {plan.recommended && (
            <div className="absolute top-2 right-10">
              <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-[10px] gap-1">
                <Star className="h-2.5 w-2.5" /> Рекомендуем
              </Badge>
            </div>
          )}
          <button type="button" onClick={() => removePlan(i)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "ru" ? "Название плана" : lang === "uz" ? "Reja nomi" : "Plan name"}</Label>
              <Input value={(plan[nameKey as keyof TariffPlan] as string) ?? ""}
                onChange={e => updatePlan(i, { [nameKey]: e.target.value } as any)}
                placeholder={namePH[lang]} className="bg-input border-border text-foreground h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "ru" ? "Цена" : lang === "uz" ? "Narx" : "Price"}</Label>
              <Input value={plan.price} onChange={e => updatePlan(i, { price: e.target.value })}
                placeholder="100 000" className="bg-input border-border text-foreground h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "ru" ? "Период" : lang === "uz" ? "Davr" : "Period"}</Label>
              <Input value={plan.period} onChange={e => updatePlan(i, { period: e.target.value })}
                placeholder="год" className="bg-input border-border text-foreground h-8 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{lang === "ru" ? "Что включено" : lang === "uz" ? "Nima kiritilgan" : "What's included"}</Label>
            {getFeatures(plan).map((feat, fi) => (
              <div key={fi} className="flex items-center gap-2">
                <Input value={feat} onChange={e => updateFeature(i, fi, e.target.value)}
                  placeholder={featPH[lang]} className="bg-input border-border text-foreground h-7 text-xs flex-1" />
                <button type="button" onClick={() => removeFeature(i, fi)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addFeature(i)}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
              <Plus className="h-3 w-3" />
              {lang === "ru" ? "Добавить пункт" : lang === "uz" ? "Punkt qo'shish" : "Add item"}
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id={`rec-${i}`} checked={plan.recommended}
              onChange={e => {
                const updated = plans.map((p, idx) => ({ ...p, recommended: idx === i ? e.target.checked : false }));
                onChange(updated);
              }} className="accent-primary" />
            <label htmlFor={`rec-${i}`} className="text-xs text-muted-foreground cursor-pointer select-none">
              {lang === "ru" ? "Отметить как «Рекомендуем»" : lang === "uz" ? "«Tavsiya etamiz» deb belgilash" : "Mark as «Recommended»"}
            </label>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addPlan} className="gap-1.5 w-full border-dashed">
        <Plus className="h-3.5 w-3.5" />
        {lang === "ru" ? "Добавить тарифный план" : lang === "uz" ? "Tarif rejasi qo'shish" : "Add tariff plan"}
      </Button>
    </div>
  );
}

// ─── HTML widget drop zone ────────────────────────────────────────────────────
function HtmlDropZone({
  value, filename, onChange, onClear, lang,
}: {
  value: string;
  filename: string;
  onChange: (html: string, name: string) => void;
  onClear: () => void;
  lang: Lang;
}) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".html") && file.type !== "text/html") {
      toast.error("Только .html файлы");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const html = e.target?.result as string;
      onChange(html, file.name);
      toast.success(`Загружен: ${file.name}`);
    };
    reader.readAsText(file, "utf-8");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  };

  const bytes = new TextEncoder().encode(value).length;
  const sizeLabel = bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  // Uploaded state
  if (value) {
    return (
      <div className="space-y-3">
        {/* File info bar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
            <FileCode2 className="h-4.5 w-4.5 h-[18px] w-[18px] text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{filename || "widget.html"}</p>
            <p className="text-[11px] text-muted-foreground">{sizeLabel}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setPreview(p => !p)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              title={preview ? "Скрыть превью" : "Показать превью"}
            >
              {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              title="Заменить файл"
            >
              <UploadCloud className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Удалить"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Inline preview */}
        {preview && (
          <div className="rounded-xl border border-border overflow-hidden bg-white">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
              </div>
              <span className="text-[11px] text-muted-foreground font-mono flex-1">preview</span>
            </div>
            <iframe
              srcDoc={value}
              className="w-full border-none"
              style={{ height: 320 }}
              title="HTML preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".html,text/html"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }}
        />
      </div>
    );
  }

  // Empty / drop state
  return (
    <div
      onDragEnter={e => { e.preventDefault(); setDragging(true); }}
      onDragOver={e => e.preventDefault()}
      onDragLeave={e => { e.preventDefault(); setDragging(false); }}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-12 px-6 text-center select-none ${
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/10"
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
        dragging ? "bg-primary/15" : "bg-muted/40"
      }`}>
        <UploadCloud className={`h-7 w-7 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {dragging
            ? (lang === "ru" ? "Отпустите файл" : lang === "uz" ? "Faylni tashlang" : "Release file")
            : (lang === "ru" ? "Перетащите HTML-файл" : lang === "uz" ? "HTML faylni torting" : "Drop HTML file here")}
        </p>
        <p className="text-[12px] text-muted-foreground mt-1">
          {lang === "ru" ? "или нажмите для выбора" : lang === "uz" ? "yoki tanlash uchun bosing" : "or click to browse"}
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-2">
          {lang === "ru" ? "Поддерживаются только .html файлы" : lang === "uz" ? "Faqat .html fayllar" : "Only .html files"}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".html,text/html"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Block type metadata ──────────────────────────────────────────────────────
const BLOCK_META: Record<PageBlock["type"], { icon: React.ElementType; labelRu: string; labelUz: string; labelEn: string }> = {
  cards:    { icon: LayoutGrid, labelRu: "Карточки",    labelUz: "Kartochkalar", labelEn: "Cards" },
  steps:    { icon: List,       labelRu: "Шаги",        labelUz: "Qadamlar",     labelEn: "Steps" },
  faq:      { icon: HelpCircle, labelRu: "FAQ",         labelUz: "FAQ",          labelEn: "FAQ" },
  duration: { icon: Clock,      labelRu: "Срок действия", labelUz: "Muddat",     labelEn: "Duration" },
};

// ─── Page blocks editor (Tilda-like constructor) ──────────────────────────────
function PageBlocksEditor({
  blocks, onChange, lang,
}: {
  blocks: PageBlock[]; onChange: (v: PageBlock[]) => void; lang: Lang;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const addBlock = (type: PageBlock["type"]) => {
    const block = emptyBlock(type);
    onChange([...blocks, block]);
    setExpanded(s => { const n = new Set(s); n.add(block.id); return n; });
  };

  const removeBlock = (id: string) => onChange(blocks.filter(b => b.id !== id));

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    const arr = [...blocks];
    [arr[idx], arr[next]] = [arr[next]!, arr[idx]!];
    onChange(arr);
  };

  const updateBlock = <B extends PageBlock>(id: string, patch: Partial<B>) =>
    onChange(blocks.map(b => b.id === id ? { ...b, ...patch } as PageBlock : b));

  const COLS: Array<2 | 3 | 4> = [2, 3, 4];
  const gridPreview: Record<number, string> = { 2: "▐█ █▌", 3: "▐█ █ █▌", 4: "▐█ █ █ █▌" };

  const titleKey = (lang: Lang) => lang === "uz" ? "titleUz" : lang === "en" ? "titleEn" : "titleRu";
  const textKey  = (lang: Lang) => lang === "uz" ? "textUz"  : lang === "en" ? "textEn"  : "textRu";

  function blockLabel(meta: typeof BLOCK_META[keyof typeof BLOCK_META], lang: Lang): string {
    return lang === "uz" ? meta.labelUz : lang === "en" ? meta.labelEn : meta.labelRu;
  }

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          {lang === "ru"
            ? "Нет секций. Добавьте первую секцию ниже."
            : lang === "uz" ? "Bo'limlar yo'q. Quyida birinchi bo'lim qo'shing."
            : "No sections yet. Add your first section below."}
        </p>
      )}

      {blocks.map((block, idx) => {
        const meta = BLOCK_META[block.type];
        const MetaIcon = meta.icon;
        const isOpen = expanded.has(block.id);

        // Preview text for collapsed header
        let titlePreview = "";
        let itemCount: number | undefined;
        if (block.type === "duration") {
          titlePreview = block.textRu?.slice(0, 50) || "";
        } else {
          titlePreview = (block as CardsBlock | StepsBlock | FaqBlock).titleRu || "";
          itemCount = (block as CardsBlock | StepsBlock | FaqBlock).items.length;
        }

        return (
          <div key={block.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Block header row */}
            <div className="flex items-center gap-2 px-4 py-3 hover:bg-muted/10 transition-colors">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button type="button" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}
                  className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}
                  className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors">
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              {/* Type chip */}
              <div className="flex items-center gap-1.5 shrink-0 w-32">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <MetaIcon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {blockLabel(meta, lang)}
                </span>
              </div>

              {/* Expand toggle + title preview */}
              <button
                type="button"
                onClick={() => toggle(block.id)}
                className="flex-1 flex items-center gap-2 min-w-0 text-left"
              >
                <span className="text-sm text-foreground truncate">
                  {titlePreview || <span className="text-muted-foreground italic text-xs">
                    {lang === "ru" ? "без заголовка" : lang === "uz" ? "sarlavhasiz" : "no title"}
                  </span>}
                </span>
                {itemCount !== undefined && itemCount > 0 && (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary/70 bg-primary/5 shrink-0">
                    {itemCount}
                  </Badge>
                )}
                <span className="ml-auto shrink-0 text-muted-foreground">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              </button>

              {/* Remove */}
              <button type="button" onClick={() => removeBlock(block.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Block editor (expanded) */}
            {isOpen && (
              <div className="px-4 pb-5 pt-4 space-y-4 border-t border-border">
                {/* Title field for all blocks except duration */}
                {block.type !== "duration" && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {lang === "ru" ? "Заголовок раздела" : lang === "uz" ? "Bo'lim sarlavhasi" : "Section heading"}
                    </Label>
                    <Input
                      value={(block as any)[titleKey(lang)] ?? ""}
                      onChange={e => updateBlock(block.id, { [titleKey(lang)]: e.target.value })}
                      placeholder={lang === "ru" ? "Заголовок..." : lang === "uz" ? "Sarlavha..." : "Heading..."}
                      className="bg-input border-border text-foreground h-8 text-sm"
                    />
                  </div>
                )}

                {/* CARDS: columns selector + items */}
                {block.type === "cards" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {lang === "ru" ? "Количество колонок" : lang === "uz" ? "Ustunlar soni" : "Number of columns"}
                      </Label>
                      <div className="flex gap-2">
                        {COLS.map(c => (
                          <button key={c} type="button"
                            onClick={() => updateBlock<CardsBlock>(block.id, { columns: c })}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition-colors ${
                              (block as CardsBlock).columns === c
                                ? "bg-primary/10 border-primary text-primary"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            <span className="font-mono text-[10px] tracking-tighter opacity-60">{gridPreview[c]}</span>
                            <span className="font-medium">{c}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <SectionItemEditor
                      items={(block as CardsBlock).items}
                      onChange={items => updateBlock<CardsBlock>(block.id, { items })}
                      lang={lang}
                      titleLabel={{ ru: "Название", uz: "Nomi", en: "Name" }}
                      descLabel={{ ru: "Описание", uz: "Tavsif", en: "Description" }}
                      addLabel={{ ru: "Добавить карточку", uz: "Karta qo'shish", en: "Add card" }}
                      titlePH={{ ru: "Заголовок карточки", uz: "Karta sarlavhasi", en: "Card title" }}
                      descPH={{ ru: "Описание...", uz: "Tavsif...", en: "Description..." }}
                    />
                  </>
                )}

                {/* STEPS: items */}
                {block.type === "steps" && (
                  <SectionItemEditor
                    items={(block as StepsBlock).items}
                    onChange={items => updateBlock<StepsBlock>(block.id, { items })}
                    lang={lang}
                    titleLabel={{ ru: "Название шага", uz: "Qadam nomi", en: "Step name" }}
                    descLabel={{ ru: "Описание", uz: "Tavsif", en: "Description" }}
                    addLabel={{ ru: "Добавить шаг", uz: "Qadam qo'shish", en: "Add step" }}
                    titlePH={{ ru: "Выберите план", uz: "Rejani tanlang", en: "Choose a plan" }}
                    descPH={{ ru: "Ознакомьтесь с тарифами...", uz: "Tariflar bilan tanishing...", en: "Review the tariffs..." }}
                  />
                )}

                {/* FAQ: items */}
                {block.type === "faq" && (
                  <FaqEditor
                    items={(block as FaqBlock).items}
                    onChange={items => updateBlock<FaqBlock>(block.id, { items })}
                    lang={lang}
                  />
                )}

                {/* DURATION: text */}
                {block.type === "duration" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {lang === "ru" ? "Текст о сроке страхования" : lang === "uz" ? "Sug'urta muddati haqida matn" : "Insurance duration text"}
                    </Label>
                    <Textarea
                      value={(block as DurationBlock)[textKey(lang) as keyof DurationBlock] as string ?? ""}
                      onChange={e => updateBlock<DurationBlock>(block.id, { [textKey(lang)]: e.target.value })}
                      placeholder={lang === "ru" ? "Стандартный срок — 1 год..." : lang === "uz" ? "Standart muddat — 1 yil..." : "Standard term — 1 year..."}
                      rows={2}
                      className="bg-input border-border text-foreground resize-none text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {lang === "ru" ? "Отображается в блоке «Сколько действует защита»."
                        : lang === "uz" ? "«Himoya qancha muddat amal qiladi» blokida ko'rsatiladi."
                        : "Displayed in the «How long does protection last» block."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add block panel */}
      <div className="rounded-xl border border-dashed border-border/60 p-4 bg-muted/5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center mb-3">
          {lang === "ru" ? "Добавить секцию" : lang === "uz" ? "Bo'lim qo'shish" : "Add section"}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {(["cards", "steps", "faq", "duration"] as const).map(type => {
            const meta = BLOCK_META[type];
            const MetaIcon = meta.icon;
            return (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MetaIcon className="h-4.5 w-4.5 h-[18px] w-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                  {blockLabel(meta, lang)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductsManager() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); toast.success("Продукт создан"); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); toast.success("Изменения сохранены"); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); toast.success("Продукт удалён"); },
  });
  const reorderMutation = trpc.products.reorder.useMutation({
    onSuccess: () => utils.products.list.invalidate(),
  });
  const bulkDeleteMutation = trpc.products.bulkDelete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Выбранные продукты удалены");
      setSelectedIds([]);
    },
  });
  const bulkStatusMutation = trpc.products.bulkStatus.useMutation({
    onSuccess: (_data, vars) => {
      utils.products.list.invalidate();
      toast.success(`Статус обновлен: ${vars.status}`);
      setSelectedIds([]);
    },
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [tariffHtml, setTariffHtml] = useState("");
  const [tariffFilename, setTariffFilename] = useState("");
  const [pageBlocks, setPageBlocks] = useState<PageBlock[]>([]);
  const [snapshot, setSnapshot] = useState<string>("");
  const [lang, setLang] = useState<Lang>("ru");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const openCreate = () => {
    const initialForm = { ...emptyForm(), sortOrder: products?.length ?? 0 };
    setEditId(null);
    setForm(initialForm);
    setTariffHtml(""); setTariffFilename("");
    setPageBlocks([]);
    setSnapshot(JSON.stringify({ form: initialForm, tariffHtml: "", pageBlocks: [] }));
    setLang("ru");
    setOpen(true);
  };

  const openEdit = (p: any) => {
    const nextForm: ProductForm = {
      title: p.title ?? "", titleUz: p.titleUz ?? "", titleEn: p.titleEn ?? "",
      description: p.description ?? "", descriptionUz: p.descriptionUz ?? "", descriptionEn: p.descriptionEn ?? "",
      category: p.category ?? "", ctaLink: p.ctaLink ?? "",
      sortOrder: p.sortOrder ?? 0, status: p.status ?? "active",
    };
    const nextTariff = p.tariffHtml ?? "";
    const blocks = parsePageBlocks(p.pageBlocks);
    const nextBlocks = blocks.length > 0 ? blocks : migrateOldData(p);

    setEditId(p.id);
    setForm(nextForm);
    setTariffHtml(nextTariff);
    setTariffFilename(nextTariff ? "widget.html" : "");
    setPageBlocks(nextBlocks);
    setSnapshot(JSON.stringify({ form: nextForm, tariffHtml: nextTariff, pageBlocks: nextBlocks }));

    setLang("ru");
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error("Заголовок (RU) обязателен"); return; }
    if (form.status === "active") {
      const hasDescription = !!form.description.trim();
      const hasAnyBlocks = pageBlocks.length > 0;
      if (!hasDescription || !hasAnyBlocks) {
        toast.error("Для активного продукта заполните RU-описание и добавьте минимум 1 секцию страницы");
        return;
      }
    }
    const payload = {
      ...form,
      tariffHtml: tariffHtml || "",
      pageBlocks: pageBlocks.length > 0 ? JSON.stringify(pageBlocks) : "",
    };
    if (editId) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (!products) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;
    const reordered = products.map((p, i) => {
      if (i === index) return { id: p.id, sortOrder: products[targetIndex]!.sortOrder };
      if (i === targetIndex) return { id: p.id, sortOrder: products[index]!.sortOrder };
      return { id: p.id, sortOrder: p.sortOrder };
    });
    reorderMutation.mutate(reordered);
  };

  const f = (key: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const isPending = createMutation.isPending || updateMutation.isPending;
  const dirty = open && JSON.stringify({ form, tariffHtml, pageBlocks }) !== snapshot;
  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  }, [products]);
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, statusFilter, categoryFilter]);
  const allFilteredSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));
  const isBulkPending = bulkDeleteMutation.isPending || bulkStatusMutation.isPending;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredProducts.some((p) => p.id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const set = new Set(prev);
      filteredProducts.forEach((p) => set.add(p.id));
      return Array.from(set);
    });
  };

  const readinessChecks = [
    { key: "title", ok: !!form.title.trim(), label: "RU заголовок" },
    { key: "desc", ok: !!form.description.trim(), label: "RU описание" },
    { key: "blocks", ok: pageBlocks.length > 0, label: "Секции страницы" },
    { key: "category", ok: !!form.category.trim(), label: "Категория" },
  ];
  const readyCount = readinessChecks.filter((c) => c.ok).length;

  // Count blocks by type for badges
  const blockCounts = pageBlocks.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ── Edit / Create form ──────────────────────────────────────────────────────
  if (open) {
    const titleKey = lang === "uz" ? "titleUz" : lang === "en" ? "titleEn" : "title";
    const descKey  = lang === "uz" ? "descriptionUz" : lang === "en" ? "descriptionEn" : "description";
    const titlePH: Record<Lang, string> = { ru: "Страхование квартиры", uz: "Kvartira sug'urtasi", en: "Apartment Insurance" };
    const descPH:  Record<Lang, string> = { ru: "Краткое описание...", uz: "Qisqacha tavsif...", en: "Short description..." };

    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-3rem)]">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-2 bg-background/95 backdrop-blur border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {editId ? "Редактировать продукт" : "Новый страховой продукт"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Страховые продукты</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LangTabs lang={lang} setLang={setLang} filled={{ ru: !!form.title, uz: !!form.titleUz, en: !!form.titleEn }} />
            <div className="w-px h-6 bg-border" />
            <Button variant="outline" onClick={() => setOpen(false)} className="border-border">Отмена</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Сохранение…" : editId ? "Сохранить изменения" : "Создать продукт"}
            </Button>
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto pt-4">
          <div className="max-w-3xl space-y-4 pb-10">

            {/* 1. Title + Description */}
            <Section title={lang === "ru" ? "Заголовок и описание" : lang === "uz" ? "Sarlavha va tavsif" : "Title & description"} defaultOpen>
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">
                  {lang === "ru" ? "Заголовок" : lang === "uz" ? "Sarlavha" : "Title"}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input value={(form as any)[titleKey] ?? ""} onChange={f(titleKey as keyof ProductForm)}
                  placeholder={titlePH[lang]} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">{lang === "ru" ? "Описание" : lang === "uz" ? "Tavsif" : "Description"}</Label>
                <Textarea value={(form as any)[descKey] ?? ""} onChange={f(descKey as keyof ProductForm)}
                  placeholder={descPH[lang]} rows={3} className="bg-input border-border text-foreground resize-none" />
              </div>
            </Section>

            {/* 2. Category + CTA */}
            <Section title="Категория и CTA-ссылка" defaultOpen>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">Категория</Label>
                  <Select value={form.category || "__none__"}
                    onValueChange={v => setForm(prev => ({ ...prev, category: v === "__none__" ? "" : v }))}>
                    <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="__none__">— Не указана —</SelectItem>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">CTA-ссылка</Label>
                  <Input value={form.ctaLink} onChange={f("ctaLink")}
                    placeholder="https://online.alfainvest.uz/..." className="bg-input border-border text-foreground" />
                  <p className="text-[11px] text-muted-foreground">Кнопка «Оформить» ведёт сюда</p>
                </div>
              </div>
            </Section>

            {/* 2.1 Readiness checklist */}
            <Section title="Готовность к публикации" badge={`${readyCount}/${readinessChecks.length}`} defaultOpen>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {readinessChecks.map((check) => (
                  <div
                    key={check.key}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      check.ok
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/5 text-amber-300"
                    }`}
                  >
                    <span className="text-xs">{check.ok ? "✓" : "!"}</span>
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Рекомендуется публиковать продукт только при полном чеклисте.
              </p>
            </Section>

            {/* 3. Tariff widget (HTML drop zone) */}
            <Section
              title={lang === "ru" ? "Виджет тарифов" : lang === "uz" ? "Tarif vidjet" : "Tariff widget"}
              badge={tariffHtml ? "HTML" : undefined}
              defaultOpen
            >
              <p className="text-[11px] text-muted-foreground -mt-1">
                {lang === "ru"
                  ? "Загрузите HTML-файл — он будет встроен как виджет на странице продукта."
                  : lang === "uz"
                  ? "HTML faylni yuklang — u mahsulot sahifasiga vidjet sifatida joylashtiriladi."
                  : "Upload an HTML file — it will be embedded as a widget on the product page."}
              </p>
              <HtmlDropZone
                value={tariffHtml}
                filename={tariffFilename}
                onChange={(html, name) => { setTariffHtml(html); setTariffFilename(name); }}
                onClear={() => { setTariffHtml(""); setTariffFilename(""); }}
                lang={lang}
              />
            </Section>

            {/* 4. Page sections (Tilda-like blocks) */}
            <Section
              title={lang === "ru" ? "Секции страницы" : lang === "uz" ? "Sahifa bo'limlari" : "Page sections"}
              badge={pageBlocks.length || undefined}
              defaultOpen
            >
              <p className="text-[11px] text-muted-foreground -mt-1">
                {lang === "ru"
                  ? "Конструктор страницы продукта — добавляйте, переставляйте и настраивайте секции."
                  : lang === "uz"
                  ? "Mahsulot sahifasi konstruktori — bo'limlarni qo'shing, tartibini o'zgartiring va sozlang."
                  : "Product page builder — add, reorder and configure sections freely."}
              </p>
              {pageBlocks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                  {Object.entries(blockCounts).map(([type, count]) => (
                    <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/40 border border-border">
                      {BLOCK_META[type as PageBlock["type"]].labelRu}: {count}
                    </span>
                  ))}
                </div>
              )}
              <PageBlocksEditor blocks={pageBlocks} onChange={setPageBlocks} lang={lang} />
            </Section>

            <Separator className="border-border" />

            {/* Sort + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">Порядок сортировки</Label>
                <Input type="number" value={form.sortOrder}
                  onChange={e => setForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">Статус</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="active">✅ Активен (виден на сайте)</SelectItem>
                    <SelectItem value="inactive">🚫 Скрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>
        </div>

        <UnsavedChangesBadge visible={dirty} onSave={handleSubmit} isSaving={isPending} />
      </div>
    );
  }

  // ── Products list ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Страховые продукты</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление продуктовыми страницами сайта</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Новый продукт</Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, описанию, категории..."
            className="bg-input border-border text-foreground md:col-span-1"
          />
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="inactive">Скрыт</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-foreground mr-2">{selectedIds.length} selected</span>
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "active" })}
            >
              Activate selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "inactive" })}
            >
              Hide selected
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isBulkPending}
              onClick={() => {
                if (!confirm(`Удалить ${selectedIds.length} выбранных продукт(ов)?`)) return;
                bulkDeleteMutation.mutate({ ids: selectedIds });
              }}
            >
              Delete selected
            </Button>
            <Button size="sm" variant="ghost" disabled={isBulkPending} onClick={() => setSelectedIds([])}>
              Clear selection
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filteredProducts.length > 0 ? (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[34px_36px_1fr_130px_90px_80px_44px] gap-3 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="accent-primary"
                    aria-label="Select all filtered"
                  />
                </span>
                <span /><span>Продукт</span><span>Категория</span><span>Виджет</span><span>Статус</span><span />
              </div>
              {filteredProducts.map((p, idx) => (
                <div key={p.id}
                  className="grid grid-cols-[34px_36px_1fr_130px_90px_80px_44px] gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="accent-primary"
                      aria-label={`Select product ${p.title}`}
                    />
                  </div>
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveItem(products?.findIndex(x => x.id === p.id) ?? idx, "up")} disabled={(products?.findIndex(x => x.id === p.id) ?? idx) === 0}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button onClick={() => moveItem(products?.findIndex(x => x.id === p.id) ?? idx, "down")} disabled={(products?.findIndex(x => x.id === p.id) ?? idx) === ((products?.length ?? 1) - 1)}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-sm text-foreground truncate">{p.title}</span>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5 ml-6">{p.description}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="text-xs text-muted-foreground truncate">{p.category || "—"}</div>

                  {/* Tariff widget indicator */}
                  <div>
                    {(p as any).tariffHtml
                      ? <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/30 text-emerald-400 bg-emerald-500/5"><FileCode2 className="h-3 w-3" />HTML</Badge>
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </div>

                  {/* Status */}
                  <div>
                    <Badge className={`text-[10px] ${p.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                      {p.status === "active" ? "Активен" : "Скрыт"}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => openEdit(p)} className="gap-2 cursor-pointer">
                        <Pencil className="h-3.5 w-3.5" /> Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                        <a href={`${PUBLIC_SITE}/services/${p.id}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" /> Просмотр
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { if (confirm(`Удалить «${p.title}»?`)) deleteMutation.mutate({ id: p.id }); }}
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground text-sm">
                {products && products.length > 0 ? "Нет продуктов по текущим фильтрам" : "Нет страховых продуктов"}
              </p>
              {products && products.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }}
                  className="gap-2"
                >
                  Сбросить фильтры
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={openCreate} className="gap-2">
                  <Plus className="h-4 w-4" /> Создать первый
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
