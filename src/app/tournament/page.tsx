"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReplayScene from "@/components/ReplayScene";
import { cn } from "@/lib/utils";

export default function TournamentPage() {
  const [tab, setTab] = useState("replay");
  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="tracking-widest font-stencil text-sm md:text-base text-white">ARENA LOGS — TERMINAL ACCESS</h1>
        <NotorietyMeter level={62} />
      </header>

      <Tabs defaultValue="replay" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="replay">Replay</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="crews">Crews</TabsTrigger>
        </TabsList>

        <TabsContent value="replay" className="mt-4">
          <ReplayTab />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <CalendarTab />
        </TabsContent>
        <TabsContent value="crews" className="mt-4">
          <CrewsTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function ReplayTab() {
  const [time, setTime] = useState(35); // timeline position
  const [slow, setSlow] = useState(false);
  const [pov, setPov] = useState("Arena Cam");

  const rightStats = useMemo(() => ([
    { label: "Opponents", value: "Scrapjack Crew" },
    { label: "Damage", value: "1742" },
    { label: "Ammo Used", value: "126" },
    { label: "Overheat", value: "2 cycles" },
    { label: "Rewards", value: "+430 credits" },
  ]), []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <Card className="relative lg:col-span-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 border border-white/10 [background:repeating-linear-gradient(0deg,transparent_0_2px,rgba(255,255,255,.02)_2px_4px)]" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs tracking-wider flex items-center justify-between">
            <span>Unauthorized feed tapped — Arena Drone #04</span>
            <span className="opacity-70">00:{String(time).padStart(2,"0")}:12 • {pov}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative h-[360px] md:h-[480px]">
          <div className="absolute inset-0">
            <ReplayScene slow={slow} />
          </div>
          {/* overlays */}
          <div className="pointer-events-none absolute top-2 left-2 text-[10px] bg-black/40 border border-white/10 rounded px-2 py-0.5">DRONE ID: 04 • LATENCY: 128ms • TARGET LOCK</div>
        </CardContent>
        {/* Controls */}
        <div className="flex items-center gap-3 border-t p-3 text-[11px]">
          <button className="rounded bg-foreground/10 px-2 py-1 hover:bg-foreground/20" onClick={()=>setSlow(s=>!s)}>{slow?"Normal":"Slow-mo"}</button>
          <select value={pov} onChange={(e)=>setPov(e.target.value)} className="rounded bg-background border px-2 py-1">
            {['Arena Cam','Shoulder Cam','Scavenger Cam','Authority Cam'].map(o=> <option key={o} value={o}>{o}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded bg-foreground/10 px-2 py-1 hover:bg-foreground/20">Export</button>
            <button className="rounded bg-foreground/10 px-2 py-1 hover:bg-foreground/20">Save tactic</button>
            <button className="rounded bg-foreground/10 px-2 py-1 hover:bg-foreground/20">Favorite</button>
            <button className="rounded bg-foreground/10 px-2 py-1 hover:bg-foreground/20">Loot</button>
          </div>
        </div>
        <div className="border-t p-3">
          <input type="range" min={0} max={100} value={time} onChange={(e)=>setTime(parseInt(e.target.value))} className="w-full"/>
          <div className="mt-1 flex justify-between text-[10px] opacity-70">
            <span onMouseEnter={()=>setTime(12)} className="cursor-pointer">hit</span>
            <span onMouseEnter={()=>setTime(36)} className="cursor-pointer">overheat</span>
            <span onMouseEnter={()=>setTime(78)} className="cursor-pointer">finisher</span>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs tracking-wider">Battle Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[12px]">
          {rightStats.map(s=> (
            <div key={s.label} className="flex items-center justify-between">
              <span className="opacity-70">{s.label}</span>
              <span>{s.value}</span>
            </div>
          ))}
          <div className="mt-3">
            <div className="mb-1 text-[11px] opacity-70">Damage timeline</div>
            <div className="h-12 rounded bg-foreground/10"/>
          </div>
          <div>
            <div className="mb-1 text-[11px] opacity-70">Weapon usage</div>
            <div className="h-12 rounded bg-foreground/10"/>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarTab() {
  const events = [
    { d: "2077-11-05", venue: "Scrapyard-9", threat: "MED", crew: "Scrapjack", reward: "+420 cr" },
    { d: "2077-11-12", venue: "Factory-Delta", threat: "HIGH", crew: "Rust Fangs", reward: "+610 cr" },
    { d: "2077-11-18", venue: "Ruins-31", threat: "LOW", crew: "Bandit Cell", reward: "+280 cr" },
  ];
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-xs tracking-wider">Tournament Calendar</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-[11px]">
          {Array.from({length:28},(_,i)=>i+1).map(d => {
            const date = `2077-11-${String(d).padStart(2,"0")}`;
            const evt = events.find(e=>e.d===date);
            return (
              <div key={date} className={cn("aspect-square rounded border p-1 hover:bg-foreground/5", evt && "bg-background/60")}
                title={evt?`${evt.venue} • ${evt.reward} • ${evt.threat}`:undefined}>
                <div className="flex items-center justify-between">
                  <span>{d}</span>
                  {evt && <Badge variant={evt.threat==='HIGH'?'destructive':'secondary'} className="text-[9px]">{evt.threat}</Badge>}
                </div>
                {evt && <div className="mt-1 truncate opacity-70">{evt.crew}</div>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CrewsTab() {
  const crews = [
    { name: "Scrapjack Crew", rank: 12, trait: "Aggressive", weak: "Overheat" },
    { name: "Rust Fangs", rank: 7, trait: "Cunning", weak: "EMP" },
    { name: "Bandit Cell", rank: 19, trait: "Unpredictable", weak: "Armor" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {crews.map(c => (
        <Card key={c.name} className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_6px,rgba(255,255,255,.03)_6px_7px)]"/>
          <CardHeader className="pb-2"><CardTitle className="text-xs tracking-wider">{c.name}</CardTitle></CardHeader>
          <CardContent className="text-[12px] space-y-1">
            <div>Rank: {c.rank}</div>
            <div>Traits: {c.trait}</div>
            <div className="opacity-70">Weakness: {c.weak}</div>
            <div className="mt-2 text-[10px] text-foreground/70">REDACTED — CASE FILE 77-Δ</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NotorietyMeter({ level }: { level: number }) {
  const color = level < 33 ? "bg-cyan-400" : level < 66 ? "bg-amber-400" : level < 90 ? "bg-red-500" : "bg-white";
  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] opacity-80">Authority Heat</div>
      <div className="relative h-5 w-24 rounded bg-foreground/10 overflow-hidden">
        <div className={cn("h-full transition-[width] duration-700", color)} style={{ width: `${level}%` }}/>
        <div className="pointer-events-none absolute inset-0 [animation:noise_1.2s_infinite] mix-blend-screen" />
      </div>
      <style jsx>{`
        @keyframes noise { 0%,100%{opacity:.25} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}
