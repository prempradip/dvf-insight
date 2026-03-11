import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = ["Navigation", "Actions", "Help"] as const;

export default function KeyboardShortcutsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Quick keys — no modifier needed.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {sections.map((section) => {
            const items = SHORTCUTS.filter((s) => s.section === section);
            if (!items.length) return null;
            return (
              <div key={section}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {section}
                </h4>
                <div className="space-y-1.5">
                  {items.map((s) => (
                    <div key={s.keys} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{s.label}</span>
                      <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border border-border bg-muted text-xs font-mono font-medium text-muted-foreground">
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
