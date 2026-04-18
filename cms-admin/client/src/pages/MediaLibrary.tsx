import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Upload, Trash2, Copy, Image, FileText, Search, X, ExternalLink } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string | null | undefined) {
  return mimeType?.startsWith("image/");
}

export default function MediaLibrary() {
  const utils = trpc.useUtils();
  const { data: mediaList, isLoading } = trpc.media.list.useQuery();
  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: () => { utils.media.list.invalidate(); toast.success("File uploaded successfully"); setUploading(false); },
    onError: (e) => { toast.error("Upload failed: " + e.message); setUploading(false); },
  });
  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => { utils.media.list.invalidate(); toast.success("File deleted"); setPreview(null); },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  const filtered = mediaList?.filter((m) =>
    !search || m.originalName?.toLowerCase().includes(search.toLowerCase()) || m.mimeType?.toLowerCase().includes(search.toLowerCase())
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0]!;
    if (file.size > MAX_FILE_SIZE) { toast.error("File too large. Max 10MB allowed."); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]!;
      uploadMutation.mutate({
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        base64,
      });
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error("Failed to read the selected file");
    };
    reader.onabort = () => {
      setUploading(false);
      toast.error("File upload was cancelled");
    };
    reader.readAsDataURL(file);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success("CDN URL copied to clipboard"))
      .catch(() => toast.error("Failed to copy CDN URL"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and manage images, PDFs, and documents</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/20"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`h-8 w-8 mx-auto mb-3 ${dragOver ? "text-primary" : "text-muted-foreground/50"}`} />
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">Images, PDFs, Word documents — max 10MB</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          className="pl-9 bg-input border-border text-foreground"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Stats */}
      {mediaList && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{mediaList.length} total files</span>
          <span>·</span>
          <span>{mediaList.filter(m => isImage(m.mimeType)).length} images</span>
          <span>·</span>
          <span>{mediaList.filter(m => m.mimeType === "application/pdf").length} PDFs</span>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative bg-card border border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/40 transition-all"
              onClick={() => setPreview(item)}
            >
              <div className="aspect-square flex items-center justify-center bg-muted/30">
                {isImage(item.mimeType) ? (
                  <img src={item.url} alt={item.originalName ?? ""} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase">{item.mimeType?.split("/")[1] ?? "file"}</span>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-foreground truncate">{item.originalName}</p>
                <p className="text-[10px] text-muted-foreground">{item.size ? formatBytes(item.size) : "—"}</p>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Copy CDN URL"
                >
                  <Copy className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: item.id }); }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <Image className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">{search ? "No files match your search" : "No files uploaded yet"}</p>
        </div>
      )}

      {/* Preview Dialog */}
      {preview && (
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground truncate">{preview.originalName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isImage(preview.mimeType) ? (
                <img src={preview.url} alt={preview.originalName} className="w-full max-h-80 object-contain rounded-lg border border-border" />
              ) : (
                <div className="flex items-center justify-center h-40 bg-muted/30 rounded-lg border border-border">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground uppercase">{preview.mimeType?.split("/")[1] ?? "file"}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">File Name</p>
                  <p className="text-foreground truncate">{preview.originalName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Size</p>
                  <p className="text-foreground">{preview.size ? formatBytes(preview.size) : "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                  <p className="text-foreground">{preview.mimeType ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Uploaded</p>
                  <p className="text-foreground">{new Date(preview.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">CDN URL</p>
                <div className="flex gap-2">
                  <Input value={preview.url} readOnly className="bg-input border-border text-foreground text-xs font-mono" />
                  <Button variant="outline" size="icon" onClick={() => copyUrl(preview.url)} className="shrink-0 border-border">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => window.open(preview.url, "_blank")} className="shrink-0 border-border">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="destructive" onClick={() => deleteMutation.mutate({ id: preview.id })} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Delete File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
