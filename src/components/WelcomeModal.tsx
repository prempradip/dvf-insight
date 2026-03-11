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
  },
  {
    icon: DollarSign,
    title: "Financial Model",
    description:
      "Add investment amounts and projected cash flows for each feature. The tool calculates NPV and payback period so you can weigh qualitative scores against hard financial returns.",
  },
  {
    icon: Layout,
    title: "Portfolio View",
    description:
      "See everything together — a ranked table, radar chart comparing DVF dimensions, and a bubble chart plotting score vs NPV. Use it to make confident prioritisation decisions.",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {current.description}
          </DialogDescription>
        </DialogHeader>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 py-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={dismiss}>
            Skip
          </Button>
          <Button
            size="sm"
            onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
          >
            {isLast ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
