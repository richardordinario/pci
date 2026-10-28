import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

import { Icon } from "@/components/ui/icon"

// PCI Tech Center Button — mirrors components/core/Button.jsx of the design system.
const buttonVariants = cva(
  "items-center justify-center gap-2 border-[1.5px] border-solid font-body font-semibold whitespace-nowrap rounded-[var(--radius-button)] cursor-pointer transition-[background] duration-(--dur-fast) ease-(--ease-out) disabled:cursor-not-allowed disabled:bg-off-white disabled:text-gray-light disabled:border-transparent",
  {
    variants: {
      variant: {
        primary:
          "bg-pci-green text-white border-transparent hover:bg-pci-green-hover active:bg-pci-green-press",
        dark: "bg-near-black text-white border-transparent hover:bg-[#3A3A3A] active:bg-[#1A1A1A]",
        secondary:
          "bg-white text-near-black border-near-black hover:bg-off-white active:bg-gray-rule",
        ghost:
          "bg-transparent text-near-black border-transparent hover:bg-green-tint active:bg-green-mid",
        inverse:
          "bg-white text-near-black border-transparent hover:bg-off-white active:bg-gray-rule",
        outlineInverse:
          "bg-transparent text-white border-white hover:bg-[rgba(255,255,255,.12)] active:bg-[rgba(255,255,255,.2)]",
      },
      size: {
        sm: "h-[36px] px-[16px] text-[13px]",
        md: "h-[44px] px-[22px] text-[14px]",
        lg: "h-[52px] px-[28px] text-[16px]",
      },
      fullWidth: {
        true: "flex w-full",
        false: "inline-flex",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
)

const ICON_SIZE = { sm: 16, md: 18, lg: 20 } as const

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    iconLeft?: string
    iconRight?: string
  }

function Button({
  className,
  variant,
  size = "md",
  fullWidth,
  iconLeft,
  iconRight,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const ic = ICON_SIZE[size ?? "md"]
  return (
    <button
      data-slot="button"
      type={type}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    >
      {iconLeft && <Icon name={iconLeft} size={ic} />}
      {children}
      {iconRight && <Icon name={iconRight} size={ic} />}
    </button>
  )
}

export { Button, buttonVariants }
