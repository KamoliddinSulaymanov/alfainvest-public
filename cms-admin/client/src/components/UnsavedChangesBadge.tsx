import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  visible: boolean;
  onSave: () => void;
  isSaving?: boolean;
  label?: string;
}

export function UnsavedChangesBadge({ visible, onSave, isSaving, label = "You have unsaved changes" }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-3 bg-card border border-primary/30 rounded-xl px-4 py-3 shadow-2xl">
        <Settings className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: "3s" }} />
        <span className="text-sm text-foreground">{label}</span>
        <Button size="sm" onClick={onSave} disabled={isSaving} className="gap-1.5 h-7">
          <Save className="h-3 w-3" /> {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
