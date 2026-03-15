import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign, Layout } from "lucide-react";

const WELCOME_KEY = "dvf-welcome-seen";

const steps = [
  {
    icon: BarChart3,
    title: "DVF Scoring",
    description:
      "Rate each feature across Desirability, Viability, and Feasibility dimensions. Each dimension has seven sub-criteria scored 1–12, giving you a balanced, comparable score for every idea.",
    gradient: "from-primary to-[hsl(220,80%,62%)]",
  },
  {
    icon: DollarSign,
    title: "Financial Model",
    description:
      "Add investment amounts and projected cash flows for each feature. The tool calculates NPV and payback period so you can weigh qualitative scores against hard financial returns.",
    gradient: "from-accent to-[hsl(160,70%,55%)]",
  },
  {
    icon: Layout,
    title: "Portfolio View",
    description:
      "See everything together — a ranked table, radar chart comparing DVF dimensions, and a bubble chart plotting score vs NPV. Use it to make confident prioritisation decisions.",
    gradient: "from-feasibility to-[hsl(280,70%,65%)]",
  },
];

export default function WelcomeModal() {
  const [open, setOpen] = useState(() => !localStorage.getItem(WELCOME_KEY));
  const [step, setStep] = useState(0);

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, "true");
    setOpen(false);
  };

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="sm:max-w-md glass-card-elevated border-border/40 overflow-hidden">
        {/* Decorative gradient blur */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${current.gradient} opacity-20 blur-3xl pointer-events-none transition-all duration-500`} />
        
        <DialogHeader className="items-center text-center relative">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${current.gradient} shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-lg font-display font-bold">{current.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground/80">
            {current.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step dots */}
        <div className="flex justify-center gap-2 py-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={dismiss} className="text-muted-foreground">
            Skip
          </Button>
          <Button
            size="sm"
            onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
            className="font-medium px-6"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {isLast ? "Get Started" : "Next →"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
