import { Route, Switch } from "wouter";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import ContactsPage from "./pages/ContactsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { useTheme } from "./contexts/ThemeContext";
import { useI18n } from "./contexts/I18nContext";

function NotFound() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const isDark = theme === "dark";
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#1D283A]" : "bg-[#F8FAFC]"}`}>
      <div className="text-center">
        <div className="text-6xl font-bold text-[#13D6D1] mb-4">404</div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"} mb-2`}>{t("no_data")}</h1>
        <p className={`${isDark ? "text-white/50" : "text-slate-500"} mb-6`}>{t("loading")}</p>
        <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13D6D1] text-[#1D283A] font-semibold hover:bg-[#0fc4bf] transition-all">
          {t("nav_home")}
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/news/:slug">
        {(params) => <NewsDetailPage slug={params.slug} />}
      </Route>
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/products/:id">
        {(params) => <ProductDetailPage id={parseInt(params.id || "0", 10)} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}
