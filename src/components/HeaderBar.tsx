"use client";

import React from "react";
import Link from "next/link";
import { BubbleText } from "@/components/ui/bubble-text";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HeaderBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "mb-4 rounded-xl border border-foreground/10 bg-background/60 backdrop-blur",
        "relative p-2 pl-3 pr-3",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:border before:border-cyan-400/25 before:[filter:drop-shadow(0_0_6px_rgba(34,211,238,.25))]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:border after:border-pink-500/15 after:translate-x-[3px] after:translate-y-[3px]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Link href="/control" className="block">
          <div className="font-heading tracking-[0.12em] uppercase text-sm md:text-lg font-extrabold">
            <BubbleTextWrapper> DUST-ROSE | TERMINAL V3 </BubbleTextWrapper>
          </div>
        </Link>
        <StatusStrip pathname={pathname} />
      </div>
    </div>
  );
}

function BubbleTextWrapper({ children }: { children: React.ReactNode }) {
  // Keep app font; just reuse bubble animation effect per character
  // by temporarily overriding the text inside BubbleText component
  return (
    <div className="leading-none">
      <BubbleTextRender text={(children as string).trim()} />
    </div>
  );
}

function BubbleTextRender({ text }: { text: string }) {
  // Auto-cycling bold effect: one letter bold at a time
  const [activeIndex, setActiveIndex] = React.useState(0);
  const chars = React.useMemo(() => text.split(""), [text]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % chars.length);
    }, 180);
    return () => clearInterval(id);
  }, [chars.length]);

  return (
    <h2 className="cursor-default">
      {chars.map((char, idx) => {
        let classes = "transition-all duration-300 ease-in-out inline-block";
        if (idx === activeIndex) {
          classes += " font-extrabold text-foreground";
        } else {
          classes += " font-medium text-foreground/70";
        }
        return (
          <span key={idx} className={classes}>
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </h2>
  );
}

function StatusStrip({ pathname }: { pathname: string | null }) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = `${2077}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  return (
    <div className="flex items-center gap-4 text-[10px] md:text-xs opacity-80">
      <span>TIME: {time} / {date}</span>
      <span>| EMP INT: <span className="text-primary">98%</span></span>
      <span>| DUST LVL: <span className="emergency-blink font-extrabold text-white bg-red-700/30 text-[9px] md:text-[10px] px-1 py-0 rounded ring-1 ring-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]">CLASS III (WARNING)</span></span>
      <style jsx>{`
        @keyframes emergencyBlink {
          0%, 100% {
            color: #ffffff;
            background-color: rgba(239, 68, 68, 0.35);
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.9), 0 0 24px rgba(239, 68, 68, 0.45);
          }
          50% {
            color: #ffefef;
            background-color: rgba(239, 68, 68, 0.1);
            box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
          }
        }
        .emergency-blink {
          animation: emergencyBlink 0.9s steps(2, jump-start) infinite;
        }
      `}</style>
    </div>
  );
}

