"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DitheringShader } from "@/components/ui/dithering-shader";

type Wave1Props = {
  className?: string;
};

export default function Wave1({ className }: Wave1Props) {
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 1200, h: 800 });

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <DitheringShader
        width={size.w}
        height={size.h}
        colorBack="#1e0f0a"
        colorFront="#d36a28"
        shape="wave"
        type="8x8"
        pxSize={2}
        speed={0.8}
        className="w-full h-full"
      />
      {/* subtle rusty gradient/vignette overlay for a grittier look */}
      <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(80% 60% at 50% 40%, rgba(211,106,40,0.12) 0%, rgba(211,106,40,0.05) 40%, transparent 60%), radial-gradient(60% 50% at 10% 90%, rgba(120,50,20,0.35) 0%, transparent 60%), radial-gradient(55% 45% at 90% 10%, rgba(80,35,18,0.25) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}
