import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { IconButton } from "@/components/ui/icon-button"

// Radix dialog styled as components/feedback/Dialog.jsx of the design system.
type DialogProps = {
  open: boolean
  title: React.ReactNode
  onClose?: () => void
  width?: number
  actions?: React.ReactNode
  children?: React.ReactNode
}

function Dialog({ open, title, onClose, width = 520, actions, children }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="dialog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--scrim)",
            display: "grid",
            placeItems: "center",
            padding: 24,
            zIndex: 1000,
          }}
        >
          <div style={{ width: "100%", maxWidth: width }}>
            <DialogPrimitive.Content
              data-slot="dialog-content"
              aria-describedby={undefined}
              style={{
                width: "100%",
                maxWidth: width,
                background: "#fff",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-3)",
                padding: 32,
                fontFamily: "var(--font-sans)",
                position: "relative",
                boxSizing: "border-box",
              }}
            >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <DialogPrimitive.Title
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {title}
                </DialogPrimitive.Title>
                {onClose && (
                  <IconButton icon="x" label="Close" variant="ghost" size={36} onClick={onClose} />
                )}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--gray-medium)" }}>
                {children}
              </div>
              {actions && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28 }}>
                  {actions}
                </div>
              )}
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { Dialog }
