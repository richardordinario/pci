import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Mirrors components/core/Card.jsx of the design system.
const cardVariants = cva(
  "relative overflow-hidden box-border font-body rounded-[var(--radius-card)] transition-[transform,box-shadow] duration-(--dur-base) ease-(--ease-out)",
  {
    variants: {
      variant: {
        elevated: "bg-white shadow-(--shadow-2)",
        outline: "bg-white border border-solid border-gray-rule",
        subtle: "bg-off-white",
        tint: "bg-green-tint",
        dark: "bg-near-black text-white",
        green: "bg-pci-green text-white",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-1",
        false: "cursor-default",
      },
    },
    compoundVariants: [
      { variant: "elevated", interactive: true, className: "hover:shadow-(--shadow-3)" },
    ],
    defaultVariants: { variant: "elevated", interactive: false },
  }
)

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    padding?: number
    accentRule?: boolean
  }

function Card({
  variant,
  interactive,
  padding = 28,
  accentRule,
  className,
  style,
  children,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive, className }))}
      style={{ padding, ...style }}
      {...props}
    >
      {accentRule && (
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "var(--rule-accent-w)",
            background: "var(--pci-green)",
          }}
        />
      )}
      {children}
    </div>
  )
}

export { Card, cardVariants }
