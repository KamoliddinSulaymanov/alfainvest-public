import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Newspaper, Calendar, Search } from "lucide-react";
import LangTabs, { type Lang } from "@/components/LangTabs";
import { UnsavedChangesBadge } from "@/components/UnsavedChangesBadge";

type NewsForm = {
  title: string;
  titleUz: string;
  titleEn: string;
  slug: string;
  content: string;
  contentUz: string;
  contentEn: string;
  excerpt: string;
  excerptUz: string;
  excerptEn: string;
  coverImageUrl: string;
  category: string;
  tags: string;
  status: "draft" | "published" | "scheduled";
  publishedAt: string;
};

const emptyForm: NewsForm = {
  title: "", titleUz: "", titleEn: "",
  slug: "",
  content: "", contentUz: "", contentEn: "",
  excerpt: "", excerptUz: "", excerptEn: "",
  coverImageUrl: "", category: "", tags: "", status: "draft", publishedAt: "",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const statusColors: Record<string, string> = {
  published: "border-green-500/30 text-green-400 bg-green-500/10",
  draft: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
  scheduled: "border-blue-500/30 text-blue-400 bg-blue-500/10",
};

export default function NewsManager() {
  const utils = trpc.useUtils();
  const { data: newsList, isLoading } = trpc.news.list.useQuery();
  const createMutation = trpc.news.create.useMutation({ onSuccess: () => { utils.news.list.invalidate(); toast.success("Article created"); setOpen(false); } });
  const updateMutation = trpc.news.update.useMutation({ onSuccess: () => { utils.news.list.invalidate(); toast.success("Article updated"); setOpen(false); } });
  const deleteMutation = trpc.news.delete.useMutation({ onSuccess: () => { utils.news.list.invalidate(); toast.success("Article deleted"); } });
  const toggleMutation = trpc.news.toggleStatus.useMutation({ onSuccess: () => { utils.news.list.invalidate(); toast.success("Status updated"); } });
  const bulkDeleteMutation = trpc.news.bulkDelete.useMutation({
    onSuccess: () => {
      utils.news.list.invalidate();
      toast.success("Selected articles deleted");
      setSelectedIds([]);
    },
  });
  const bulkStatusMutation = trpc.news.bulkStatus.useMutation({
    onSuccess: (_data, vars) => {
      utils.news.list.invalidate();
      toast.success(`Selected articles updated: ${vars.status}`);
      setSelectedIds([]);
    },
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [initialForm, setInitialForm] = useState<NewsForm>(emptyForm);
  const [lang, setLang] = useState<Lang>("ru");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "scheduled">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setInitialForm(emptyForm); setLang("ru"); setOpen(true); };
  const openEdit = (item: any) => {
    const next: NewsForm = {
      title: item.title ?? "", titleUz: item.titleUz ?? "", titleEn: item.titleEn ?? "",
      slug: item.slug ?? "",
      content: item.content ?? "", contentUz: item.contentUz ?? "", contentEn: item.contentEn ?? "",
      excerpt: item.excerpt ?? "", excerptUz: item.excerptUz ?? "", excerptEn: item.excerptEn ?? "",
      coverImageUrl: item.coverImageUrl ?? "", category: item.category ?? "",
      tags: item.tags ?? "", status: item.status,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 16) : "",
    };
    setEditId(item.id);
    setForm(next);
    setInitialForm(next);
    setLang("ru");
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.slug) { toast.error("Russian title and slug are required"); return; }
    if (form.status === "scheduled" && !form.publishedAt) {
      toast.error("Select publication date and time for scheduled article");
      return;
    }

    const payload = {
      ...form,
      publishedAt: form.publishedAt ? new Date(form.publishedAt) : undefined,
    };

    if (editId) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const dirty = open && JSON.stringify(form) !== JSON.stringify(initialForm);
  const categories = useMemo(() => {
    if (!newsList) return [];
    return Array.from(new Set(newsList.map((n) => n.category).filter(Boolean))) as string[];
  }, [newsList]);

  const filteredNews = useMemo(() => {
    if (!newsList) return [];
    return newsList.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.category ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [newsList, search, statusFilter, categoryFilter]);
  const allFilteredSelected = filteredNews.length > 0 && filteredNews.every((item) => selectedIds.includes(item.id));
  const isBulkPending = bulkDeleteMutation.isPending || bulkStatusMutation.isPending;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredNews.some((item) => item.id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const set = new Set(prev);
      filteredNews.forEach((item) => set.add(item.id));
      return Array.from(set);
    });
  };

  // Determine which langs have content filled
  const filled = {
    ru: !!(form.title),
    uz: !!(form.titleUz),
    en: !!(form.titleEn),
  };

  // Field helpers per lang
  const titleField = lang === "ru" ? "title" : lang === "uz" ? "titleUz" : "titleEn";
  const excerptField = lang === "ru" ? "excerpt" : lang === "uz" ? "excerptUz" : "excerptEn";
  const contentField = lang === "ru" ? "content" : lang === "uz" ? "contentUz" : "contentEn";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News & Press Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage articles and press releases</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Article
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-1">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, slug, category..."
              className="pl-9 bg-input border-border text-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All categories</SelectItem>
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
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "published" })}
            >
              Publish selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "draft" })}
            >
              Move to draft
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isBulkPending}
              onClick={() => {
                if (!confirm(`Delete ${selectedIds.length} selected article(s)?`)) return;
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
            <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : filteredNews.length > 0 ? (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[34px_1fr_100px_100px_100px_80px] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                <span className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="accent-primary"
                    aria-label="Select all filtered"
                  />
                </span>
                <span>Article</span>
                <span>Category</span>
                <span>Status</span>
                <span>Published</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredNews.map((item) => (
                <div key={item.id} className="grid grid-cols-[34px_1fr_100px_100px_100px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="accent-primary"
                      aria-label={`Select article ${item.title}`}
                    />
                  </div>
                  <div className="min-w-0 flex items-center gap-3">
                    {item.coverImageUrl ? (
                      <img src={item.coverImageUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0 border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                        <Newspaper className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                        <span>/{item.slug}</span>
                        {item.titleUz && <span className="text-green-500/70">🇺🇿</span>}
                        {item.titleEn && <span className="text-blue-500/70">🇬🇧</span>}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.category ?? "—"}</p>
                  <Badge variant="outline" className={statusColors[item.status] ?? ""}>{item.status}</Badge>
                  <p className="text-xs text-muted-foreground">
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "—"}
                  </p>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={() => openEdit(item)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleMutation.mutate({ id: item.id, status: item.status === "published" ? "draft" : "published" })}
                          className="cursor-pointer"
                        >
                          {item.status === "published" ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                          {item.status === "published" ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteMutation.mutate({ id: item.id })} className="cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Newspaper className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {newsList && newsList.length > 0 ? "No articles match current filters" : "No articles yet"}
              </p>
              {newsList && newsList.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }}
                  className="mt-4 gap-2"
                >
                  Reset filters
                </Button>
              ) : (
                <Button variant="outline" onClick={openCreate} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Write first article
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editId ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Slug (shared across all languages) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-foreground text-sm">Slug * <span className="text-muted-foreground font-normal">(shared)</span></Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="article-slug"
                  className="bg-input border-border text-foreground font-mono text-sm"
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="text-foreground text-sm">Cover Image URL <span className="text-muted-foreground font-normal">(shared)</span></Label>
                <Input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://cdn.../cover.jpg" className="bg-input border-border text-foreground" />
              </div>
            </div>
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="Cover preview" className="h-24 w-full object-cover rounded border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}

            {/* Language tabs */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Multilingual content — select language to edit</p>
              <LangTabs lang={lang} setLang={setLang} filled={filled} />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">
                    Title {lang === "ru" && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    value={form[titleField]}
                    onChange={(e) => {
                      const update: Partial<NewsForm> = { [titleField]: e.target.value };
                      if (lang === "ru" && !editId) update.slug = slugify(e.target.value);
                      setForm({ ...form, ...update });
                    }}
                    placeholder={lang === "ru" ? "Заголовок статьи" : lang === "uz" ? "Maqola sarlavhasi" : "Article title"}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Excerpt</Label>
                  <Textarea
                    value={form[excerptField]}
                    onChange={(e) => setForm({ ...form, [excerptField]: e.target.value })}
                    placeholder={lang === "ru" ? "Краткое описание статьи" : lang === "uz" ? "Maqolaning qisqacha tavsifi" : "Short summary of the article"}
                    rows={2}
                    className="bg-input border-border text-foreground resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Content</Label>
                  <RichTextEditor
                    key={`${editId}-${lang}`}
                    value={form[contentField]}
                    onChange={(value) => setForm({ ...form, [contentField]: value })}
                    placeholder={lang === "ru" ? "Начните писать текст статьи..." : lang === "uz" ? "Maqola matnini yozing..." : "Start writing article content..."}
                  />
                </div>
              </div>
            </div>

            {/* Shared meta fields */}
            <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Category <span className="text-muted-foreground font-normal">(shared)</span></Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Insurance News" className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Tags <span className="text-muted-foreground font-normal">(comma separated)</span></Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="insurance, news, update" className="bg-input border-border text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.status === "scheduled" && (
              <div className="space-y-2">
                <Label className="text-foreground text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Publication date & time
                </Label>
                <Input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Article will be published at selected time.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-border">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>{isPending ? "Saving..." : editId ? "Save Changes" : "Create Article"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnsavedChangesBadge visible={dirty} onSave={handleSubmit} isSaving={isPending} />
    </div>
  );
}
