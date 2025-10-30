"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Activity, Layers, CalendarRange, Radio as RadioIcon } from "lucide-react";

export default function SubNav() {
  const router = useRouter();
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

  return (
    <div className="mb-4 rounded-xl border border-foreground/10 bg-background/70 p-2 backdrop-blur">
      <ExpandableTabs
        tabs={tabs}
        activeColor="text-primary"
        onChange={(i) => {
          if (i === null) return;
          const idx = i - Math.floor((i + 1) / 2);
          router.push(routes[idx] ?? routes[0]);
        }}
      />
    </div>
  );
}
