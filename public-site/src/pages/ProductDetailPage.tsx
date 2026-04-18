import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  Shield, Home, Plane, Car, Briefcase, HeartPulse,
  ArrowRight, Phone, ChevronRight, CheckCircle2,
  ClipboardList, CreditCard, FileCheck,
  Flame, Droplets, Lock, CloudLightning, Activity, Stethoscope,
  Luggage, CalendarX, Globe, Users, Building2, Package,
  ChevronDown, Clock, Plus, Minus,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useProduct } from "@/lib/useCms";
import { useSettings } from "@/lib/useCms";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Icon map ─────────────────────────────────────────────────────────────────
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

// ─── Category data ────────────────────────────────────────────────────────────
type CoverCategory = { icon: React.ElementType; title: string; desc: string };
type RiskItem      = { icon: React.ElementType; name: string; desc: string };
type FaqItem       = { q: string; a: string };

interface CategoryData {
  covers: CoverCategory[];
  risks: RiskItem[];
  faq: FaqItem[];
  duration: string;
}

const DATA: Record<string, CategoryData> = {
  "Имущество": {
    covers: [
      { icon: Building2, title: "Конструктивные элементы", desc: "Стены, перекрытия, колонны, кровля — компенсация при повреждении несущих конструкций" },
      { icon: Home,      title: "Внутренняя отделка", desc: "Полы, потолки, сантехника, электропроводка — возмещение ущерба от повреждений" },
      { icon: Package,   title: "Движимое имущество", desc: "Мебель, техника, электроника — защита ценных вещей от непредвиденных событий" },
      { icon: Users,     title: "Гражданская ответственность", desc: "Компенсация ущерба, причинённого имуществу или здоровью соседей и третьих лиц" },
    ],
    risks: [
      { icon: Flame,          name: "Пожар",                  desc: "Полная потеря или частичный ущерб от огня и задымления" },
      { icon: CloudLightning, name: "Взрыв",                  desc: "Взрывы бытового газа, паровых котлов и иных устройств" },
      { icon: Droplets,       name: "Залив",                  desc: "Защита от прорыва труб, аварий водопровода и соседей сверху" },
      { icon: CloudLightning, name: "Стихийные бедствия",     desc: "Ураган, молния, землетрясение, наводнение и иные явления" },
      { icon: Lock,           name: "Кража",                  desc: "Возмещение стоимости похищенного имущества со взломом" },
      { icon: Activity,       name: "Механические повреждения", desc: "Случайные физические повреждения имущества третьими лицами" },
    ],
    faq: [
      { q: "Как получить страховую выплату?",         a: "Сообщите о страховом случае по телефону 1182 или в ближайшем офисе. Наш специалист выедет для оценки ущерба в течение 24 часов." },
      { q: "Какие документы нужны для оформления?",  a: "Паспорт, правоустанавливающий документ на квартиру (свидетельство о собственности или договор аренды)." },
      { q: "Что не входит в покрытие?",              a: "Умышленные повреждения, военные действия, естественный износ конструкций, а также события, о которых не было сообщено вовремя." },
      { q: "Можно ли застраховать съёмную квартиру?", a: "Да. Арендаторы могут застраховать движимое имущество и гражданскую ответственность. Конструктив страхует собственник." },
    ],
    duration: "Стандартный срок страхования — 1 год. По желанию доступно страхование на 3 или 6 месяцев.",
  },
  "Личное": {
    covers: [
      { icon: Activity,      title: "Несчастные случаи",       desc: "Выплата при травмах, переломах и иных телесных повреждениях в результате НС" },
      { icon: Stethoscope,   title: "Болезни и госпитализация", desc: "Компенсация расходов на лечение и пребывание в стационаре" },
      { icon: HeartPulse,    title: "Инвалидность",             desc: "Единовременная выплата при установлении I или II группы инвалидности" },
      { icon: Users,         title: "Уход из жизни",            desc: "Выплата выгодоприобретателям в случае смерти застрахованного" },
    ],
    risks: [
      { icon: Activity,      name: "Несчастный случай",         desc: "Травма в быту, на работе, в транспорте или на отдыхе" },
      { icon: Stethoscope,   name: "Острое заболевание",        desc: "Вынужденная госпитализация вследствие болезни" },
      { icon: HeartPulse,    name: "Инвалидность",              desc: "Стойкая утрата трудоспособности I–II группы" },
      { icon: Users,         name: "Смерть кормильца",          desc: "Финансовая защита семьи при потере застрахованного" },
      { icon: ClipboardList, name: "Нетрудоспособность",        desc: "Временная потеря дохода из-за болезни или травмы" },
      { icon: Shield,        name: "Профессиональные риски",    desc: "Увеличенное покрытие для опасных профессий и видов спорта" },
    ],
    faq: [
      { q: "Как сообщить о страховом случае?",        a: "Позвоните на горячую линию 1182 в течение 30 дней с момента события. Соберите медицинские документы, подтверждающие факт НС или болезни." },
      { q: "Какие документы нужны для оформления?",  a: "Паспорт, при необходимости медицинская справка об отсутствии хронических заболеваний." },
      { q: "Есть ли возрастные ограничения?",        a: "Страхование доступно для граждан от 18 до 65 лет. Для детей предусмотрены специальные программы." },
      { q: "Что не входит в покрытие?",              a: "Самоповреждения, участие в незаконных действиях, хронические заболевания, существовавшие до заключения договора." },
    ],
    duration: "Срок действия полиса — 1 год с автоматическим продлением по желанию клиента.",
  },
  "Путешествия": {
    covers: [
      { icon: Stethoscope, title: "Медицинские расходы",    desc: "Оплата лечения, госпитализации и экстренной медпомощи за рубежом" },
      { icon: CalendarX,   title: "Отмена поездки",         desc: "Возврат стоимости билетов и брони при вынужденной отмене путешествия" },
      { icon: Luggage,     title: "Потеря багажа",          desc: "Компенсация стоимости вещей при утере или повреждении багажа авиакомпанией" },
      { icon: Globe,       title: "Гражданская ответственность", desc: "Покрытие ущерба, причинённого третьим лицам во время путешествия" },
    ],
    risks: [
      { icon: Stethoscope,   name: "Болезнь за рубежом",    desc: "Медпомощь и госпитализация без ограничений по стране" },
      { icon: Activity,      name: "Несчастный случай",      desc: "Травмы в транспорте, на отдыхе, во время экскурсий" },
      { icon: CalendarX,     name: "Отмена / задержка",      desc: "Отмена или задержка рейса по независящим причинам" },
      { icon: Luggage,       name: "Задержка / утеря багажа", desc: "Компенсация при задержке или полной потере вещей" },
      { icon: Globe,         name: "Репатриация",            desc: "Экстренная транспортировка на родину при тяжёлой болезни" },
      { icon: Shield,        name: "Юридическая помощь",     desc: "Консультации и помощь юриста при проблемах за рубежом" },
    ],
    faq: [
      { q: "Когда нужно оформить страховку?",        a: "Не позднее чем за 1 день до начала поездки. Мы рекомендуем оформлять сразу после покупки авиабилетов." },
      { q: "Действует ли страховка при ковиде?",    a: "Да, медицинские расходы, связанные с COVID-19, покрываются стандартным полисом." },
      { q: "Как действовать при страховом случае?", a: "Сразу позвоните на круглосуточную ассистанс-линию, номер указан в полисе. Не оплачивайте лечение самостоятельно — мы организуем оплату напрямую." },
      { q: "Есть ли ограничения по странам?",       a: "Нет, страховка действует по всему миру. Шенгенские полисы оформляются с учётом требований посольств." },
    ],
    duration: "Страховка оформляется на конкретные даты поездки. Возможно многократное покрытие на год для частых путешественников.",
  },
  "Ответственность": {
    covers: [
      { icon: Building2,    title: "Вред имуществу",         desc: "Возмещение ущерба, причинённого имуществу третьих лиц" },
      { icon: HeartPulse,   title: "Вред здоровью",          desc: "Оплата лечения пострадавших и компенсация потери дохода" },
      { icon: ClipboardList, title: "Судебные расходы",      desc: "Покрытие расходов на адвоката и судебные издержки" },
      { icon: Shield,        title: "Моральный ущерб",        desc: "Компенсация морального ущерба по решению суда" },
    ],
    risks: [
      { icon: Building2,    name: "Ущерб имуществу",         desc: "Случайное повреждение чужого имущества" },
      { icon: HeartPulse,   name: "Вред здоровью",           desc: "Причинение травм или увечий третьим лицам" },
      { icon: ClipboardList, name: "Судебные претензии",     desc: "Иски от пострадавших и расходы на защиту" },
      { icon: Users,         name: "Профессиональные риски", desc: "Ошибки при оказании профессиональных услуг" },
      { icon: Car,           name: "ДТП",                    desc: "Ущерб пешеходам и другим транспортным средствам" },
      { icon: Shield,        name: "Экологический ущерб",    desc: "Загрязнение окружающей среды в результате деятельности" },
    ],
    faq: [
      { q: "Что делать при предъявлении претензии?", a: "Немедленно сообщите нам о претензии по телефону 1182. Не признавайте ответственность самостоятельно до консультации с нашим специалистом." },
      { q: "Какой лимит ответственности?",           a: "Лимит зависит от выбранного тарифного плана и указывается в договоре страхования." },
      { q: "Покрываются ли умышленные действия?",    a: "Нет. Страховка покрывает только непреднамеренные и случайные события." },
    ],
    duration: "Договор страхования ответственности заключается на 1 год с возможностью пролонгации.",
  },
  "Корпоративное": {
    covers: [
      { icon: Users,     title: "Сотрудники",               desc: "ДМС, страхование от НС, жизнь и здоровье персонала компании" },
      { icon: Building2, title: "Имущество компании",       desc: "Здания, оборудование, склады и корпоративный транспорт" },
      { icon: Package,   title: "Грузы",                    desc: "Защита товаров при транспортировке любым видом транспорта" },
      { icon: Shield,    title: "Ответственность",          desc: "Гражданская и профессиональная ответственность организации" },
    ],
    risks: [
      { icon: Flame,          name: "Пожар и взрыв",        desc: "Возгорание на производстве, складе или офисе" },
      { icon: Lock,           name: "Кража и грабёж",       desc: "Хищение имущества и денежных средств" },
      { icon: Activity,       name: "НС на производстве",   desc: "Травмы сотрудников на рабочем месте" },
      { icon: Package,        name: "Повреждение груза",    desc: "Ущерб товарам при транспортировке и хранении" },
      { icon: CloudLightning, name: "Стихийные бедствия",   desc: "Ураган, землетрясение, наводнение на объектах" },
      { icon: ClipboardList,  name: "Перерыв производства", desc: "Потеря прибыли при вынужденной остановке бизнеса" },
    ],
    faq: [
      { q: "Как оформить корпоративный полис?",      a: "Свяжитесь с нашим менеджером по телефону 1182 или оставьте заявку. Мы подготовим индивидуальное предложение в течение 1 рабочего дня." },
      { q: "Можно ли застраховать только часть рисков?", a: "Да, пакет рисков формируется индивидуально под потребности вашего бизнеса." },
      { q: "Нужен ли осмотр объектов?",             a: "Для крупных объектов — да. Наш сюрвейер проведёт бесплатный осмотр и оценку рисков." },
    ],
    duration: "Корпоративные договоры заключаются на 1 год. Возможно помесячное или поквартальное страхование.",
  },
};

function getCategoryData(title: string, category: string | null): CategoryData {
  const key = category && DATA[category] ? category : null;
  if (key) return DATA[key]!;
  for (const [cat, data] of Object.entries(DATA)) {
    if (title.toLowerCase().includes(cat.toLowerCase())) return data;
  }
  return DATA["Имущество"]!;
}

// ─── Icon by name ─────────────────────────────────────────────────────────────
const NAMED_ICONS: Record<string, React.ElementType> = {
  Shield, Home, Building2, Package, Users, HeartPulse, Plane, Car, Briefcase,
  Flame, Droplets, Lock, CloudLightning, Activity, Stethoscope, CalendarX,
  Luggage, Globe, ClipboardList, CreditCard, FileCheck, Clock, CheckCircle2,
  AlertTriangle: Activity, Zap: CloudLightning, Wind: CloudLightning,
  Snowflake: Droplets, Thermometer: Stethoscope, Wrench: Activity,
};
function getIconByName(name: string): React.ElementType {
  return NAMED_ICONS[name] ?? Shield;
}

// ─── CMS section types ────────────────────────────────────────────────────────
interface CmsSectionItem {
  icon: string;
  title: string; titleUz?: string; titleEn?: string;
  description: string; descriptionUz?: string; descriptionEn?: string;
}
interface CmsFaqEntry {
  question: string; questionUz?: string; questionEn?: string;
  answer: string; answerUz?: string; answerEn?: string;
}
interface CmsGridSection {
  titleRu?: string; titleUz?: string; titleEn?: string;
  columns?: 2 | 3 | 4;
  items: CmsSectionItem[];
}
function parseSection<T>(raw: string | null | undefined): T[] {
  if (!raw?.trim()) return [];
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch { return []; }
}
/** Handles both old flat-array and new {titleRu,columns,items} format */
function parseGridSection(raw: string | null | undefined): CmsGridSection {
  const empty: CmsGridSection = { columns: 3, items: [] };
  if (!raw?.trim()) return empty;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { ...empty, items: parsed as CmsSectionItem[] };
    if (parsed && typeof parsed === "object") {
      return {
        titleRu: parsed.titleRu,
        titleUz: parsed.titleUz,
        titleEn: parsed.titleEn,
        columns: [2, 3, 4].includes(parsed.columns) ? parsed.columns : 3,
        items: Array.isArray(parsed.items) ? parsed.items : [],
      };
    }
  } catch { /**/ }
  return empty;
}
function locField(ru: string, uz?: string, en?: string, locale = "ru"): string {
  if (locale === "uz" && uz) return uz;
  if (locale === "en" && en) return en;
  return ru;
}

// ─── Page block types (matches CMS builder) ──────────────────────────────────
interface CmsCardsBlock {
  id: string; type: "cards";
  titleRu?: string; titleUz?: string; titleEn?: string;
  columns?: 2 | 3 | 4;
  items: CmsSectionItem[];
}
interface CmsStepsBlock {
  id: string; type: "steps";
  titleRu?: string; titleUz?: string; titleEn?: string;
  items: CmsSectionItem[];
}
interface CmsFaqBlock {
  id: string; type: "faq";
  titleRu?: string; titleUz?: string; titleEn?: string;
  items: CmsFaqEntry[];
}
interface CmsDurationBlock {
  id: string; type: "duration";
  textRu?: string; textUz?: string; textEn?: string;
}
type CmsPageBlock = CmsCardsBlock | CmsStepsBlock | CmsFaqBlock | CmsDurationBlock;

function parsePageBlocks(raw: string | null | undefined): CmsPageBlock[] {
  if (!raw?.trim()) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function gridClass(cols?: 2 | 3 | 4): string {
  if (cols === 2) return "sm:grid-cols-2";
  if (cols === 4) return "sm:grid-cols-2 lg:grid-cols-4";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

// ─── Tariff parsing ───────────────────────────────────────────────────────────
interface TariffPlan {
  name: string; nameUz?: string; nameEn?: string;
  price?: string; period?: string;
  features?: string[]; featuresUz?: string[]; featuresEn?: string[];
  recommended?: boolean;
}
function parseTariffs(raw: string | null): TariffPlan[] {
  if (!raw) return [];
  try { const a = JSON.parse(raw); if (Array.isArray(a)) return a; } catch { /**/ }
  return [];
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a, isDark }: { q: string; a: string; isDark: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b last:border-0 ${isDark ? "border-white/8" : "border-slate-200"}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className={`font-medium text-sm leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>{q}</span>
        <span className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
          open
            ? "bg-[#13D6D1] border-[#13D6D1] text-[#1D283A]"
            : isDark
              ? "border-white/20 text-white/40 group-hover:border-[#13D6D1]/50"
              : "border-slate-300 text-slate-500 group-hover:border-[#13D6D1]/50"
        }`}>
          {open ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </span>
      </button>
      {open && (
        <p className={`pb-4 text-sm leading-relaxed ${isDark ? "text-white/55" : "text-slate-700"}`}>
          {a}
        </p>
      )}
    </div>
  );
}

// ─── Tariff widget ─────────────────────────────────────────────────────────────
// Widget is served at /widget/:id (Vite proxy → CMS /public/widget/:id).
// This gives the iframe a real http://localhost:3001/widget/N URL instead of
// blob:, so window.location.href is a valid URL that the bank API accepts for
// success_url validation. Same origin → ResizeObserver still works.
// allow-top-navigation lets the bank payment redirect open as a full page.
function TariffWidget({ productId }: { productId: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(480);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const measure = () => {
      try {
        const h = iframe.contentDocument?.documentElement?.scrollHeight ?? 0;
        if (h > 0) setHeight(h);
      } catch { /* cross-origin guard */ }
    };

    iframe.onload = () => {
      measure();
      // ResizeObserver catches every DOM change after Vue mounts
      try {
        observer = new ResizeObserver(measure);
        const doc = iframe.contentDocument;
        if (doc?.documentElement) observer.observe(doc.documentElement);
        if (doc?.body)           observer.observe(doc.body);
      } catch { /**/ }
      // Fallback polls in case Vue renders asynchronously
      [300, 800, 1500, 3000].forEach(ms =>
        timers.push(setTimeout(measure, ms))
      );
    };

    iframe.src = `/widget/${productId}`;

    return () => {
      iframe.onload = null;
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [productId]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-none block"
      style={{ height }}
      title="Тарифный виджет"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductDetailPage({ id }: { id: number }) {
  const { t, locale } = useI18n();
  const { data: product, loading } = useProduct(id, locale);
  const { data: settings } = useSettings(locale);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const phone     = settings?.contact_phone    || "+998 78 120 00 80";
  const shortPhone = settings?.contact_short_phone || "1182";
  const lightSectionBase = "var(--bg-primary)";
  const lightSectionAlt = "var(--section-alt)";

  const pageBg   = isDark ? "bg-[#1D283A]"   : "bg-white";
  const labelColor = isDark ? "text-white/40" : "text-slate-500";
  const pageBgStyle = isDark ? undefined : { backgroundColor: lightSectionBase };
  const sectionBgStyle = isDark ? undefined : { backgroundColor: lightSectionAlt };

  // ── loading ──
  if (loading) {
    return (
      <Layout>
        <div className={`min-h-screen ${pageBg} flex items-center justify-center`} style={pageBgStyle}>
          <div className="w-10 h-10 border-2 border-[#13D6D1]/30 border-t-[#13D6D1] rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }
  if (!product) {
    return (
      <Layout>
        <div className={`min-h-screen ${pageBg} flex flex-col items-center justify-center gap-6`} style={pageBgStyle}>
          <Shield className="h-16 w-16 text-[#13D6D1]/30" />
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{t("product_not_found")}</h1>
          <Link href="/services" className="inline-flex items-center gap-2 text-[#13D6D1] hover:underline text-sm">
            <ArrowRight className="h-4 w-4 rotate-180" /> {t("product_back")}
          </Link>
        </div>
      </Layout>
    );
  }

  const Icon    = getIcon(product.title);
  const catData = getCategoryData(product.title, product.category);
  const tariffs = parseTariffs(product.tariffs);

  // ── Resolve sections: API data takes priority, fall back to hardcoded DATA ──
  const apiCoverSection = parseGridSection((product as any).coverageItems);
  const apiRiskSection  = parseGridSection((product as any).risks);
  const apiFaq    = parseSection<CmsFaqEntry>((product as any).faq);
  const apiSteps  = parseSection<CmsSectionItem>((product as any).steps);
  const apiDuration = (product as any).duration as string | null;
  // Custom sections
  interface ApiCustomSection extends CmsGridSection { id: string; adminLabel: string; }
  const apiExtra = ((): ApiCustomSection[] => {
    const raw = (product as any).extraSections as string | null;
    if (!raw?.trim()) return [];
    try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch { return []; }
  })();

  // Coverage section
  const coversColumns = apiCoverSection.columns ?? 3;
  const coverSectionTitle = locField(
    apiCoverSection.titleRu ?? "", apiCoverSection.titleUz, apiCoverSection.titleEn, locale
  ) || t("product_coverage_title");
  const covers = apiCoverSection.items.length > 0
    ? apiCoverSection.items.map(item => ({
        Icon: getIconByName(item.icon),
        title: locField(item.title, item.titleUz, item.titleEn, locale),
        desc: locField(item.description, item.descriptionUz, item.descriptionEn, locale),
      }))
    : catData.covers.map(({ icon: IC, title, desc }) => ({ Icon: IC, title, desc }));

  // Risks section
  const risksColumns = apiRiskSection.columns ?? 3;
  const riskSectionTitle = locField(
    apiRiskSection.titleRu ?? "", apiRiskSection.titleUz, apiRiskSection.titleEn, locale
  ) || (locale === "uz" ? "Qanday xatarlardan himoya qilinadi" : locale === "en" ? "Protected against these risks" : "От каких рисков действует защита");
  const risks = apiRiskSection.items.length > 0
    ? apiRiskSection.items.map(item => ({
        Icon: getIconByName(item.icon),
        name: locField(item.title, item.titleUz, item.titleEn, locale),
        desc: locField(item.description, item.descriptionUz, item.descriptionEn, locale),
      }))
    : catData.risks.map(({ icon: IC, name, desc }) => ({ Icon: IC, name, desc }));

  const faqItems = apiFaq.length > 0
    ? apiFaq.map(item => ({
        q: locField(item.question, item.questionUz, item.questionEn, locale),
        a: locField(item.answer, item.answerUz, item.answerEn, locale),
      }))
    : catData.faq;

  const steps = apiSteps.length > 0
    ? apiSteps.map((item, idx) => ({
        Icon: getIconByName(item.icon),
        n: String(idx + 1).padStart(2, "0"),
        title: locField(item.title, item.titleUz, item.titleEn, locale),
        desc: locField(item.description, item.descriptionUz, item.descriptionEn, locale),
      }))
    : [
        { Icon: ClipboardList, n: "01", title: t("product_step1_title"), desc: t("product_step1_desc") },
        { Icon: FileCheck,     n: "02", title: t("product_step2_title"), desc: t("product_step2_desc") },
        { Icon: CreditCard,    n: "03", title: t("product_step3_title"), desc: t("product_step3_desc") },
        { Icon: Shield,        n: "04", title: t("product_step4_title"), desc: t("product_step4_desc") },
      ];

  const duration = apiDuration || catData.duration;

  // ── Page blocks (new Tilda-like builder) ──
  const rawPageBlocks = parsePageBlocks((product as any).pageBlocks);
  const usePageBlocks = rawPageBlocks.length > 0;

  const heroBg  = isDark
    ? "bg-gradient-to-br from-[#1D283A] via-[#1D3A4A] to-[#1D283A]"
    : "bg-gradient-to-br from-white via-[#F2FFFE] to-white";
  const sectionBg  = isDark ? "bg-[#162031]" : "bg-[#EBF8F8]";
  const sectionDiv = isDark ? "border-t border-white/5" : "border-t border-[#D4F0F0]";
  // Label colour: bright teal on dark, dark teal on light (contrast on teal-tinted bg)
  const accentLabel = isDark ? "text-[#13D6D1]" : "text-[#0B7C79]";
  const cardBg    = isDark ? "bg-white/[0.04] border-white/8"   : "bg-white border-slate-200/80 shadow-md shadow-slate-100/60";
  const cardTitle = isDark ? "text-white"   : "text-slate-900";
  const cardDesc  = isDark ? "text-white/55" : "text-slate-600";

  return (
    <Layout>

      {/* ═══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className={`${heroBg} border-b ${isDark ? "border-white/8" : "border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-12 md:pb-20">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-8 flex-wrap">
            <Link href="/" className={`${labelColor} hover:text-[#13D6D1] transition-colors`}>{t("nav_home")}</Link>
            <ChevronRight className={`h-3 w-3 ${labelColor}`} />
            <Link href="/services" className={`${labelColor} hover:text-[#13D6D1] transition-colors`}>{t("nav_services")}</Link>
            <ChevronRight className={`h-3 w-3 ${labelColor}`} />
            <span className="text-[#13D6D1] font-medium truncate max-w-[220px]">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left */}
            <div>
              {product.category && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#13D6D1]/10 border border-[#13D6D1]/20 text-[#13D6D1] text-xs font-semibold mb-4">
                  <Shield className="h-3 w-3" />
                  {product.category}
                </div>
              )}
              <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-4 ${cardTitle}`}>
                {product.title}
              </h1>
              {product.description && (
                <p className={`text-base leading-relaxed mb-8 max-w-lg ${cardDesc}`}>
                  {product.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <a
                  href={product.ctaLink || `tel:${shortPhone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] font-bold hover:bg-[#0fc4bf] transition-all shadow-md shadow-[#13D6D1]/20 text-sm"
                >
                  {t("product_cta_apply")} <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-medium text-sm transition-all ${
                    isDark ? "border-white/15 text-white/80 hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Phone className="h-4 w-4" />{t("product_cta_call")}
                </a>
              </div>
            </div>

            {/* Right — decorative illustration */}
            <div className="hidden lg:flex justify-center">
              <div className={`relative w-80 h-64 rounded-3xl border overflow-hidden ${
                isDark ? "bg-white/[0.03] border-white/8" : "bg-gradient-to-br from-[#E8F4F4] to-[#F0FAFA] border-[#13D6D1]/15"
              }`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(19,214,209,0.12),transparent)]" />
                <div className="relative h-full flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#13D6D1]/15 border border-[#13D6D1]/25 flex items-center justify-center">
                    <Icon className="h-10 w-10 text-[#13D6D1]" />
                  </div>
                  <div className="w-full space-y-2">
                    {covers.slice(0, 3).map(({ title }) => (
                      <div key={title} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#13D6D1] shrink-0" />
                        <span className={`text-xs ${cardDesc}`}>{title}</span>
                      </div>
                    ))}
                    {covers.length > 3 && (
                      <p className="text-[11px] text-[#13D6D1]/60 pl-5">+{covers.length - 3} ещё</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TARIFF WIDGET or TARIFF PLANS ════════════════════════════════════ */}
      {(product as any).tariffHtml ? (
        // ── HTML widget — served via /widget/:id proxy, real URL for bank API ──
        <section className={`py-10 px-4 sm:px-6 lg:px-8 ${sectionBg}`} style={sectionBgStyle}>
          <div className="max-w-7xl mx-auto">
            <TariffWidget productId={id} />
          </div>
        </section>
      ) : tariffs.length > 0 ? (
        // ── Legacy JSON tariff cards ───────────────────────────────────────────
        <section className={`py-16 px-4 sm:px-6 lg:px-8 ${sectionBg}`} style={sectionBgStyle}>
          <div className="max-w-7xl mx-auto">
            <p className={`${accentLabel} text-xs font-semibold uppercase tracking-widest mb-2`}>{t("product_tariffs_title")}</p>
            <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-8`}>{t("product_tariffs_subtitle")}</h2>
            <div className={`grid gap-5 ${
              tariffs.length === 1 ? "max-w-sm" :
              tariffs.length === 2 ? "sm:grid-cols-2 max-w-2xl" :
              "sm:grid-cols-2 lg:grid-cols-3"
            }`}>
              {tariffs.map((plan, i) => {
                const isRec = plan.recommended || (tariffs.length >= 3 && i === 1);
                const planName = locField(plan.name, plan.nameUz, plan.nameEn, locale);
                const planFeatures = locale === "uz" ? (plan.featuresUz ?? plan.features ?? [])
                  : locale === "en" ? (plan.featuresEn ?? plan.features ?? [])
                  : (plan.features ?? []);
                return (
                  <div key={plan.name || i} className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg ${
                    isRec ? "border-[#13D6D1]/50 shadow-[#13D6D1]/10 shadow-md" : isDark ? cardBg : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    {isRec && <div className="bg-[#13D6D1] text-[#1D283A] text-xs font-bold text-center py-2 tracking-wider uppercase">✦ Рекомендуем</div>}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className={`text-base font-bold ${cardTitle} mb-4`}>{planName}</h3>
                      {plan.price && (
                        <div className={`mb-5 pb-4 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
                          <span className={`text-xs ${labelColor} block mb-0.5`}>{t("product_tariff_from")}</span>
                          <span className="text-2xl font-bold text-[#13D6D1]">{plan.price}</span>
                          {plan.period && <span className={`text-xs ${labelColor} ml-1`}>/ {plan.period}</span>}
                        </div>
                      )}
                      {planFeatures.length > 0 && (
                        <ul className="space-y-2.5 flex-1 mb-6">
                          {planFeatures.map((f: string, fi: number) => (
                            <li key={fi} className="flex items-start gap-2.5">
                              <CheckCircle2 className="h-4 w-4 text-[#13D6D1] shrink-0 mt-0.5" />
                              <span className={`text-sm ${cardDesc}`}>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <a href={product.ctaLink || "/contacts"} className={`mt-auto flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isRec ? "bg-[#13D6D1] text-[#1D283A] hover:bg-[#0fc4bf]"
                        : isDark ? "border border-white/15 text-white/80 hover:bg-white/5"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#13D6D1]/40"
                      }`}>
                        {t("product_tariff_get")} <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ═══ PAGE SECTIONS (pageBlocks builder OR legacy fallback) ═════════════ */}
      {usePageBlocks ? (
        // ── New block-based rendering ──────────────────────────────────────────
        rawPageBlocks.map((block, idx) => {
          const isAlt = idx % 2 !== 0;
          const bg    = isAlt ? sectionBg : pageBg;
          const div   = isAlt ? sectionDiv : "";

          // CARDS block
          if (block.type === "cards") {
            const cb = block as CmsCardsBlock;
            if (!cb.items?.length) return null;
            const title = locField(cb.titleRu ?? "", cb.titleUz, cb.titleEn, locale);
            return (
              <section key={cb.id} className={`py-12 px-4 sm:px-6 lg:px-8 ${bg} ${div}`} style={isDark ? undefined : (isAlt ? sectionBgStyle : pageBgStyle)}>
                <div className="max-w-7xl mx-auto">
                  {title && <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-8`}>{title}</h2>}
                  <div className={`grid grid-cols-1 gap-4 ${gridClass(cb.columns)}`}>
                    {cb.items.map((item, i) => {
                      const ItemIcon = getIconByName(item.icon);
                      const itemTitle = locField(item.title, item.titleUz, item.titleEn, locale);
                      const itemDesc  = locField(item.description, item.descriptionUz, item.descriptionEn, locale);
                      return (
                        <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${cardBg} hover:border-[#13D6D1]/40 transition-all`}>
                          <div className="w-11 h-11 shrink-0 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mt-0.5">
                            <ItemIcon className="h-5 w-5 text-[#13D6D1]" />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${cardTitle} mb-1`}>{itemTitle}</p>
                            <p className={`text-xs ${cardDesc} leading-relaxed`}>{itemDesc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          // STEPS block
          if (block.type === "steps") {
            const sb = block as CmsStepsBlock;
            if (!sb.items?.length) return null;
            const title = locField(sb.titleRu ?? "", sb.titleUz, sb.titleEn, locale)
              || t("product_steps_title");
            const stepCount = sb.items.length;
            return (
              <section key={sb.id} className={`py-12 px-4 sm:px-6 lg:px-8 ${bg} ${div}`} style={isDark ? undefined : (isAlt ? sectionBgStyle : pageBgStyle)}>
                <div className="max-w-7xl mx-auto">
                  <p className={`${accentLabel} text-xs font-semibold uppercase tracking-widest mb-2`}>{t("product_steps_label")}</p>
                  <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-10`}>{title}</h2>
                  <div className={`grid gap-5 ${
                    stepCount <= 2 ? "sm:grid-cols-2"
                    : stepCount === 3 ? "sm:grid-cols-3"
                    : "sm:grid-cols-2 lg:grid-cols-4"
                  }`}>
                    {sb.items.map((item, i) => {
                      const SIcon = getIconByName(item.icon);
                      const n = String(i + 1).padStart(2, "0");
                      const stitle = locField(item.title, item.titleUz, item.titleEn, locale);
                      const sdesc  = locField(item.description, item.descriptionUz, item.descriptionEn, locale);
                      return (
                        <div key={i} className={`relative rounded-2xl border ${cardBg} p-6 overflow-hidden`}>
                          <span className={`absolute top-3 right-3 text-5xl font-black leading-none select-none pointer-events-none ${isDark ? "text-[#13D6D1]/10" : "text-[#13D6D1]/8"}`}>{n}</span>
                          <div className="w-11 h-11 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mb-4">
                            <SIcon className="h-5 w-5 text-[#13D6D1]" />
                          </div>
                          <h3 className={`font-semibold text-sm ${cardTitle} mb-1.5`}>{stitle}</h3>
                          <p className={`text-xs ${cardDesc} leading-relaxed`}>{sdesc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          }

          // FAQ block
          if (block.type === "faq") {
            const fb = block as CmsFaqBlock;
            if (!fb.items?.length) return null;
            const title = locField(fb.titleRu ?? "", fb.titleUz, fb.titleEn, locale)
              || t("product_faq_title");
            return (
              <section key={fb.id} className={`py-12 px-4 sm:px-6 lg:px-8 ${bg} ${div}`} style={isDark ? undefined : (isAlt ? sectionBgStyle : pageBgStyle)}>
                <div className="max-w-3xl mx-auto">
                  <p className={`${accentLabel} text-xs font-semibold uppercase tracking-widest mb-2`}>{t("product_faq_label") || "FAQ"}</p>
                  <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-8`}>{title}</h2>
                  <div className={`rounded-2xl border ${cardBg} px-6 divide-y ${isDark ? "divide-white/8" : "divide-slate-100"}`}>
                    {fb.items.map((item, i) => (
                      <FaqItem
                        key={i}
                        isDark={isDark}
                        q={locField(item.question, item.questionUz, item.questionEn, locale)}
                        a={locField(item.answer, item.answerUz, item.answerEn, locale)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // DURATION block
          if (block.type === "duration") {
            const db = block as CmsDurationBlock;
            const text = locField(db.textRu ?? "", db.textUz, db.textEn, locale);
            if (!text) return null;
            return (
              <section key={db.id} className={`py-8 px-4 sm:px-6 lg:px-8 ${bg} ${div}`} style={isDark ? undefined : (isAlt ? sectionBgStyle : pageBgStyle)}>
                <div className="max-w-7xl mx-auto">
                  <div className={`rounded-2xl border ${cardBg} p-7 flex items-start gap-5`}>
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-[#13D6D1]" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${cardTitle} mb-1`}>{t("product_duration_title")}</h3>
                      <p className={`text-sm ${cardDesc} leading-relaxed`}>{text}</p>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })
      ) : (
        // ── Legacy fixed-column rendering (backward compatibility) ─────────────
        <>
          {/* WHAT'S COVERED */}
          <section className={`py-12 px-4 sm:px-6 lg:px-8 ${pageBg}`} style={pageBgStyle}>
            <div className="max-w-7xl mx-auto">
              <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-8`}>{coverSectionTitle}</h2>
              <div className={`grid grid-cols-1 gap-4 ${gridClass(coversColumns as 2|3|4)}`}>
                {covers.map(({ Icon: CIcon, title, desc }) => (
                  <div key={title} className={`flex items-start gap-4 p-5 rounded-2xl border ${cardBg} hover:border-[#13D6D1]/30 transition-all`}>
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mt-0.5">
                      <CIcon className="h-5 w-5 text-[#13D6D1]" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${cardTitle} mb-1`}>{title}</p>
                      <p className={`text-xs ${cardDesc} leading-relaxed`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RISKS */}
          <section className={`py-12 px-4 sm:px-6 lg:px-8 ${sectionBg} ${sectionDiv}`} style={sectionBgStyle}>
            <div className="max-w-7xl mx-auto">
              <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-8`}>{riskSectionTitle}</h2>
              <div className={`grid grid-cols-1 gap-4 ${gridClass(risksColumns as 2|3|4)}`}>
                {risks.map(({ Icon: RIcon, name, desc }) => (
                  <div key={name} className={`flex items-start gap-3 p-4 rounded-xl border ${cardBg} hover:border-[#13D6D1]/30 transition-all`}>
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-[#13D6D1]/10 flex items-center justify-center">
                      <RIcon className="h-4 w-4 text-[#13D6D1]" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${cardTitle}`}>{name}</p>
                      <p className={`text-xs ${cardDesc} leading-relaxed mt-0.5`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* DURATION */}
          <section className={`py-8 px-4 sm:px-6 lg:px-8 ${pageBg}`} style={pageBgStyle}>
            <div className="max-w-7xl mx-auto">
              <div className={`rounded-2xl border ${cardBg} p-7 flex items-start gap-5`}>
                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#13D6D1]" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${cardTitle} mb-1`}>{t("product_duration_title")}</h3>
                  <p className={`text-sm ${cardDesc} leading-relaxed`}>{duration}</p>
                </div>
              </div>
            </div>
          </section>

          {/* HOW TO APPLY */}
          <section className={`py-12 px-4 sm:px-6 lg:px-8 ${sectionBg} ${sectionDiv}`} style={sectionBgStyle}>
            <div className="max-w-7xl mx-auto">
              <p className={`${accentLabel} text-xs font-semibold uppercase tracking-widest mb-2`}>{t("product_steps_label")}</p>
              <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-10`}>{t("product_steps_title")}</h2>
              <div className={`grid gap-5 ${steps.length <= 2 ? "sm:grid-cols-2" : steps.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
                {steps.map(({ Icon: SIcon, n, title: stitle, desc }) => (
                  <div key={n} className={`relative rounded-2xl border ${cardBg} p-6 overflow-hidden`}>
                    <span className={`absolute top-3 right-3 text-5xl font-black leading-none select-none pointer-events-none ${isDark ? "text-[#13D6D1]/10" : "text-[#13D6D1]/8"}`}>{n}</span>
                    <div className="w-11 h-11 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mb-4">
                      <SIcon className="h-5 w-5 text-[#13D6D1]" />
                    </div>
                    <h3 className={`font-semibold text-sm ${cardTitle} mb-1.5`}>{stitle}</h3>
                    <p className={`text-xs ${cardDesc} leading-relaxed`}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          {faqItems.length > 0 && (
            <section className={`py-12 px-4 sm:px-6 lg:px-8 ${pageBg}`} style={pageBgStyle}>
              <div className="max-w-3xl mx-auto">
                <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-8`}>{t("product_faq_title")}</h2>
                <div className={`rounded-2xl border ${cardBg} px-6 divide-y ${isDark ? "divide-white/8" : "divide-slate-200"}`}>
                  {faqItems.map((item) => (
                    <FaqItem key={item.q} q={item.q} a={item.a} isDark={isDark} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* EXTRA CUSTOM SECTIONS */}
          {apiExtra.map((sec, idx) => {
            if (!sec.items?.length) return null;
            const secTitle = locField(sec.titleRu ?? "", sec.titleUz, sec.titleEn, locale) || sec.adminLabel;
            const secCols = (sec.columns ?? 3) as 2|3|4;
            const bg = idx % 2 === 0 ? sectionBg : pageBg;
            return (
              <section key={sec.id ?? idx} className={`py-16 px-4 sm:px-6 lg:px-8 ${bg}`} style={isDark ? undefined : (idx % 2 === 0 ? sectionBgStyle : pageBgStyle)}>
                <div className="max-w-7xl mx-auto">
                  {secTitle && <h2 className={`text-2xl md:text-3xl font-bold ${cardTitle} mb-8`}>{secTitle}</h2>}
                  <div className={`grid grid-cols-1 gap-4 ${gridClass(secCols)}`}>
                    {sec.items.map((item: CmsSectionItem, i: number) => {
                      const ItemIcon = getIconByName(item.icon);
                      const itemTitle = locField(item.title, item.titleUz, item.titleEn, locale);
                      const itemDesc  = locField(item.description, item.descriptionUz, item.descriptionEn, locale);
                      return (
                        <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${cardBg} hover:border-[#13D6D1]/30 transition-all`}>
                          <div className="w-11 h-11 shrink-0 rounded-xl bg-[#13D6D1]/10 border border-[#13D6D1]/20 flex items-center justify-center mt-0.5">
                            <ItemIcon className="h-5 w-5 text-[#13D6D1]" />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${cardTitle} mb-1`}>{itemTitle}</p>
                            <p className={`text-xs ${cardDesc} leading-relaxed`}>{itemDesc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* ═══ CTA BANNER ═════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1D283A] via-[#1D3A4A] to-[#1D283A] px-8 py-12 md:px-14 md:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_30%_50%,rgba(19,214,209,0.12),transparent)]" />
            <div className="relative max-w-xl">
              <p className={`${accentLabel} text-xs font-semibold uppercase tracking-widest mb-3`}>{t("product_cta_label")}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t("product_cta_title")}</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">{t("product_cta_subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={product.ctaLink || `tel:${shortPhone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13D6D1] text-[#1D283A] font-bold hover:bg-[#0fc4bf] transition-all text-sm"
                >
                  {t("product_cta_apply")} <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/80 font-medium hover:bg-white/5 transition-all text-sm"
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
