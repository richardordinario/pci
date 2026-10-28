// Read-only port of the design's <image-slot> element. Images the designer
// dropped into a slot live in .image-slots.state.json in Claude Design; the
// ones that exist are mirrored here and take precedence over `src`.
const STORED: Record<string, string> = {
  "portfolio-dost-sei": "assets/portfolio/dost-sei.webp",
}

type ImageSlotProps = {
  id: string
  src?: string
  placeholder?: string
  shape?: "rect" | "rounded" | "circle" | "pill"
  radius?: number
  fit?: "cover" | "contain"
}

const RADIUS = { rect: "0", circle: "50%", pill: "9999px" } as const

function ImageSlot({ id, src, placeholder, shape = "rounded", radius = 12, fit = "cover" }: ImageSlotProps) {
  const url = STORED[id] || src || ""
  const borderRadius = shape === "rounded" ? `${radius}px` : RADIUS[shape]
  return (
    <div id={id} className="image-slot" data-image-slot="" data-filled={url ? "" : undefined}>
      <div className="frame" style={{ borderRadius }}>
        {url ? (
          <img src={url} alt="" draggable={false} style={{ objectFit: fit }} />
        ) : (
          <div className="empty">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <div className="cap">{placeholder || "Drop an image"}</div>
          </div>
        )}
      </div>
      <div className="ring" style={{ borderRadius }} />
    </div>
  )
}

export { ImageSlot }
