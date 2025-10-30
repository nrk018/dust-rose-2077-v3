"use client";

import { Button } from "@/components/ui/button";
import { Bolt } from "lucide-react";

export default function BoostButton({
  canBoost,
  active,
  onToggle,
}: {
  canBoost: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      disabled={!canBoost}
      variant={active ? "destructive" : "default"}
      onClick={onToggle}
      className={"w-full tactile " + (active ? "animate-pulse" : "")}
    >
      <Bolt className="mr-2 h-4 w-4"/>
      {active ? "Disable Boost" : "Enable Boost"}
    </Button>
  );
}


