import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Mirrors components/core/Badge.jsx of the design system.
const badgeVariants = cva(
  "inline-flex items-center gap-[6px] h-[26px] px-[12px] rounded-[var(--radius-pill)] font-heading text-[11px] font-semibold tracking-[.08em] uppercase whitespace-nowrap",
  {
    variants: {
      tone: {
        tint: "bg-green-tint text-near-black",
        green: "bg-pci-green text-white",
        neutral: "bg-off-white text-gray-medium",
        dark: "bg-near-black text-white",
        outline: "bg-transparent text-near-black border border-solid border-gray-rule",
        coursera: "bg-coursera-blue text-white",
      },
    },
    defaultVariants: { tone: "tint" },
  }
)

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, className }))} {...props} />
}

export { Badge, badgeVariants }
