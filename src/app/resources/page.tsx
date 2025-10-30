"use client";
import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Panel } from "@/components/Panel";

export default function ResourcesPage() {
  const [marketOpen, setMarketOpen] = useState(false);

  return (
    <main className="grid grid-cols-1 gap-6">
      <Panel className="bevel">
        <CardHeader>
          <CardTitle className="tracking-widest font-stencil text-sm md:text-base">RESOURCES</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inventory" className="w-full" onValueChange={(v) => setMarketOpen(v === "black-market") }>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
              <TabsTrigger value="black-market">Black Market</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                { name: "Shoulder Actuator A2", durability: 42, tag: "KAI-Frame", weight: 12, compat: true },
                { name: "Optic Suite v3", durability: 78, tag: "Universal", weight: 4, compat: true },
                { name: "Heat Sink S9", durability: 64, tag: "Universal", weight: 6, compat: true },
                { name: "Armor Panel Mk.II", durability: 51, tag: "KAI-Frame", weight: 18, compat: false },
              ].map((p) => (
                <div key={p.name} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium tracking-wide">{p.name}</span>
                    <Badge variant={p.compat ? "outline" : "destructive"} className="text-[10px]">{p.compat ? p.tag : "Incompatible"}</Badge>
                  </div>
                  <div className="mb-1 flex items-center justify-between text-xs text-foreground/70">
                    <span>Durability</span><span>{p.durability}%</span>
                  </div>
                  <Progress value={p.durability} className="h-1.5"/>
                  <div className="mt-2 text-[11px] text-foreground/70">Weight: {p.weight} kg</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="upgrades" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { name: "Reinforced Shoulder", compat: "KAI-Frame" },
                { name: "Thermal Paste XT", compat: "Universal" },
                { name: "Gyro Stabilizer", compat: "Universal" },
                { name: "Mono-Edge Retrofit", compat: "KAI-Frame" },
              ].map((p) => (
                <div key={p.name} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium tracking-wide">{p.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{p.compat}</Badge>
                  </div>
                  <p className="text-xs text-foreground/70">Compatibility: {p.compat}</p>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="black-market" className="mt-4">
              <div className={`rounded-md border p-4 ${marketOpen ? "glitch-soft" : ""}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium tracking-wide">ILLEGAL MODS DETECTED</span>
                  <Badge variant="destructive" className="text-[10px]">Authority Risk</Badge>
                </div>
                <p className="text-xs text-foreground/80">Smuggled firmware keys, thermal overrides, signal scramblers.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Panel>
    </main>
  );
}


