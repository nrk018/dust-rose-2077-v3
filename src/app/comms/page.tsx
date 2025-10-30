"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Radio } from "lucide-react";
import { Panel } from "@/components/Panel";

export default function CommsPage() {
  const [authorityOpen, setAuthorityOpen] = useState(false);
  const [radioOpen, setRadioOpen] = useState(false);

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
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="tracking-widest font-stencil">CREW RADIO</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3 text-sm">
                  <p>[Ops] Cooling loop nominal. Weapons armed.</p>
                  <p>[Mech] Right shoulder actuator flagged. Avoid hard lateral boosts.</p>
                  <p>[Nav] Authority patrol nearby. Keep emissions low.</p>
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
            Unauthorized heat signatures detected near tournament grounds. Acknowledge receipt.
            <div className="mt-2 text-[11px] opacity-70">AI: Error 404 — Morale not found.</div>
          </div>
          <DialogFooter>
            <Button onClick={() => setAuthorityOpen(false)} autoFocus>
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}


