"use client";
import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, PlayCircle } from "lucide-react";
import { Panel } from "@/components/Panel";

export default function TournamentPage() {
  const [notoriety, setNotoriety] = useState(12);
  useEffect(() => {
    const id = setInterval(() => {
      setNotoriety((n) => (n >= 96 ? 8 : n + Math.floor(Math.random() * 5)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Panel className="md:col-span-1 bevel">
        <CardHeader>
          <CardTitle className="tracking-widest font-stencil text-sm md:text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4"/> TOURNAMENT CALENDAR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-[10px]">
            {[...Array(28)].map((_, i) => (
              <div key={i} className={`aspect-square rounded border ${i % 7 === 5 ? "bg-primary/10" : "bg-background/60"}`}></div>
            ))}
          </div>
        </CardContent>
      </Panel>
      <Panel className="md:col-span-1 bevel">
        <CardHeader>
          <CardTitle className="tracking-widest font-stencil text-sm md:text-base flex items-center gap-2">
            <PlayCircle className="h-4 w-4"/> REPLAY MODE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded border bg-black/70 grid place-items-center text-xs text-zinc-300 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"repeating-linear-gradient(transparent 0 2px, rgba(255,255,255,.04) 2px 3px)"}} />
            <div className="absolute inset-0 pointer-events-none mix-blend-screen" style={{background:"radial-gradient(60% 40% at 50% 40%, rgba(34,211,238,.08), transparent)"}} />
            Grainy surveillance feed placeholder
          </div>
        </CardContent>
      </Panel>
      <Panel className="md:col-span-1 bevel">
        <CardHeader>
          <CardTitle className="tracking-widest font-stencil text-sm md:text-base">NOTORIETY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-foreground/80">
            <span>Authority Attention</span>
            <span>{notoriety}%</span>
          </div>
          <Progress value={notoriety} className="h-2"/>
        </CardContent>
      </Panel>
    </main>
  );
}


