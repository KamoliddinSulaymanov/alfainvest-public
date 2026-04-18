import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, FileText, Search } from "lucide-react";
import LangTabs, { type Lang } from "@/components/LangTabs";
import { UnsavedChangesBadge } from "@/components/UnsavedChangesBadge";

type PageForm = {
  title: string;
  titleUz: string;
  titleEn: string;
  slug: string;
  content: string;
  contentUz: string;
  contentEn: string;
  metaTitle: string;
  metaTitleUz: string;
  metaTitleEn: string;
  metaDescription: string;
  metaDescriptionUz: string;
  metaDescriptionEn: string;
  status: "draft" | "published";
};

const emptyForm: PageForm = {
  title: "", titleUz: "", titleEn: "",
  slug: "",
  content: "", contentUz: "", contentEn: "",
  metaTitle: "", metaTitleUz: "", metaTitleEn: "",
  metaDescription: "", metaDescriptionUz: "", metaDescriptionEn: "",
  status: "draft",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function PagesManager() {
  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.pages.list.useQuery();
  const createMutation = trpc.pages.create.useMutation({ onSuccess: () => { utils.pages.list.invalidate(); toast.success("Page created"); setOpen(false); } });
  const updateMutation = trpc.pages.update.useMutation({ onSuccess: () => { utils.pages.list.invalidate(); toast.success("Page updated"); setOpen(false); } });
  const deleteMutation = trpc.pages.delete.useMutation({ onSuccess: () => { utils.pages.list.invalidate(); toast.success("Page deleted"); } });
  const toggleMutation = trpc.pages.toggleStatus.useMutation({ onSuccess: () => { utils.pages.list.invalidate(); toast.success("Status updated"); } });
  const bulkDeleteMutation = trpc.pages.bulkDelete.useMutation({
    onSuccess: () => {
      utils.pages.list.invalidate();
      toast.success("Selected pages deleted");
      setSelectedIds([]);
    },
  });
  const bulkStatusMutation = trpc.pages.bulkStatus.useMutation({
    onSuccess: (_data, vars) => {
      utils.pages.list.invalidate();
      toast.success(`Selected pages updated: ${vars.status}`);
      setSelectedIds([]);
    },
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PageForm>(emptyForm);
  const [initialForm, setInitialForm] = useState<PageForm>(emptyForm);
  const [lang, setLang] = useState<Lang>("ru");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setInitialForm(emptyForm); setLang("ru"); setOpen(true); };
  const openEdit = (page: any) => {
    const next: PageForm = {
      title: page.title ?? "", titleUz: page.titleUz ?? "", titleEn: page.titleEn ?? "",
      slug: page.slug ?? "",
      content: page.content ?? "", contentUz: page.contentUz ?? "", contentEn: page.contentEn ?? "",
      metaTitle: page.metaTitle ?? "", metaTitleUz: page.metaTitleUz ?? "", metaTitleEn: page.metaTitleEn ?? "",
      metaDescription: page.metaDescription ?? "", metaDescriptionUz: page.metaDescriptionUz ?? "", metaDescriptionEn: page.metaDescriptionEn ?? "",
      status: page.status,
    };
    setEditId(page.id);
    setForm(next);
    setInitialForm(next);
    setLang("ru");
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title || !form.slug) { toast.error("Title and slug are required"); return; }
    if (editId) updateMutation.mutate({ id: editId, ...form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const dirty = open && JSON.stringify(form) !== JSON.stringify(initialForm);
  const filteredPages = useMemo(() => {
    if (!pages) return [];
    const q = search.trim().toLowerCase();
    return pages.filter((page) => {
      const matchesSearch =
        !q ||
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q) ||
        (page.metaTitle ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || page.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pages, search, statusFilter]);
  const allFilteredSelected = filteredPages.length > 0 && filteredPages.every((p) => selectedIds.includes(p.id));
  const isBulkPending = bulkDeleteMutation.isPending || bulkStatusMutation.isPending;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredPages.some((p) => p.id === id)));
      return;
    }
    setSelectedIds((prev) => {
      const set = new Set(prev);
      filteredPages.forEach((p) => set.add(p.id));
      return Array.from(set);
    });
  };

  const titleField = lang === "uz" ? "titleUz" : lang === "en" ? "titleEn" : "title";
  const contentField = lang === "uz" ? "contentUz" : lang === "en" ? "contentEn" : "content";
  const metaTitleField = lang === "uz" ? "metaTitleUz" : lang === "en" ? "metaTitleEn" : "metaTitle";
  const metaDescriptionField = lang === "uz" ? "metaDescriptionUz" : lang === "en" ? "metaDescriptionEn" : "metaDescription";
  const filled = { ru: !!form.title, uz: !!form.titleUz, en: !!form.titleEn };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage static pages of the website</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Page
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, slug, meta title..."
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
                if (!confirm(`Delete ${selectedIds.length} selected page(s)?`)) return;
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
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredPages.length > 0 ? (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[34px_1fr_140px_120px_80px] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                <span className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="accent-primary"
                    aria-label="Select all filtered"
                  />
                </span>
                <span>Title / Slug</span>
                <span>Meta Title</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredPages.map((page) => (
                <div key={page.id} className="grid grid-cols-[34px_1fr_140px_120px_80px] gap-4 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(page.id)}
                      onChange={() => toggleSelect(page.id)}
                      className="accent-primary"
                      aria-label={`Select page ${page.title}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{page.title}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                      <span>/{page.slug}</span>
                      {page.titleUz && <span className="text-green-500/70">🇺🇿</span>}
                      {page.titleEn && <span className="text-blue-500/70">🇬🇧</span>}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{page.metaTitle ?? "—"}</p>
                  <div>
                    <Badge variant="outline" className={page.status === "published" ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"}>
                      {page.status}
                    </Badge>
                  </div>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={() => openEdit(page)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleMutation.mutate({ id: page.id, status: page.status === "published" ? "draft" : "published" })}
                          className="cursor-pointer"
                        >
                          {page.status === "published" ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                          {page.status === "published" ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteMutation.mutate({ id: page.id })} className="cursor-pointer text-destructive focus:text-destructive">
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
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {pages && pages.length > 0 ? "No pages match current filters" : "No pages yet"}
              </p>
              {pages && pages.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => { setSearch(""); setStatusFilter("all"); }}
                  className="mt-4 gap-2"
                >
                  Reset filters
                </Button>
              ) : (
                <Button variant="outline" onClick={openCreate} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" /> Create first page
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editId ? "Edit Page" : "Create New Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: editId ? form.slug : slugify(e.target.value) })}
                  placeholder="Page title"
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  placeholder="page-slug"
                  className="bg-input border-border text-foreground font-mono text-sm"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Multilingual content
              </p>
              <LangTabs lang={lang} setLang={setLang} filled={filled} />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-sm">
                Title {lang === "ru" && <span className="text-destructive">*</span>}
              </Label>
              <Input
                value={form[titleField]}
                onChange={(e) => {
                  const update: Partial<PageForm> = { [titleField]: e.target.value };
                  if (lang === "ru" && !editId) update.slug = slugify(e.target.value);
                  setForm({ ...form, ...update });
                }}
                placeholder={lang === "ru" ? "Page title" : lang === "uz" ? "Sahifa sarlavhasi" : "Page title"}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-sm">Content</Label>
              <RichTextEditor
                key={`${editId}-${lang}`}
                value={form[contentField]}
                onChange={(value) => setForm({ ...form, [contentField]: value })}
                placeholder="Start writing page content..."
              />
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SEO Settings</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Meta Title</Label>
                  <Input
                    value={form[metaTitleField]}
                    onChange={(e) => setForm({ ...form, [metaTitleField]: e.target.value })}
                    placeholder="SEO title (60 chars recommended)"
                    className="bg-input border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">{form[metaTitleField].length}/60 characters</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Meta Description</Label>
                  <Textarea
                    value={form[metaDescriptionField]}
                    onChange={(e) => setForm({ ...form, [metaDescriptionField]: e.target.value })}
                    placeholder="SEO description (160 chars recommended)"
                    rows={3}
                    className="bg-input border-border text-foreground resize-none"
                  />
                  <p className="text-xs text-muted-foreground">{form[metaDescriptionField].length}/160 characters</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-border">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Saving..." : editId ? "Save Changes" : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnsavedChangesBadge visible={dirty} onSave={handleSubmit} isSaving={isPending} />
    </div>
  );
}
