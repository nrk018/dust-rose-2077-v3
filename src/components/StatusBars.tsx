"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

function severityColor(value: number): string {
  if (value >= 70) return "#16a34a"; // green
  if (value >= 50) return "#ca8a04"; // yellow
  if (value >= 30) return "#f97316"; // orange
  return "#ef4444"; // red
}

export default function StatusBars({
  stats,
  className,
}: {
  stats: { label: string; value: number; icon?: React.ComponentType<any> }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-foreground/80">
            <div className="flex items-center gap-2">
              {Icon ? <Icon className="h-3.5 w-3.5"/> : null}
              <span>{label}</span>
            </div>
            <span>{value}%</span>
          </div>
          <AnimatedBar value={value} />
        </div>
      ))}
    </div>
  );
}

function AnimatedBar({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const lastRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = lastRef.current;
    const to = value;
    const duration = 900; // ms, smooth
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = ease(p);
      const v = from + (to - from) * eased;
      setDisplayValue(v);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        lastRef.current = to;
        rafRef.current = null;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  const color = severityColor(displayValue);

  return (
    <div className="relative h-2 w-full overflow-hidden rounded bg-foreground/10">
      <div
        className="h-full will-change-[width]"
        style={{ width: `${displayValue}%`, backgroundColor: color, transition: "background-color 300ms linear" }}
      />
      {/* subtle sheen */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-white/10 blur-[2px] -skew-x-12 animate-[sheen_2.4s_ease-in-out_infinite]" />
      </div>
      <style jsx>{`
        @keyframes sheen {
          0% { transform: translateX(-120%); }
          60% { transform: translateX(180%); }
          100% { transform: translateX(180%); }
        }
      `}</style>
    </div>
  );
}


