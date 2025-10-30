"use client";

export default function DamageHighlight({ label = "RIGHT SHOULDER DAMAGED", active = true }: { label?: string; active?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-4 right-6 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.35)] transition-opacity duration-500 ${active ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
      aria-hidden={!active}
    >
      {label}
    </div>
  );
}


