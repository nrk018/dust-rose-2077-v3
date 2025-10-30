"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Radio } from "lucide-react";
import { Panel } from "@/components/Panel";
import LoadingRadar from "@/components/ui/loading-radar";

export default function CommsPage() {
  const [authorityOpen, setAuthorityOpen] = useState(false);
  const [radioOpen, setRadioOpen] = useState(false);
  const [radarActive, setRadarActive] = useState(false);

  // Crew radio: streaming typewriter messages
  const baseMessages = useMemo(
    () => [
      "[Ops] Cooling loop nominal. Weapons armed.",
      "[Mech] Right shoulder actuator flagged. Avoid hard lateral boosts.",
      "[Nav] Authority patrol ping on channel 7 — keep emissions low.",
      "[Scout] Dust storm rolling in from NE. Visibility dropping.",
      "[Drone-04] Heat signature at grid C3 moving fast.",
      "[Ops] Route power to stabilizers if you trigger Boost.",
      "[Mech] Spare servo bracket installed. Rated to 62% stress.",
      "[Nav] Switching to encrypted burst. Stand by…",
    ],
    []
  );
  const [feed, setFeed] = useState<string[]>([]);
  const [typing, setTyping] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  // Autoscroll when new lines added
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [feed, typing]);

  // Start/stop the incoming typewriter when radio drawer opens
  useEffect(() => {
    let idx = 0;
    let char = 0;
    let frame: number | null = null;
    let nextDelay = 0;

    const typeLoop = (t: number) => {
      if (nextDelay > 0) {
        nextDelay -= 16;
        frame = requestAnimationFrame(typeLoop);
        return;
      }
      const current = baseMessages[idx % baseMessages.length];
      if (char < current.length) {
        setTyping(current.slice(0, char + 1));
        char += 1;
        nextDelay = 12; // per-char delay
      } else {
        setFeed((f) => [...f, current]);
        setTyping("");
        idx += 1;
        char = 0;
        nextDelay = 600; // pause between lines
      }
      frame = requestAnimationFrame(typeLoop);
    };

    if (radioOpen) {
      playRadioClick();
      frame = requestAnimationFrame(typeLoop);
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
      setTyping("");
    };
  }, [radioOpen, baseMessages]);

  // Radar live dummy data + audio waveform animation
  const [radarLog, setRadarLog] = useState<string[]>([]);
  useEffect(() => {
    if (!radarActive) return;
    playRadarPing();
    const id = setInterval(() => {
      const dist = (Math.random() * 900 + 100).toFixed(0);
      const bearing = (Math.random() * 360).toFixed(0);
      const signal = (Math.random() * 100).toFixed(0);
      setRadarLog((r) => [
        `Echo @ ${bearing}° | ${dist}m | Signal ${signal}%`,
        ...r.slice(0, 7),
      ]);
    }, 1200);
    return () => clearInterval(id);
  }, [radarActive]);

  // Sounds
  const playRadioClick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 420;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const playRadarPing = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(900, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.36);
    } catch {}
  };

  return (
    <main className="grid grid-cols-1 gap-6">
      <Panel className="bevel">
        <CardHeader>
          <CardTitle className="tracking-widest font-stencil text-sm md:text-base">COMMUNICATIONS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Sheet open={radioOpen} onOpenChange={setRadioOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" className="tactile">
                  <Radio className="mr-2 h-4 w-4"/> Crew Radio
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-[rgba(28,14,8,0.9)] border-r border-[rgba(190,120,70,0.35)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <SheetHeader>
                  <SheetTitle className="tracking-widest font-stencil text-white">CREW RADIO</SheetTitle>
                </SheetHeader>
                {/* top status strip */}
                <div className="mt-2 mb-2 flex items-center justify-between px-2 py-1 rounded border border-[rgba(190,120,70,0.25)] bg-[rgba(60,30,15,0.35)] text-white">
                  <div className="text-[10px] md:text-[11px] tracking-widest">CHANNEL 7 • SECURE BURST</div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px]">SIGNAL ▮▮▮▯</div>
                    <div className="w-2 h-2 rounded-full bg-[rgba(255,80,60,0.9)] animate-pulse" />
                    <div className="text-[10px]">REC</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{backgroundImage:"repeating-linear-gradient(transparent 0 2px, rgba(255,255,255,.5) 2px 3px)"}} />
                  <div className="text-xs md:text-sm font-mono rounded-md border border-[rgba(190,120,70,0.25)] bg-[rgba(30,15,8,0.55)] text-white">
                    <div ref={feedRef} className="h-72 overflow-y-auto pr-2 py-2">
                      {feed.map((line, i) => {
                        const m = line.match(/^\[(.*?)\]\s*(.*)$/);
                        const role = m?.[1] || "SYS";
                        const msg = m?.[2] || line;
                        return (
                          <div key={i} className="mb-2 flex items-start gap-2">
                            <span className="inline-flex items-center h-5 px-2 rounded-sm bg-[rgba(190,120,70,0.15)] text-[10px] tracking-wide text-white border border-[rgba(190,120,70,0.35)]">
                              {role}
                            </span>
                            <span className="flex-1">{msg}</span>
                            <span className="text-[10px] tabular-nums">{new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</span>
                          </div>
                        );
                      })}
                      {typing && (
                        <div className="mb-2 flex items-start gap-2">
                          <span className="inline-flex items-center h-5 px-2 rounded-sm bg-[rgba(190,120,70,0.15)] text-[10px] tracking-wide text-[rgba(235,180,120,0.95)] border border-[rgba(190,120,70,0.35)]">…</span>
                          <span>
                            {typing}
                            <span className="inline-block align-middle w-2 h-4 bg-white ml-1 animate-pulse"/>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="destructive" className="tactile" onClick={() => setAuthorityOpen(true)}>
              Authority Broadcast
            </Button>
          </div>
        </CardContent>
      </Panel>

      <Dialog open={authorityOpen} onOpenChange={setAuthorityOpen}>
        <DialogContent className="[&>div:first-child]:hidden">
          <DialogHeader>
            <DialogTitle className="tracking-widest font-stencil glitch-soft">AUTHORITY INTERRUPT</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-foreground/80 relative">
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40" style={{backgroundImage:"repeating-linear-gradient(transparent 0 2px, rgba(255,255,255,.06) 2px 3px)"}} />
            [RULING AUTHORITY // NOTICE]
            <br/>Encrypted broadcast interception detected from your terminal cluster.
            <br/>Section 14.3 — Arena interference statutes apply. Present ID within 90 seconds.
            <br/>Failure to comply escalates attention level and restricts prize disbursement.
            <div className="mt-2 text-[11px] opacity-70">AI: Observation order pending… keep chatter clean.</div>
          </div>
          <DialogFooter>
            <Button onClick={() => setAuthorityOpen(false)} autoFocus className="text-white">
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Radar panel */}
      <Panel className="bevel">
        <CardHeader>
          <CardTitle className="tracking-widest font-stencil text-sm md:text-base">RADAR // ACOUSTIC SCAN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-[rgba(120,60,30,0.15)] ring-1 ring-[rgba(190,120,70,0.35)]">
                <LoadingRadar />
              </div>
              <Button className="tactile" variant="secondary" onClick={() => setRadarActive((v)=>!v)}>
                {radarActive ? "Stop Radar" : "Activate Radar"}
              </Button>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live radar data */}
              <div className="rounded-md p-3 bg-[rgba(60,30,15,0.35)] ring-1 ring-[rgba(190,120,70,0.25)] min-h-[140px]">
                <div className="text-[11px] uppercase tracking-widest text-foreground/70 mb-2">Live Echo Log</div>
                <div className="space-y-1 text-xs font-mono">
                  {radarLog.map((l, i) => (
                    <div key={i} className="text-[rgba(235,180,120,0.9)]">{l}</div>
                  ))}
                  {radarLog.length === 0 && <div className="text-foreground/40">No echoes yet…</div>}
                </div>
              </div>
              {/* Audio sonar-like waveform */}
              <div className="rounded-md p-3 bg-[rgba(60,30,15,0.35)] ring-1 ring-[rgba(190,120,70,0.25)] min-h-[140px]">
                <div className="text-[11px] uppercase tracking-widest text-foreground/70 mb-2">Acoustic Trace</div>
                <div className="flex items-end gap-1 h-24">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[4px] bg-[rgba(235,140,80,0.9)]"
                      style={{ height: `${Math.max(8, Math.floor((Math.sin(i*1.7 + (radarActive?Date.now()*0.008:0)) * 0.5 + 0.5) * 80))}px` }}
                    />
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-foreground/50">Unrecognized external voices — recording…</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Panel>
    </main>
  );
}


