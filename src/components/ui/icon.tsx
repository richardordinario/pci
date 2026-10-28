import * as React from "react"
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Cloud,
  CodeXml,
  Facebook,
  Factory,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Landmark,
  LifeBuoy,
  Lightbulb,
  Linkedin,
  Mail,
  Menu,
  Mountain,
  PackageCheck,
  PencilRuler,
  Phone,
  Rocket,
  School,
  SearchCheck,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide"

// Same icon set the design system loads at runtime (lucide@0.460.0), so the
// glyph geometry matches the Claude Design source exactly. Only the icons the
// page uses are registered, to keep the bundle small.
const icons = {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Cloud,
  CodeXml,
  Facebook,
  Factory,
  FileText,
  Globe,
  GraduationCap,
  Handshake,
  Landmark,
  LifeBuoy,
  Lightbulb,
  Linkedin,
  Mail,
  Menu,
  Mountain,
  PackageCheck,
  PencilRuler,
  Phone,
  Rocket,
  School,
  SearchCheck,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  Users,
  X,
  Youtube,
  Zap,
}
type IconNode = [tag: string, attrs: Record<string, string | number>][]

const pascal = (n: string) =>
  n
    .split(/[-_ ]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("")

function getNode(name: string): IconNode {
  const raw = (icons as unknown as Record<string, unknown>)[pascal(name)]
  if (!raw) return []
  if (Array.isArray(raw) && raw[0] === "svg") return raw[2] as IconNode
  return raw as IconNode
}

type IconProps = Omit<React.SVGProps<SVGSVGElement>, "name"> & {
  name: string
  size?: number
  strokeWidth?: number
  color?: string
}

function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  color = "currentColor",
  style,
  ...rest
}: IconProps) {
  const node = getNode(name)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block", ...style }}
      {...rest}
    >
      {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  )
}

export { Icon }
