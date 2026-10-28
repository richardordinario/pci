import type * as React from "react"

import { Icon } from "@/components/ui/icon"

// Mirrors components/core/FeatureIcon.jsx of the design system.
const VARIANTS = {
  dark: ["var(--near-black)", "var(--pci-green)"],
  green: ["var(--pci-green)", "var(--white)"],
  tint: ["var(--green-tint)", "var(--green-text)"],
  white: ["var(--white)", "var(--near-black)"],
} as const

type FeatureIconProps = {
  icon: string
  size?: number
  variant?: keyof typeof VARIANTS
  style?: React.CSSProperties
}

function FeatureIcon({ icon, size = 64, variant = "dark", style }: FeatureIconProps) {
  const [bg, fg] = VARIANTS[variant] ?? VARIANTS.dark
  return (
    <span
      data-slot="feature-icon"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "inline-grid",
        placeItems: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.44)} />
    </span>
  )
}

export { FeatureIcon }
