"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type PanelProps = React.ComponentProps<typeof Card> & {
  title?: string;
  header?: React.ReactNode;
};

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <Card
      {...props}
      className={cn(
        "relative border border-foreground/10 bg-background/60 backdrop-blur",
        "[background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.02)_0_1px,transparent_1px_3px)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-lg before:border before:border-cyan-400/25 before:[filter:drop-shadow(0_0_6px_rgba(34,211,238,.25))]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:border after:border-pink-500/15 after:translate-x-[3px] after:translate-y-[3px]",
        "shadow-[inset_0_0_0_1px_rgba(0,0,0,.25),inset_0_-8px_12px_rgba(0,0,0,.25)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg opacity-50 mix-blend-multiply",
          "[background-image:radial-gradient(600px_200px_at_10%_0%,rgba(120,50,20,.18),transparent_60%),radial-gradient(400px_160px_at_90%_100%,rgba(80,35,18,.18),transparent_60%),conic-gradient(from_180deg_at_20%_10%,rgba(0,0,0,.18)_0_10deg,transparent_10deg_360deg)]"
        )}
      />
      {children}
    </Card>
  );
}

export function HUDBar({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={cn("min-w-[160px] rounded border border-foreground/20 bg-background/70 p-2", className)}>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest opacity-80">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-foreground/10">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}


