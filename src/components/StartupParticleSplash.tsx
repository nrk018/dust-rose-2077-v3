"use client";

import React, { useEffect, useState } from "react";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";

export default function StartupParticleSplash() {
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(true);

  // Sequence: particle words (handled inside component) -> fade out -> unmount
  useEffect(() => {
    if (!visible) return;
    const exitTimer = window.setTimeout(() => {
      setFadeOut(true);
      window.setTimeout(() => setVisible(false), 1000);
    }, 22000);
    return () => {
      window.clearTimeout(exitTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={
        "fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 " +
        (fadeOut ? "opacity-0" : "opacity-100")
      }
      aria-hidden
    >
      <div className="relative mx-auto w-full h-dvh px-0 text-center flex flex-col items-center justify-center">
        <div className="splash-particles w-full max-w-none">
          <ParticleTextEffect />
        </div>
      </div>

      {/* Hide demo/footer content and any borders from the registry demo */}
      <style jsx>{`
        .splash-particles :is(footer, .caption, .text-muted-foreground, p, small){
          display: none !important;
        }
        .splash-particles :is(.border, .rounded-lg){
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}


