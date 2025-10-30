import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Liquid, type Colors } from "@/components/ui/button-1"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        neo:
          "rounded-xl px-6 py-3 bg-black text-foreground/95 shadow-[0_0_0_1px_rgba(255,255,255,.06),inset_0_0_0_1px_rgba(0,0,0,.35)] [clip-path:polygon(12px_0,calc(100%-12px)_0,100%_12px,100%_calc(100%-12px),calc(100%-12px)_100%,12px_100%,0_calc(100%-12px),0_12px)] hover:brightness-[1.06] active:translate-y-px overflow-hidden",
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2",
        destructive:
          "rounded-md px-4 py-2 bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "rounded-md px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "rounded-md px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "rounded-md px-4 py-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-7 has-[>svg]:px-5",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "neo",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  const [hovered, setHovered] = React.useState(false)

  // Rusty + black palette for the Liquid effect
  const colors: Colors = {
    color1: "#1a0e0a",
    color2: "#2b140a",
    color3: "#3a1b0f",
    color4: "#5a2a14",
    color5: "#2b140a",
    color6: "#7a3a19",
    color7: "#d36a28",
    color8: "#ff8a3c",
    color9: "#f6ad55",
    color10: "#ffe0b2",
    color11: "#000000",
    color12: "#42210b",
    color13: "#5c2c12",
    color14: "#2b140a",
    color15: "#8b4513",
    color16: "#d36a28",
    color17: "#ffb061",
  }

  const showLiquid = (variant ?? "neo") === "neo"

  return (
    <Comp
      data-slot="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {showLiquid && (
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <Liquid isHovered={hovered} colors={colors} />
        </div>
      )}
      <span className="relative z-10 flex items-center gap-2">
        {props.children}
      </span>
    </Comp>
  )
}

export { Button, buttonVariants }
