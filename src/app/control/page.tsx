"use client";
import { useMemo, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Radio, Shield, BatteryFull, FlameKindling, Activity } from "lucide-react";
import { Panel } from "@/components/Panel";
import RobotViewer from "@/components/RobotViewer";
import DamageHighlight from "@/components/DamageHighlight";
import StatusBars from "@/components/StatusBars";
import { ShinyButton } from "@/components/ui/shiny-button";
import { AnimatePresence, motion } from "framer-motion";
import CrewToast from "@/components/CrewToast";
import LoadingRadar from "@/components/ui/loading-radar";

function RobotStub({ damaged = true }: { damaged?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 1.2, 1]} />
        <meshStandardMaterial color={damaged ? "#6b7280" : "#94a3b8"} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.6]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.1, 1, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.6]} />
        <meshStandardMaterial color={damaged ? "#ef4444" : "#9ca3af"} emissive={damaged ? "#ef4444" : "#000000"} emissiveIntensity={damaged ? 1.2 : 0} />
      </mesh>
      <mesh position={[-0.5, -0.2, 0]}>
        <boxGeometry args={[0.5, 1.1, 0.6]} />
        <meshStandardMaterial color="#71717a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.5, -0.2, 0]}>
        <boxGeometry args={[0.5, 1.1, 0.6]} />
        <meshStandardMaterial color="#71717a" metalness={0.6} roughness={0.4} />
      </mesh>
    </>
  );
}

export default function ControlPage() {
  const [boost, setBoost] = useState(false);

  function playBoostSound() {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Setup nodes
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.value = 8;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);

      // Auto close context shortly after to free resources
      setTimeout(() => ctx.close(), 800);
      if (navigator.vibrate) navigator.vibrate(30);
    } catch {}
  }

  function playDisableSound() {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.25);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.value = 6;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      setTimeout(() => ctx.close(), 600);
      if (navigator.vibrate) navigator.vibrate(20);
    } catch {}
  }

  function playNotificationSound() {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const gain = ctx.createGain();

      o1.type = "sine"; o2.type = "sine";
      o1.frequency.setValueAtTime(880, ctx.currentTime);
      o2.frequency.setValueAtTime(1320, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      o1.connect(gain); o2.connect(gain); gain.connect(ctx.destination);
      o1.start(); o2.start();
      o1.stop(ctx.currentTime + 0.2); o2.stop(ctx.currentTime + 0.2);
      setTimeout(() => ctx.close(), 300);
    } catch {}
  }

  const stats = useMemo(
    () => [
      { label: "Battery", value: boost ? 42 : 68, icon: BatteryFull },
      { label: "Armor", value: 54, icon: Shield },
      { label: "Weapon Heat", value: boost ? 72 : 38, icon: FlameKindling },
      { label: "Stability", value: boost ? 48 : 76, icon: Activity },
    ],
    [boost]
  );

  return (
    <main className="relative grid grid-cols-1 gap-6 md:grid-cols-2">
      <Panel className="relative bevel">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="tracking-widest font-stencil text-sm md:text-base glitch-soft">DR-2077 // BATTLE READY</CardTitle>
          <Badge variant={boost ? "destructive" : "secondary"} className="gap-1 relative overflow-hidden min-w-[96px] justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={boost ? "BOOST" : "NORMAL"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {boost ? "BOOST" : "NORMAL"}
              </motion.span>
            </AnimatePresence>
          </Badge>
        </CardHeader>
        <CardContent className="relative h-[360px] md:h-[520px]">
          {/* On-canvas instructions */}
          <div className="pointer-events-none absolute top-4 left-4 md:top-6 md:left-6 text-[9px] md:text-[11px] text-white/80 bg-black/35 rounded px-2 py-0.5 border border-white/10">
            Click a robot part to inspect/repair · Hover to separate · Drag to rotate · Scroll to zoom
          </div>
          <RobotViewer state={boost ? "alert" : "damaged"} />
          <DamageHighlight label="RIGHT SHOULDER DAMAGED" active={!boost} />
        </CardContent>
      </Panel>

      <div className="flex flex-col gap-6">
        <Panel className="bevel">
          <CardHeader>
            <CardTitle className="tracking-widest font-stencil text-sm md:text-base">SYSTEM STATUS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBars stats={stats} />
            <Separator/>
            <div className="flex flex-col gap-3">
              <ShinyButton
                className="w-full"
                onClick={() => setBoost((b)=>{ const next = !b; if(next) playBoostSound(); else playDisableSound(); return next; })}
                highlight={boost ? "#22d3ee" : "#d36a28"}
                bg={boost ? "#0b1a0a" : "#1a0e0a"}
              >
                {boost ? "Disable Boost" : "Enable Boost"}
              </ShinyButton>
              <ShinyButton
                className="w-full"
                onClick={() => {
                  playNotificationSound();
                  toast.custom((t) => (
                    <CrewToast>
                      Cooling loop nominal. Weapons armed.
                    </CrewToast>
                  ), { duration: 2500 });
                }}
              >
                Crew Ping
              </ShinyButton>
            </div>
          </CardContent>
        </Panel>
      </div>
    </main>
  );
}


