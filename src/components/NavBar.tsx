"use client";

import React from "react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Activity, Layers, CalendarRange, Radio as RadioIcon } from "lucide-react";
import Link from "next/link";

export default function NavBar() {
  const tabs = [
    { title: "Control", icon: Activity },
    { type: "separator" as const },
    { title: "Resources", icon: Layers },
    { type: "separator" as const },
    { title: "Tournament", icon: CalendarRange },
    { type: "separator" as const },
    { title: "Comms", icon: RadioIcon },
  ];

  const routes = ["/control", "/resources", "/tournament", "/comms"];
  const lastClickedRef = React.useRef<number | null>(null);

  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <ExpandableTabs
          tabs={tabs}
          activeColor="text-primary"
          onChange={(i) => {
            if (i === null) return;
            // First click expands; second click navigates
            if (lastClickedRef.current === i) {
              const idx = i - Math.floor((i + 1) / 2);
              const href = routes[idx] ?? routes[0];
              window.location.assign(href);
            } else {
              lastClickedRef.current = i;
              // Reset if user clicks elsewhere after a short delay
              window.setTimeout(() => {
                if (lastClickedRef.current === i) lastClickedRef.current = null;
              }, 1200);
            }
          }}
        />
      </div>
      <Link href="/control" className="hidden md:inline text-xs opacity-70 hover:opacity-100">DR-2077</Link>
    </div>
  );
}


