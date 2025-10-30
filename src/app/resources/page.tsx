"use client";

import React, { useMemo, useState } from "react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Shield, Wrench, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import RobotViewer from "@/components/RobotViewer";
import { useResources } from "@/lib/resources-store";

type Part = {
  id: string;
  name: string;
  type: "weapon" | "armor" | "core" | "ammo";
  durability: number; // 0–100
  weight: number; // arbitrary
  rarity: "common" | "rare" | "epic" | "legendary";
  compatible: boolean;
};

const demoParts: Part[] = [
  { id: "1", name: "MK-AX300 Servo Arm", type: "armor", durability: 62, weight: 23, rarity: "rare", compatible: true },
  { id: "2", name: "VX-9 Rail Cannon", type: "weapon", durability: 28, weight: 41, rarity: "epic", compatible: false },
  { id: "3", name: "Core Stabilizer v2", type: "core", durability: 84, weight: 12, rarity: "common", compatible: true },
  { id: "4", name: "HE Ammo Pack", type: "ammo", durability: 95, weight: 9, rarity: "legendary", compatible: true },
  { id: "5", name: "MK-AX200 Servo Arm", type: "armor", durability: 18, weight: 27, rarity: "common", compatible: false },
];

export default function ResourcesPage() {
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  const tabs = [
    { title: "Inventory", icon: Shield },
    { type: "separator" as const },
    { title: "Upgrades", icon: Wrench },
    { type: "separator" as const },
    { title: "Black Market", icon: Skull },
  ];

  return (
    <main className="space-y-4">
      <div className="flex justify-center">
        <ExpandableTabs
          tabs={tabs}
          activeColor="text-primary"
          onChange={(i) => {
            if (i === null) return;
            const idx = i - Math.floor((i + 1) / 2);
            setTab((Math.max(0, Math.min(2, idx)) as 0 | 1 | 2));
          }}
        />
      </div>

      {tab === 0 && <InventoryTab />}
      {tab === 1 && <UpgradesTab />}
      {tab === 2 && <BlackMarketTab />}

      <FooterInfoBar />
    </main>
  );
}

function InventoryTab() {
  const [category, setCategory] = useState<"all" | Part["type"]>("all");
  const [sort, setSort] = useState<"durability" | "weight" | "rarity">("durability");
  const [compatibleOnly, setCompatibleOnly] = useState(false);

  const parts = useMemo(() => {
    let items = demoParts.slice();
    if (category !== "all") items = items.filter((p) => p.type === category);
    if (compatibleOnly) items = items.filter((p) => p.compatible);
    items.sort((a, b) => {
      if (sort === "durability") return b.durability - a.durability;
      if (sort === "weight") return a.weight - b.weight;
      const rank = { common: 0, rare: 1, epic: 2, legendary: 3 } as const;
      return rank[b.rarity] - rank[a.rarity];
    });
    return items;
  }, [category, compatibleOnly, sort]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <aside className="md:col-span-3 lg:col-span-3 space-y-3 rounded-xl border bg-background/70 p-3">
        <h3 className="text-xs font-semibold tracking-wider">Filters</h3>
        <div className="space-y-1">
          <label className="text-[11px] opacity-80">Category</label>
          <select value={category} onChange={(e)=>setCategory(e.target.value as any)} className="w-full rounded bg-background border px-2 py-1 text-xs">
            <option value="all">All</option>
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
            <option value="core">Core</option>
            <option value="ammo">Ammo</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] opacity-80">Sort</label>
          <select value={sort} onChange={(e)=>setSort(e.target.value as any)} className="w-full rounded bg-background border px-2 py-1 text-xs">
            <option value="durability">Durability</option>
            <option value="weight">Weight</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={compatibleOnly} onChange={(e)=>setCompatibleOnly(e.target.checked)} />
          Compatible only (fade others)
        </label>
      </aside>

      <div className="md:col-span-9 lg:col-span-9 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {parts.map((p)=> (
          <InventoryCard key={p.id} part={p} faded={compatibleOnly && !p.compatible} />
        ))}
      </div>
    </section>
  );
}

function rarityClass(r: Part["rarity"]) {
  switch (r) {
    case "common": return "text-foreground/60";
    case "rare": return "text-cyan-300";
    case "epic": return "text-violet-300";
    case "legendary": return "text-amber-300";
  }
}

function InventoryCard({ part, faded }: { part: Part; faded?: boolean }) {
  const { addScrap, spendCredits, setStorageUsed } = useResources();
  const danger = part.durability < 30;
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-background/70 p-3 transition",
        faded && "opacity-40",
        !part.compatible && "[animation:glitch_1.2s_infinite]"
      )}
    >
      {/* scanning laser */}
      <span className="pointer-events-none absolute inset-0 translate-y-[-100%] bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100 group-hover:animate-[scan_1.2s_ease-in-out]" />

      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold tracking-wider">{part.name}</span>
        <span className={cn("font-medium", rarityClass(part.rarity))}>{part.rarity}</span>
      </div>
      <div className="mt-2 h-16 rounded bg-foreground/5"/>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span>Weight {part.weight}</span>
        <span className={part.compatible ? "text-emerald-300" : "text-amber-300"}>{part.compatible ? "✅" : "⚠️"}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded bg-foreground/10">
        <div className="h-full" style={{ width: `${part.durability}%`, backgroundColor: danger ? "#ef4444" : "#16a34a", transition: "width 600ms ease" }} />
      </div>

      {/* tooltip */}
      <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] opacity-0 backdrop-blur transition group-hover:opacity-100">
        +Armor +Stability · Low power draw
      </div>

      {/* actions */}
      <div className="mt-3 flex gap-2 text-[11px]">
        <button className="rounded bg-primary/20 px-2 py-1 hover:bg-primary/30" onClick={()=>{ setStorageUsed(Math.min(100, Math.random()*10 + 60)); toast.success("Equipped"); }}>Equip</button>
        <button className="rounded bg-foreground/20 px-2 py-1 hover:bg-foreground/30" onClick={()=>{ spendCredits(25); toast("Upgraded +1 (-25 cr)"); }}>Upgrade</button>
        <button className="rounded bg-red-500/20 px-2 py-1 hover:bg-red-500/30" onClick={()=>{ addScrap(12); toast("Sold for +12 scrap"); }}>Sell</button>
      </div>

      <style jsx>{`
        @keyframes scan { 0% { transform: translateY(-120%); } 100% { transform: translateY(120%);} }
        @keyframes glitch {
          0%, 100% { filter: hue-rotate(0deg) contrast(1); }
          40% { filter: hue-rotate(-10deg) contrast(1.15); }
          60% { filter: hue-rotate(12deg) contrast(0.9); }
        }
      `}</style>
    </div>
  );
}

function UpgradesTab() {
  const [selected, setSelected] = useState<"head"|"torso"|"arm"|"leg"|null>(null);
  const parts = ["head","torso","arm","leg"] as const;
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border bg-background/70 p-4">
        <h3 className="mb-2 text-xs font-semibold tracking-wider">Robot Layout</h3>
        <div className="relative mx-auto h-72 md:h-80 rounded bg-foreground/5">
          {/* Reuse the existing 3D RobotViewer in a compact area */}
          <div className="absolute inset-0">
            <RobotViewer state="normal" />
          </div>
          <div className="pointer-events-none absolute top-2 left-2 text-[10px] bg-black/35 border border-white/10 rounded px-2 py-0.5">
            Click a part to highlight · Drag to rotate · Scroll to zoom
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-background/70 p-4">
        <h3 className="mb-2 text-xs font-semibold tracking-wider">Available Parts</h3>
        <div className="space-y-2">
          {demoParts.slice(0,4).map((p)=> (
            <div key={p.id} className="flex items-center justify-between rounded border bg-background/60 p-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 rounded bg-foreground/10"/>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[10px] opacity-70">+Armor +Stability -Weight</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded bg-primary/20 px-2 py-1 hover:bg-primary/30" onClick={()=>toast.success("Upgraded")}>Upgrade</button>
                <button className="rounded bg-foreground/20 px-2 py-1 hover:bg-foreground/30" onClick={()=>toast("Replaced")}>Replace</button>
                <button className="rounded bg-red-500/20 px-2 py-1 hover:bg-red-500/30" onClick={()=>toast("Scrapped +5")}>Scrap</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlackMarketTab() {
  const { adjustAuthority, spendCredits } = useResources();
  return (
    <section className="space-y-4">
      <div className="relative rounded-xl border bg-background/70 p-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-red-500/5 [animation:bmflicker_1.2s_infinite]"/>
        <h3 className="text-xs font-semibold tracking-wider">Illegal Mods</h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map((i)=> (
            <div key={i} className="group relative rounded border bg-black/50 p-3 text-xs">
              <div className="mb-2 font-semibold">Prototype Overclocker #{i}</div>
              <div className="opacity-80">Tags: unstable · contraband</div>
              <div className="mt-2 flex justify-between">
                <span>Price: 230 black-credits</span>
                <span>+34 scrap</span>
              </div>
              <div className="pointer-events-none absolute inset-0 hidden group-hover:block [animation:glitch_0.8s_infinite] text-amber-300/90 font-semibold flex items-center justify-center">
                Illegal mods detected
              </div>
              <button className="mt-3 rounded bg-red-500/20 px-2 py-1 hover:bg-red-500/30" onClick={()=>{
                if (confirm("Apply illegal mod? Authority attention +3")) {
                  spendCredits(230);
                  adjustAuthority(3);
                  toast("EMP Surge · Credits -230 · Authority +3");
                }
              }}>Apply</button>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes bmflicker { 0%,100%{opacity:.25} 50%{opacity:.4} }
          @keyframes glitch { 0%,100%{transform:translate(0)} 25%{transform:translate(1px,-1px)} 50%{transform:translate(-1px,1px)} 75%{transform:translate(1px,1px)} }
        `}</style>
      </div>
    </section>
  );
}

function FooterInfoBar() {
  const { storageUsed, scrap, credits, authority } = useResources();
  return (
    <footer className="sticky bottom-0 z-10 rounded-xl border bg-background/80 p-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
        <div>Storage: {storageUsed}%</div>
        <div>Scrap: {scrap}</div>
        <div>Credits: {credits}</div>
        <div className="flex items-center gap-2">Authority Heat
          <span className="h-2 w-full overflow-hidden rounded bg-foreground/10">
            <span className="block h-full bg-red-500" style={{ width: `${authority}%` }} />
          </span>
        </div>
      </div>
    </footer>
  );
}
