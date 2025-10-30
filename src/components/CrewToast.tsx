"use client";

import type { ReactNode } from "react";

export default function CrewToast({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-[360px] max-w-[90vw] rounded-xl border border-white/10 bg-white/5 p-4 text-foreground shadow-[0_0_0_1px_rgba(255,255,255,.06),0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-md overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "conic-gradient(from var(--angle), rgba(211,106,40,.35), rgba(0,0,0,0) 20%, rgba(34,211,238,.25) 40%, rgba(0,0,0,0) 60%, rgba(211,106,40,.35) 80%, rgba(0,0,0,0))",
          animation: "crewGradient 8s linear infinite",
        }}
      />
      <div className="relative space-y-1">
        <p className="neon text-xs/relaxed opacity-0 animate-[fadeIn_.6s_ease_forwards]">[Ops] Crew Radio</p>
        <p className="neon text-sm font-medium opacity-0 animate-[fadeIn_.6s_.12s_ease_forwards]">{children}</p>
      </div>
      <style jsx>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes crewGradient { to { --angle: 360deg; } }
        @keyframes fadeIn { to { opacity: 1; } }
        .neon { color: #000; text-shadow: 0 0 6px rgba(211,106,40,.85), 0 0 12px rgba(211,106,40,.55), 0 0 18px rgba(211,106,40,.35); font-family: inherit; }
      `}</style>
    </div>
  );
}


