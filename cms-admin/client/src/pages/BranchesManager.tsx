import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, MapPin, Phone, Clock } from "lucide-react";
import MapPicker from "@/components/MapPicker";
import AddressSuggest from "@/components/AddressSuggest";
import { UnsavedChangesBadge } from "@/components/UnsavedChangesBadge";

type BranchForm = {
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  lat: string;
  lng: string;
};

const emptyForm: BranchForm = { name: "", address: "", phone: "", workingHours: "", lat: "", lng: "" };

export default function BranchesManager() {
  const utils = trpc.useUtils();
  const { data: branches, isLoading } = trpc.branches.list.useQuery();
  const createMutation = trpc.branches.create.useMutation({ onSuccess: () => { utils.branches.list.invalidate(); toast.success("Branch created"); setOpen(false); } });
  const updateMutation = trpc.branches.update.useMutation({ onSuccess: () => { utils.branches.list.invalidate(); toast.success("Branch updated"); setOpen(false); } });
  const deleteMutation = trpc.branches.delete.useMutation({ onSuccess: () => { utils.branches.list.invalidate(); toast.success("Branch deleted"); } });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [initialForm, setInitialForm] = useState<BranchForm>(emptyForm);
  const dirty = open && JSON.stringify(form) !== JSON.stringify(initialForm);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setInitialForm(emptyForm); setOpen(true); };
  const openEdit = (b: any) => {
    const next = { name: b.name, address: b.address ?? "", phone: b.phone ?? "", workingHours: b.workingHours ?? "", lat: b.lat?.toString() ?? "", lng: b.lng?.toString() ?? "" };
    setEditId(b.id);
    setForm(next);
    setInitialForm(next);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.address) { toast.error("Name and address are required"); return; }
    const payload = { ...form, lat: form.lat ? parseFloat(form.lat) : undefined, lng: form.lng ? parseFloat(form.lng) : undefined };
    if (editId) updateMutation.mutate({ id: editId, ...payload });
    else createMutation.mutate(payload);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branch / Office</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage branch locations and contact information</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Branch
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : branches && branches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card key={branch.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm truncate">{branch.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem onClick={() => openEdit(branch)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteMutation.mutate({ id: branch.id })} className="cursor-pointer text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  {branch.address && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {branch.workingHours && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                      <span>{branch.workingHours}</span>
                    </div>
                  )}
                  {branch.lat && branch.lng && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-mono">
                      <span>{Number(branch.lat).toFixed(4)}, {Number(branch.lng).toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <MapPin className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No branches added yet</p>
          <Button variant="outline" onClick={openCreate} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Add first branch
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editId ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Branch Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tashkent Main Office" className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Address *</Label>
              <AddressSuggest
                value={form.address}
                onChange={(addr) => setForm((prev) => ({ ...prev, address: addr }))}
                onSelect={(addr, lat, lng) => setForm((prev) => ({ ...prev, address: addr, lat, lng }))}
                placeholder="Начните вводить адрес…"
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">Выберите из списка — координаты и метка на карте заполнятся автоматически</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 71 123 45 67" className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Working Hours</Label>
                <Input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="Mon-Fri 9:00-18:00" className="bg-input border-border text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Location on map</Label>
              <p className="text-xs text-muted-foreground -mt-1">Click on the map or drag the marker — the address will be filled in automatically</p>
              {open && (
                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onCoordsChange={(newLat, newLng, address) =>
                    setForm((prev) => ({
                      ...prev,
                      lat: newLat,
                      lng: newLng,
                      address: address !== undefined ? address : prev.address,
                    }))
                  }
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Latitude</Label>
                <Input value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="41.2995" type="number" step="any" className="bg-input border-border text-foreground font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Longitude</Label>
                <Input value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="69.2401" type="number" step="any" className="bg-input border-border text-foreground font-mono" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-border">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>{isPending ? "Saving..." : editId ? "Save Changes" : "Add Branch"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnsavedChangesBadge visible={dirty} onSave={handleSubmit} isSaving={isPending} />
    </div>
  );
}
