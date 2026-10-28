// Port of the imperative motion layer in "Homepage v2.dc.html" (the DCLogic
// Component class). It is DOM-driven on purpose: elements opt in through the
// same data-* attributes the design uses (data-reveal, data-stagger,
// data-count, data-glow, data-bubble, data-flow, ...).

const E = "cubic-bezier(0.22, 1, 0.36, 1)"

type Opts = { ambientMotion: boolean; rippleSpeed: number }

type Animated = HTMLElement & { __an?: Animation[]; __d?: number }
type Dot = HTMLElement & { __pop?: number }
type Word = HTMLElement & { __o?: string }

export class HomepageMotion {
  private root: HTMLElement
  private opts: Opts
  private rm: boolean
  private cache: Record<string, Element | null> = {}
  private owned = new Set<Animation>()
  private io?: IntersectionObserver
  private cio?: IntersectionObserver
  private raf = 0
  private ioTimer?: ReturnType<typeof setTimeout>
  private revealItems: Animated[] = []
  private finished = false
  private navKey?: string
  private sws?: Word[]
  private last?: number
  private rt = 0
  private disposers: (() => void)[] = []

  constructor(root: HTMLElement, opts: Opts) {
    this.root = root
    this.opts = opts
    this.rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  setOptions(opts: Opts) {
    this.opts = opts
  }

  start() {
    const root = this.root
    this.intro(root)
    this.reveals(root)
    this.counters(root)
    this.hovers()
    this.timelineInit(root)
    const onScroll = () => this.scrollFrame()
    window.addEventListener("scroll", onScroll, { passive: true })
    this.disposers.push(() => window.removeEventListener("scroll", onScroll))
    this.scrollFrame()
    const loop = (now: number) => {
      this.frame(now)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    clearTimeout(this.ioTimer)
    this.io?.disconnect()
    this.cio?.disconnect()
    this.disposers.forEach((d) => d())
    this.owned.forEach((a) => a.cancel())
    this.owned.clear()
    this.revealItems.forEach((el) => delete el.__an)
  }

  // Staggered entrance of the mobile menu links (componentDidUpdate in the source).
  animateMenu() {
    this.root.querySelectorAll<HTMLElement>("[data-mlink]").forEach((el, i) =>
      el.animate(
        this.rm
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "translateY(18px)" },
              { opacity: 1, transform: "none" },
            ],
        { duration: this.rm ? 200 : 600, delay: this.rm ? 0 : 60 + i * 55, easing: E, fill: "both" }
      )
    )
  }

  private q<T extends Element = HTMLElement>(k: string, sel: string): T | null {
    const c = this.cache[k]
    if (c && c.isConnected) return c as T
    return (this.cache[k] = this.root.querySelector(sel)) as T | null
  }

  private own(a: Animation) {
    this.owned.add(a)
    return a
  }

  private intro(root: HTMLElement) {
    const fade = [{ opacity: 0 }, { opacity: 1 }]
    const l = root.querySelector("[data-logo]")
    if (l) this.own(l.animate(fade, { duration: 700, easing: E, fill: "both" }))
    root.querySelectorAll("[data-word]").forEach((w, i) =>
      this.own(
        w.animate(
          this.rm
            ? fade
            : [
                { opacity: 0, transform: "translateY(60%)" },
                { opacity: 1, transform: "none" },
              ],
          { duration: 900, delay: 150 + i * 140, easing: E, fill: "both" }
        )
      )
    )
  }

  private mk(el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) {
    const a = this.own(el.animate(kf, { easing: E, fill: "both", ...o }))
    a.pause()
    return a
  }

  private reveals(root: HTMLElement) {
    const items: [Animated, number][] = []
    root.querySelectorAll<Animated>("[data-reveal]").forEach((el) => items.push([el, +(el.dataset.delay || 0)]))
    root
      .querySelectorAll("[data-stagger]")
      .forEach((g) => [...g.children].forEach((c, i) => items.push([c as Animated, i * 100])))
    const reg = new Set<Element>(items.map((x) => x[0]))
    const covered = (el: Element) => {
      for (let n: Element | null = el; n && n !== root; n = n.parentElement) if (reg.has(n)) return true
      return false
    }
    root.querySelectorAll("section, footer").forEach((sec) => {
      if (sec.id === "top" || sec.closest('header,[role="dialog"]')) return
      let i = 0
      sec
        .querySelectorAll<Animated>('h2, h3, h4, p, img, [data-image-slot], article, [role="tab"], footer a[aria-label]')
        .forEach((el) => {
          if (covered(el) || el.closest('[data-proc],[data-marquee-wrap],[data-statement],[role="dialog"],header')) return
          if (!el.getClientRects().length) return
          items.push([el, Math.min(i++, 6) * 80])
          reg.add(el)
        })
    })
    this.io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as Animated
          this.io!.unobserve(el)
          ;(el.__an || []).forEach((a) => a.play())
          if (!this.rm) {
            const d = el.__d || 0
            if (el.matches("[data-draw-on-reveal]") || el.querySelector("[data-pillar]") || el.matches("[data-pillar]"))
              el.querySelectorAll("[data-draw]").forEach((x) => this.draw(x, d + 250))
          }
        }),
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    )
    items.forEach(([el, d]) => {
      const kf = this.rm
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(28px)" },
            { opacity: 1, transform: "none" },
          ]
      el.__an = [this.mk(el, kf, { duration: this.rm ? 400 : 850, delay: d })]
      el.__d = d
      if (!this.rm)
        el.querySelectorAll("[data-rule]").forEach((b) =>
          el.__an!.push(this.mk(b, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1200, delay: d + 300 }))
        )
      if (el.matches("[data-dash]") && !this.rm) {
        el.querySelectorAll("[data-grow]").forEach((b, i) =>
          el.__an!.push(
            this.mk(b, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 900, delay: d + 350 + i * 90 })
          )
        )
        el.querySelectorAll("[data-row]").forEach((r, i) =>
          el.__an!.push(
            this.mk(
              r,
              [
                { opacity: 0, transform: "translateX(24px)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 700, delay: d + 600 + i * 110 }
            )
          )
        )
        el.querySelectorAll("[data-fill]").forEach((f) =>
          el.__an!.push(this.mk(f, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1400, delay: d + 900 }))
        )
      }
      this.io!.observe(el)
    })
    this.revealItems = items.map((i) => i[0])
    requestAnimationFrame(() =>
      items.forEach(([el]) => {
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) {
          this.io?.unobserve(el)
          ;(el.__an || []).forEach((a) => a.play())
        }
      })
    )
    const finishAll = () => {
      this.revealItems.forEach((el) => (el.__an || []).forEach((a) => a.finish()))
      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const to = +el.dataset.count!
        el.textContent = (to >= 10000 ? to.toLocaleString("en-US") : String(to)) + (el.dataset.suffix || "")
      })
      root.querySelectorAll<Dot>("[data-tl-dot]").forEach((d) => {
        d.__pop = 1
        d.style.transform = "scale(1)"
        d.getAnimations().forEach((a) => a.finish())
      })
      const line = root.querySelector<HTMLElement>("[data-tl-line]")
      if (line) line.style.transform = "scaleY(1)"
      this.finished = true
      this.statement()
    }
    if (document.visibilityState === "hidden") this.ioTimer = setTimeout(finishAll, 50)
    else
      this.ioTimer = setTimeout(() => {
        if (document.visibilityState === "hidden") finishAll()
      }, 1500)
    const onVis = () => {
      if (document.visibilityState === "visible" && this.finished) {
        this.finished = false
        this.scrollFrame()
      }
    }
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("beforeprint", finishAll)
    this.disposers.push(() => {
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("beforeprint", finishAll)
    })
  }

  private draw(host: Element, delay: number) {
    host
      .querySelectorAll<SVGGeometryElement>("svg path, svg line, svg circle, svg rect, svg polyline, svg polygon, svg ellipse")
      .forEach((p) => {
        if (!p.getTotalLength) return
        let L = 0
        try {
          L = p.getTotalLength()
        } catch {
          return
        }
        if (!L) return
        p.animate(
          [
            { strokeDasharray: L, strokeDashoffset: L },
            { strokeDasharray: L, strokeDashoffset: 0 },
          ],
          { duration: 900, delay: delay || 0, easing: E }
        )
      })
  }

  private counters(root: HTMLElement) {
    const els = root.querySelectorAll<HTMLElement>("[data-count]")
    const fmt = (el: HTMLElement, v: number) => {
      const to = +el.dataset.count!
      const n = Math.round(v)
      return (to >= 10000 ? n.toLocaleString("en-US") : String(n)) + (el.dataset.suffix || "")
    }
    if (this.rm) return
    els.forEach((el) => {
      el.textContent = fmt(el, +(el.dataset.from || 0))
    })
    this.cio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          this.cio!.unobserve(el)
          const from = +(el.dataset.from || 0),
            to = +el.dataset.count!,
            s = performance.now() + 200,
            D = 1600
          const step = (n: number) => {
            const p = Math.max(0, Math.min(1, (n - s) / D))
            const k = 1 - Math.pow(1 - p, 4)
            el.textContent = fmt(el, from + (to - from) * k)
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }),
      { threshold: 0.5 }
    )
    els.forEach((el) => this.cio!.observe(el))
  }

  private hovers() {
    const over = (e: PointerEvent) => {
      const t = e.target as Element
      const rel = e.relatedTarget as Node | null
      const b = t.closest("button")
      if (b && !b.contains(rel) && b.dataset.arrow !== "no" && !this.rm) {
        const s = b.lastElementChild
        if (s && s.tagName.toLowerCase() === "svg")
          s.animate([{ transform: "translateX(4px)" }], { duration: 320, easing: E, fill: "forwards" })
      }
      const p = t.closest("[data-pillar]")
      if (p && !p.contains(rel)) {
        const bar = p.querySelector("[data-bar]")
        bar?.animate([{ transform: "scaleX(1)" }], { duration: 500, easing: E, fill: "forwards" })
        if (!this.rm) p.querySelectorAll("[data-draw]").forEach((x) => this.draw(x, 0))
      }
    }
    const out = (e: PointerEvent) => {
      const t = e.target as Element
      const rel = e.relatedTarget as Node | null
      const b = t.closest("button")
      if (b && !b.contains(rel) && b.dataset.arrow !== "no") {
        const s = b.lastElementChild
        if (s && s.tagName.toLowerCase() === "svg")
          s.animate([{ transform: "translateX(0)" }], { duration: 320, easing: E, fill: "forwards" })
      }
      const p = t.closest("[data-pillar]")
      if (p && !p.contains(rel)) {
        const bar = p.querySelector("[data-bar]")
        bar?.animate([{ transform: "scaleX(.22)" }], { duration: 500, easing: E, fill: "forwards" })
      }
    }
    const down = (e: PointerEvent) => {
      const b = (e.target as Element).closest("button")
      if (!b || this.rm) return
      const r = b.getBoundingClientRect(),
        d = Math.max(r.width, r.height) * 2.2,
        s = document.createElement("span")
      Object.assign(s.style, {
        position: "absolute",
        left: e.clientX - r.left - d / 2 + "px",
        top: e.clientY - r.top - d / 2 + "px",
        width: d + "px",
        height: d + "px",
        borderRadius: "50%",
        background: getComputedStyle(b).color,
        pointerEvents: "none",
        opacity: "0",
      })
      if (getComputedStyle(b).position === "static") b.style.position = "relative"
      b.style.overflow = "hidden"
      b.appendChild(s)
      s.animate(
        [
          { transform: "scale(0)", opacity: 0.28 },
          { transform: "scale(1)", opacity: 0 },
        ],
        { duration: 650, easing: E }
      ).onfinish = () => s.remove()
    }
    // Dialogs and the mobile menu render in portals / outside the root in React,
    // so listen on the document to keep the same coverage as the source.
    document.addEventListener("pointerover", over)
    document.addEventListener("pointerout", out)
    document.addEventListener("pointerdown", down)
    this.disposers.push(() => {
      document.removeEventListener("pointerover", over)
      document.removeEventListener("pointerout", out)
      document.removeEventListener("pointerdown", down)
    })
  }

  private timelineInit(root: HTMLElement) {
    if (this.rm) return
    const line = root.querySelector<HTMLElement>("[data-tl-line]")
    if (line) line.style.transform = "scaleY(0)"
    root.querySelectorAll<HTMLElement>("[data-tl-dot]").forEach((d) => {
      d.style.transform = "scale(0)"
    })
  }

  private statement() {
    const p0 = this.q("st", "[data-statement]")
    if (!p0) return
    const ws =
      this.sws && this.sws[0] && this.sws[0].isConnected ? this.sws : (this.sws = [...p0.querySelectorAll<Word>("[data-sw]")])
    let p = 1
    if (!this.rm && !this.finished) {
      const r = p0.getBoundingClientRect(),
        vh = window.innerHeight
      p = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.45 + r.height)))
    }
    const N = ws.length
    ws.forEach((w, i) => {
      const o = (0.38 + 0.62 * Math.max(0, Math.min(1, p * (N + 2) - i))).toFixed(2)
      if (w.__o !== o) {
        w.__o = o
        w.style.opacity = o
      }
    })
  }

  private scrollFrame() {
    const y = window.scrollY,
      h = document.documentElement.scrollHeight - window.innerHeight
    const pr = this.q("prog", "[data-progress]")
    if (pr) pr.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")"
    const nav = this.q("nav", "[data-nav]"),
      s = y > 24
    if (nav) {
      let theme = "dark"
      const probeY = 104 + 2,
        xs = [window.innerWidth * 0.5, 40]
      for (const px of xs) {
        const els = document.elementsFromPoint(px, probeY)
        let found: number[] | null = null
        for (const el of els) {
          if (nav.contains(el)) continue
          let n: Element | null = el
          while (n && n !== document.body) {
            const bg = getComputedStyle(n).backgroundColor
            const m = bg.match(/rgba?\(([^)]+)\)/)
            if (m) {
              const p = m[1].split(",").map(parseFloat)
              if (
                (p[3] === undefined || p[3] > 0.5) &&
                (n.hasAttribute("data-navbg") ||
                  n.tagName === "SECTION" ||
                  n.tagName === "FOOTER" ||
                  n.tagName === "MAIN" ||
                  n === this.root)
              ) {
                found = p
                break
              }
            }
            n = n.parentElement
          }
          if (found) break
        }
        if (found) {
          const L = 0.2126 * found[0] + 0.7152 * found[1] + 0.0722 * found[2]
          theme = L > 150 ? "light" : "dark"
          break
        }
      }
      const key = (s ? "s" : "t") + theme
      if (key !== this.navKey) {
        this.navKey = key
        const light = theme === "light"
        nav.style.background = !s ? "transparent" : light ? "rgba(255,255,255,0.92)" : "rgba(38,38,38,0.88)"
        nav.style.borderBottomColor = !s ? "transparent" : light ? "#CCCCCC" : "#4A4A4A"
        nav.style.backdropFilter = s ? "blur(8px)" : "none"
        nav.style.setProperty("-webkit-backdrop-filter", s ? "blur(8px)" : "none")
        nav.style.setProperty("--nav-fg", light ? "#262626" : "#FFFFFF")
        const lw = nav.querySelector<HTMLElement>("[data-logo-w]"),
          lc = nav.querySelector<HTMLElement>("[data-logo-c]")
        if (lw && lc) {
          lw.style.opacity = light ? "0" : "1"
          lc.style.opacity = light ? "1" : "0"
        }
      }
    }
    this.statement()
    if (this.rm || this.finished) return
    const tl = this.q("tl", "[data-tl]")
    if (!tl) return
    const r = tl.getBoundingClientRect(),
      p = Math.max(0, Math.min(1, (window.innerHeight * 0.62 - r.top) / r.height))
    const line = this.q("tll", "[data-tl-line]")
    if (line) line.style.transform = "scaleY(" + p.toFixed(4) + ")"
    tl.querySelectorAll<Dot>("[data-tl-dot]").forEach((d) => {
      if (d.__pop) return
      const dr = d.getBoundingClientRect()
      const pos = (dr.top + dr.height / 2 - r.top) / r.height
      if (p >= pos) {
        d.__pop = 1
        this.own(
          d.animate(
            [{ transform: "scale(0)" }, { transform: "scale(1.15)", offset: 0.6 }, { transform: "scale(1)" }],
            { duration: 520, easing: E, fill: "forwards" }
          )
        )
        const ring = d.querySelector("[data-ring]")
        ring?.animate(
          [
            { transform: "scale(1)", opacity: 0.6 },
            { transform: "scale(2.6)", opacity: 0 },
          ],
          { duration: 900, delay: 120, easing: E }
        )
      }
    })
  }

  private glow(g0: HTMLElement, g1: HTMLElement, t: number) {
    g0.style.transform =
      "translate3d(" +
      (Math.sin(t * 0.55) * 9).toFixed(2) +
      "%," +
      (Math.cos(t * 0.42) * 6).toFixed(2) +
      "%,0) rotate(" +
      (Math.sin(t * 0.3) * 8).toFixed(2) +
      "deg) scale(" +
      (1 + Math.sin(t * 0.38) * 0.16).toFixed(3) +
      "," +
      (1 + Math.cos(t * 0.47) * 0.12).toFixed(3) +
      ")"
    g1.style.transform =
      "translate3d(" +
      (Math.sin(t * 0.72 + 1.4) * 14).toFixed(2) +
      "%," +
      (Math.sin(t * 0.61 + 0.6) * 8).toFixed(2) +
      "%,0) scale(" +
      (1 + Math.sin(t * 0.8 + 2) * 0.22).toFixed(3) +
      ")"
    g1.style.opacity = (0.7 + Math.sin(t * 0.9) * 0.3).toFixed(3)
  }

  private frame(now: number) {
    const dt = Math.min(64, now - (this.last || now))
    this.last = now
    const amb = this.opts.ambientMotion && !this.rm
    if (amb) this.rt += dt * this.opts.rippleSpeed
    if (amb) {
      const bs = this.q("bub", "[data-bubble]")
      if (bs) {
        const r = bs.getBoundingClientRect()
        if (r.bottom > -200 && r.top < window.innerHeight + 200)
          this.root.querySelectorAll<HTMLElement>("[data-bubble]").forEach((b) => {
            const ph = +(b.dataset.phase || 0)
            b.style.transform = "translate3d(0," + (Math.sin(now / 1800 + ph * 1.7) * 8).toFixed(2) + "px,0)"
          })
      }
    }
    const g0 = this.q("g0", '[data-glow="0"]'),
      g1 = this.q("g1", '[data-glow="1"]')
    if (g0 && g1) {
      if (amb) this.glow(g0, g1, this.rt / 1000)
      else if (g0.style.transform) {
        g0.style.transform = ""
        g1.style.transform = ""
        g1.style.opacity = ""
      }
    }
    const w0 = this.q("w0", '[data-glow2="0"]'),
      w1 = this.q("w1", '[data-glow2="1"]')
    if (w0 && w1) {
      if (amb) {
        const r = w0.getBoundingClientRect()
        if (r.bottom > 0 && r.top < window.innerHeight) this.glow(w0, w1, this.rt / 1000 + 3.7)
      } else if (w0.style.transform) {
        w0.style.transform = ""
        w1.style.transform = ""
        w1.style.opacity = ""
      }
    }
    const px = this.q("px", "[data-parallax]")
    if (px) {
      if (amb) {
        const r = px.parentElement!.getBoundingClientRect()
        if (r.bottom > 0 && r.top < window.innerHeight) {
          const off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.07
          px.style.transform = "translate3d(0," + (off + Math.sin(now / 1500) * 6).toFixed(2) + "px,0)"
        }
      } else if (px.style.transform) px.style.transform = ""
    }
    if (amb) {
      const svg = this.q<SVGSVGElement>("flow", "[data-flow]")
      if (svg) {
        const r = svg.getBoundingClientRect()
        if (r.bottom > 0 && r.top < window.innerHeight)
          svg.querySelectorAll<SVGCircleElement>("[data-dot]").forEach((c) => {
            const p = svg.querySelector<SVGPathElement>("#" + c.dataset.path)
            if (!p) return
            const L = p.getTotalLength()
            const u = (now / (+(c.dataset.dur || 0) || 3600) + +(c.dataset.off || 0)) % 1,
              pt = p.getPointAtLength(u * L)
            c.setAttribute("cx", pt.x.toFixed(1))
            c.setAttribute("cy", pt.y.toFixed(1))
            c.setAttribute("opacity", Math.min(1, Math.min(u, 1 - u) * 8).toFixed(2))
          })
      }
    }
  }
}
