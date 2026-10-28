import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

import { Icon } from "@/components/ui/icon"

// Mirrors components/core/IconButton.jsx of the design system.
const iconButtonVariants = cva(
  "inline-grid place-items-center p-0 rounded-[var(--radius-pill)] border-[1.5px] border-solid cursor-pointer transition-[background] duration-(--dur-fast) disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-pci-green hover:bg-pci-green-hover text-white border-transparent",
        secondary: "bg-white hover:bg-off-white text-near-black border-gray-light",
        ghost: "bg-transparent hover:bg-off-white text-near-black border-transparent",
        dark: "bg-near-black hover:bg-[#3A3A3A] text-white border-transparent",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
)

type IconButtonProps = Omit<React.ComponentProps<"button">, "children"> &
  VariantProps<typeof iconButtonVariants> & {
    icon: string
    label: string
    size?: number
  }

function IconButton({
  icon,
  label,
  variant,
  size = 44,
  className,
  style,
  ...props
}: IconButtonProps) {
  return (
    <button
      data-slot="icon-button"
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, className }))}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <Icon name={icon} size={Math.round(size * 0.45)} />
    </button>
  )
}

export { IconButton, iconButtonVariants }
