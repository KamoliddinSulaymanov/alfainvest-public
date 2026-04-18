import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UnsavedChangesBadge } from "@/components/UnsavedChangesBadge";
import { toast } from "sonner";
import {
  Settings, Save, Building2, Phone, Globe, MessageSquare,
  BarChart2, Eye, EyeOff, CheckCircle2, XCircle, Loader2,
} from "lucide-react";

type SettingsMap = Record<string, string>;

const settingGroups = [
  {
    title: "Company Information",
    icon: Building2,
    fields: [
      { key: "company_name", label: "Company Name", placeholder: "Alfa Invest Insurance" },
      { key: "company_tagline", label: "Tagline", placeholder: "Your trusted insurance partner" },
      { key: "company_description", label: "Description", placeholder: "Short company description", multiline: true },
      { key: "company_inn", label: "INN / Tax ID", placeholder: "123456789" },
      { key: "company_license", label: "License Number", placeholder: "License #12345" },
    ],
  },
  {
    title: "Contact Information",
    icon: Phone,
    fields: [
      { key: "contact_phone", label: "Main Phone", placeholder: "+998 71 123 45 67" },
      { key: "contact_phone_2", label: "Secondary Phone", placeholder: "+998 71 123 45 68" },
      { key: "contact_email", label: "Email", placeholder: "info@alfainvest.uz" },
      { key: "contact_address", label: "Main Address", placeholder: "Tashkent, Uzbekistan", multiline: true },
      { key: "contact_working_hours", label: "Working Hours", placeholder: "Mon-Fri 9:00-18:00" },
    ],
  },
  {
    title: "Social Media Links",
    icon: Globe,
    fields: [
      { key: "social_telegram", label: "Telegram", placeholder: "https://t.me/alfainvest" },
      { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/alfainvest" },
      { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/alfainvest" },
      { key: "social_youtube", label: "YouTube", placeholder: "https://youtube.com/@alfainvest" },
      { key: "social_linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/alfainvest" },
    ],
  },
  {
    title: "Footer Content",
    icon: MessageSquare,
    fields: [
      { key: "footer_text", label: "Footer Text", placeholder: "© 2024 Alfa Invest. All rights reserved.", multiline: true },
      { key: "footer_disclaimer", label: "Legal Disclaimer", placeholder: "Insurance services provided under license...", multiline: true },
    ],
  },
];

// ─── Umami Section ────────────────────────────────────────────────────────────
function UmamiSettingsCard({
  values,
  onChange,
  onSave,
  isSaving,
}: {
  values: SettingsMap;
  onChange: (key: string, val: string) => void;
  onSave: () => Promise<boolean>;
  isSaving: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const testMutation = trpc.analytics.testConnection.useMutation({
    onMutate: () => { setTestStatus("loading"); setTestMessage(""); },
    onSuccess: (data) => {
      if (data.ok) {
        setTestStatus("ok");
        setTestMessage(data.message ?? "Подключение успешно");
      } else {
        setTestStatus("error");
        setTestMessage(data.message ?? "Не удалось подключиться");
      }
    },
    onError: (e) => {
      setTestStatus("error");
      setTestMessage(e.message);
    },
  });

  const handleTest = () => {
    testMutation.mutate({
      url: values["umami_url"] ?? "",
      username: values["umami_username"] ?? "",
      password: values["umami_password"] ?? "",
      websiteId: values["umami_website_id"] ?? "",
    });
  };

  const handleSaveAndTest = async () => {
    const saved = await onSave();
    if (saved) {
      handleTest();
    }
  };

  const isConfigured =
    (values["umami_url"] ?? "").length > 0 &&
    (values["umami_username"] ?? "").length > 0 &&
    (values["umami_password"] ?? "").length > 0 &&
    (values["umami_website_id"] ?? "").length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
            Umami Analytics
          </CardTitle>
          {isConfigured ? (
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-xs">
              Настроен
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5 text-xs">
              Не настроен
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Введите данные вашего self-hosted Umami сервера. Эти настройки используются на странице Analytics.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* URL */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-foreground text-sm">Umami Server URL</Label>
            <Input
              value={values["umami_url"] ?? ""}
              onChange={(e) => onChange("umami_url", e.target.value)}
              placeholder="https://analytics.yourdomain.com"
              className="bg-input border-border text-foreground font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Без слэша в конце. Например: https://umami.example.com</p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Логин (Username)</Label>
            <Input
              value={values["umami_username"] ?? ""}
              onChange={(e) => onChange("umami_username", e.target.value)}
              placeholder="admin"
              autoComplete="off"
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Пароль (Password)</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={values["umami_password"] ?? ""}
                onChange={(e) => onChange("umami_password", e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-input border-border text-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Website ID */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-foreground text-sm">Website ID</Label>
            <Input
              value={values["umami_website_id"] ?? ""}
              onChange={(e) => onChange("umami_website_id", e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="bg-input border-border text-foreground font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Найдите в Umami: Settings → Websites → Edit → Website ID (UUID формат)
            </p>
          </div>
        </div>

        {/* Test result */}
        {testStatus !== "idle" && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              testStatus === "ok"
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : testStatus === "error"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {testStatus === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {testStatus === "ok" && <CheckCircle2 className="h-4 w-4" />}
            {testStatus === "error" && <XCircle className="h-4 w-4" />}
            <span>{testStatus === "loading" ? "Проверяю подключение..." : testMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={!isConfigured || testMutation.isPending}
            className="gap-1.5"
          >
            {testMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BarChart2 className="h-3.5 w-3.5" />
            )}
            Проверить подключение
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAndTest}
            disabled={!isConfigured || isSaving}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Сохранить и проверить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery();
  const upsertMutation = trpc.settings.update.useMutation({
    onSuccess: () => { utils.settings.getAll.invalidate(); toast.success("Settings saved"); },
    onError: (e: any) => toast.error("Failed to save: " + e.message),
  });

  const [values, setValues] = useState<SettingsMap>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setValues(settings as SettingsMap);
      setDirty(false);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await upsertMutation.mutateAsync(values);
      setDirty(false);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage site-wide configuration and company information</p>
        </div>
        <Button onClick={() => void handleSave()} disabled={!dirty || upsertMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {upsertMutation.isPending ? "Saving..." : dirty ? "Save Changes" : "Saved"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {settingGroups.map((group) => (
            <Card key={group.title} className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <group.icon className="h-4 w-4 text-primary" />
                  </div>
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.fields.map((field) => (
                    <div key={field.key} className={`space-y-2 ${field.multiline ? "md:col-span-2" : ""}`}>
                      <Label className="text-foreground text-sm">{field.label}</Label>
                      {field.multiline ? (
                        <Textarea
                          value={values[field.key] ?? ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="bg-input border-border text-foreground resize-none"
                        />
                      ) : (
                        <Input
                          value={values[field.key] ?? ""}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="bg-input border-border text-foreground"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Umami Analytics */}
          <UmamiSettingsCard
            values={values}
            onChange={handleChange}
            onSave={handleSave}
            isSaving={upsertMutation.isPending}
          />
        </div>
      )}

      <UnsavedChangesBadge visible={dirty} onSave={() => void handleSave()} isSaving={upsertMutation.isPending} />
    </div>
  );
}
