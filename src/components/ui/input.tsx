import * as React from "react"
import { cn } from "@/lib/utils"

// Mirrors components/forms/Input.jsx of the design system.
type InputProps = Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  label?: string
  value?: string
  onChange?: (value: string) => void
  helper?: string
  error?: string
  wrapperStyle?: React.CSSProperties
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  helper,
  error,
  disabled,
  className,
  wrapperStyle,
  ...props
}: InputProps) {
  const id = React.useId()
  return (
    <div style={wrapperStyle}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--fg-1)",
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          id={id}
          data-slot="input"
          type={type}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full box-border h-[48px] px-[16px] font-sans text-[15px] text-(--fg-1) bg-white disabled:bg-off-white border-[1.5px] border-solid focus:shadow-(--shadow-focus) rounded-[var(--radius-md)] transition-[border-color,box-shadow] duration-(--dur-fast)",
            error ? "border-danger" : "border-gray-rule focus:border-pci-green-hover",
            className
          )}
          // inline so the global `*:focus-visible` outline never wins, as in the source
          style={{ outline: "none" }}
          {...props}
        />
      </div>
      {(error || helper) && (
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            marginTop: 6,
            color: error ? "var(--danger)" : "var(--fg-3)",
          }}
        >
          {error || helper}
        </div>
      )}
    </div>
  )
}

export { Input }
