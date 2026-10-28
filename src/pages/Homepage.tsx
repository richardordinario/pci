// Ported from Claude Design: "Homepage built with motion and placeholders" /
// Homepage v2.dc.html. The markup below is generated from the design template
// so every inline style matches the source exactly; logic mirrors renderVals().
import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { FeatureIcon } from "@/components/ui/feature-icon"
import { Icon } from "@/components/ui/icon"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { ImageSlot } from "@/components/image-slot"
import { HomepageMotion } from "@/lib/homepage-motion"
import { PARTNERS, PROJECTS, PKGS, SECTORS, STEPS, TIMELINE } from "@/pages/homepage-data"

// Tweakable props of the design (data-props), with the same defaults.
export type HomepageProps = {
  showSolutions?: boolean
  showRover?: boolean
  showCoursera?: boolean
  showJourney?: boolean
  showMission?: boolean
  showAccreditations?: boolean
  ambientMotion?: boolean
  rippleSpeed?: number
}

type Form = { name: string; email: string; phone: string; org: string }
type Errs = Partial<Record<keyof Form, string>>
const EMPTY_FORM: Form = { name: "", email: "", phone: "", org: "" }

const mobileNow = () => typeof window !== "undefined" && window.innerWidth < 960
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

export default function Homepage({
  showSolutions = false,
  showRover = false,
  showCoursera = false,
  showJourney = false,
  showMission = false,
  showAccreditations = false,
  ambientMotion = true,
  rippleSpeed = 1,
}: HomepageProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const motion = useRef<HomepageMotion | null>(null)

  const [pkg, setPkg] = useState(0)
  const [acc, setAcc] = useState(0)
  const [solOpen, setSolOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(mobileNow)
  const [bookOpen, setBookOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [errs, setErrs] = useState<Errs>({})
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const honeypot = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 960
      setIsMobile(m)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
        setSolOpen(false)
      }
    }
    window.addEventListener("resize", onResize)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  // The source closes the Solutions dropdown whenever the breakpoint flips.
  useEffect(() => setSolOpen(false), [isMobile])

  useEffect(() => {
    const m = new HomepageMotion(rootRef.current!, { ambientMotion, rippleSpeed })
    motion.current = m
    m.start()
    // Entrance states are set, so the page can be shown (see the boot gate in index.html).
    document.documentElement.removeAttribute("data-boot")
    return () => {
      m.destroy()
      motion.current = null
    }
    // Registered once on mount, exactly like componentDidMount in the source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    motion.current?.setOptions({ ambientMotion, rippleSpeed })
  }, [ambientMotion, rippleSpeed])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    if (menuOpen) motion.current?.animateMenu()
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const openBook = useCallback(() => {
    setBookOpen(true)
    setMenuOpen(false)
    setSolOpen(false)
    setSent(false)
    setErrs({})
    setSendError("")
  }, [])

  const go = (id: string) => () => {
    setMenuOpen(false)
    setSolOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 96,
      behavior: reducedMotion() ? "auto" : "smooth",
    })
  }

  const setF = (k: keyof Form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrs((e) => ({ ...e, [k]: "" }))
  }

  const submitBook = async (e?: FormEvent) => {
    e?.preventDefault()
    if (sending) return
    const f = form,
      next: Errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) next.email = "Enter a valid email address."
    if (f.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number."
    if (!f.org.trim()) next.org = "Enter your organization."
    if (Object.keys(next).length) {
      setErrs(next)
      return
    }
    setSending(true)
    setSendError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, website: honeypot.current?.value ?? "" }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (body.errors) setErrs(body.errors)
        else setSendError(body.error || "We couldn't send your request. Please try again.")
        return
      }
      setSent(true)
      setErrs({})
      setForm(EMPTY_FORM)
    } catch {
      setSendError("We couldn't send your request. Please check your connection and try again.")
    } finally {
      setSending(false)
    }
  }

  // ---- renderVals() ----
  const isDesktop = !isMobile
  const openSol = () => setSolOpen(true)
  const closeSol = () => setSolOpen(false)
  const toggleSol = () => setSolOpen((x) => !x)
  const openMenu = () => setMenuOpen(true)
  const closeMenu = () => setMenuOpen(false)
  const closeBook = () => setBookOpen(false)
  const goContact = openBook
  const goRover = openBook
  const goRoverSection = showRover ? go("rover") : openBook
  const goSolutions = go(showSolutions ? "solutions" : "serve")
  const goCoursera = showCoursera ? go("coursera") : go("solutions")
  const goInfra = go("infrastructure")
  const showAccredDesktop = showAccreditations && !isMobile
  const showAccredMobile = showAccreditations && isMobile
  const showFooterCta = false
  const notSent = !sent

  const serveRowGap = isMobile ? "56px" : "0px"
  const sectors = SECTORS.map((x, i) => {
    const L = [
      { w: "47%", mt: "0px", ml: "0px", ar: "4/3" },
      { w: "47%", mt: "160px", ml: "0px", ar: "4/3.4" },
      { w: "58%", mt: "96px", ml: "21%", ar: "16/9" },
    ][i]
    const m = isMobile
    return { ...x, delay: String(i * 180), w: m ? "100%" : L.w, mt: m ? "0px" : L.mt, ml: m ? "0px" : L.ml, ar: m ? "4/3" : L.ar }
  })

  const pkgH = isMobile ? "auto" : "300px"
  const pkgs = PKGS.map((x, i) => {
    const open = pkg === i,
      mob = isMobile
    return {
      ...x,
      openStr: (open ? "true" : "false") as "true" | "false",
      enter: () => {
        if (pkg !== i) setPkg(i)
      },
      flex: mob ? "none" : open ? "2.4 1 0%" : "1 1 0%",
      h: mob ? (open ? "260px" : "96px") : "100%",
      ml: mob || i === 0 ? "0px" : "-28px",
      z: String(i + 1),
      cop: open ? "1" : "0",
      cty: open ? "0px" : "16px",
      cdel: open ? "180ms" : "0ms",
    }
  })

  const accDir = isMobile ? "column" : "row"
  const accGap = isMobile ? "12px" : "0px"
  const accH = isMobile ? "auto" : "clamp(340px,32vw,420px)"
  const PAL = [
    ["#262626", "#FFFFFF", "#7CC243"],
    ["#7CC243", "#262626", "#FFFFFF"],
    ["#4A4A4A", "#FFFFFF", "#C5E89A"],
    ["#EAF5D9", "#262626", "#7CC243"],
  ]
  const steps = STEPS.map((x, i) => {
    const open = acc === i,
      mob = isMobile,
      pal = PAL[i]
    return {
      ...x,
      bg: pal[0],
      fg: pal[1],
      num: pal[2],
      openStr: (open ? "true" : "false") as "true" | "false",
      label: "Step " + x.n + ": " + x.t,
      enter: () => {
        if (acc !== i) setAcc(i)
      },
      flex: mob ? "none" : open ? "3.2 1 0%" : "1 1 0%",
      h: mob ? (open ? "320px" : "96px") : "100%",
      ml: mob || i === 0 ? "0px" : "-28px",
      z: String(i + 1),
      cop: open ? "1" : "0",
      cty: open ? "0px" : "16px",
      cdel: open ? "180ms" : "0ms",
    }
  })

  const timeline = TIMELINE
  const partnersGrid = PARTNERS.slice(0, 16)
  const pfCols = isMobile ? "1fr" : "repeat(12, minmax(0, 1fr))"
  const pfRow = isMobile ? "280px" : "260px"
  const projects = PROJECTS.map((p, i) => {
    const m = isMobile
    const L = [
      ["1 / span 7", "span 2", "32px"],
      ["8 / span 5", "span 1", "22px"],
      ["8 / span 5", "span 1", "22px"],
      ["1 / span 4", "span 1", "20px"],
      ["5 / span 4", "span 1", "20px"],
      ["9 / span 4", "span 1", "20px"],
    ][i]
    return { ...p, num: String(i + 1).padStart(2, "0"), col: m ? "auto" : L[0], row: m ? "auto" : L[1], fs: m ? "22px" : L[2] }
  })

  const f_name = form.name,
    f_email = form.email,
    f_phone = form.phone,
    f_org = form.org
  const set_name = setF("name"),
    set_email = setF("email"),
    set_phone = setF("phone"),
    set_org = setF("org")
  const e_email = errs.email || "",
    e_phone = errs.phone || "",
    e_org = errs.org || ""

  return (
    <div ref={rootRef} style={{ fontFamily: "var(--font-body)", color: "var(--near-black)", background: "var(--white)", overflowX: "clip" }}>

    <div data-progress="" aria-hidden="true" style={{ position: "fixed", top: "0", left: "0", right: "0", height: "3px", background: "var(--pci-green)", transform: "scaleX(0)", transformOrigin: "left", zIndex: "80" }}></div>

    <header data-nav="" style={{ position: "fixed", top: "0", left: "0", right: "0", zIndex: "70", borderBottom: "1px solid transparent", '--nav-fg': "#FFFFFF", transition: "background 500ms cubic-bezier(0.22,1,0.36,1),border-color 500ms cubic-bezier(0.22,1,0.36,1),backdrop-filter 500ms cubic-bezier(0.22,1,0.36,1)" } as CSSProperties}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "104px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", boxSizing: "border-box" }}>
        <a href="#top" aria-label="PCI Tech Center home" style={{ display: "flex", padding: "6px 0" }}>
          <span data-logo="" style={{ position: "relative", display: "block", width: "120px" }}><img data-logo-w="" src="assets/pci-logo-white.png" alt="PCI Tech Center" style={{ width: "120px", height: "auto", display: "block", transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1)" }} /><img data-logo-c="" src="assets/pci-logo.png" alt="" aria-hidden="true" style={{ position: "absolute", inset: "0", width: "120px", height: "auto", display: "block", opacity: "0", transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1)" }} /></span>
        </a>
        {isDesktop && (<>
          <nav aria-label="Primary" style={{ display: "flex", alignItems: "center", gap: "28px", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "15px" }}>
            <div onMouseEnter={openSol} onMouseLeave={closeSol} style={{ position: "relative" }}>
              <button data-arrow="no" type="button" aria-haspopup="true" aria-expanded={solOpen} onClick={toggleSol} style={{ display: "flex", alignItems: "center", gap: "6px", height: "44px", padding: "0", background: "none", border: "0", font: "inherit", color: "var(--nav-fg)", transition: "color 500ms cubic-bezier(0.22,1,0.36,1)", cursor: "pointer" }}>Solutions<Icon name="chevron-down" size={16}></Icon></button>
              {solOpen && (<>
                <div style={{ position: "absolute", top: "100%", left: "-16px", paddingTop: "10px", width: "320px" }}>
                  <div style={{ background: "var(--white)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-3)", padding: "8px", display: "flex", flexDirection: "column", gap: "2px", fontFamily: "var(--font-body)", fontWeight: "500", fontSize: "15px" }}>
                    <a className="hv-tint" href="#solutions" onClick={closeSol} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", color: "var(--near-black)", textDecoration: "none" }}><span style={{ color: "var(--green-text)", display: "flex" }}><Icon name="code-xml" size={20}></Icon></span>Software Development</a>
                    <a className="hv-tint" href="#rover" onClick={closeSol} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", color: "var(--near-black)", textDecoration: "none" }}><span style={{ color: "var(--green-text)", display: "flex" }}><Icon name="cloud" size={20}></Icon></span>SaaS / Rover</a>
                    <a className="hv-tint" href="#solutions" onClick={closeSol} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", color: "var(--near-black)", textDecoration: "none" }}><span style={{ color: "var(--green-text)", display: "flex" }}><Icon name="graduation-cap" size={20}></Icon></span>Training Solutions</a>
                    <a className="hv-tint" href="#infrastructure" onClick={closeSol} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "8px", color: "var(--near-black)", textDecoration: "none" }}><span style={{ color: "var(--green-text)", display: "flex" }}><Icon name="server" size={20}></Icon></span>Digital Infrastructure</a>
                  </div>
                </div>
              </>)}
            </div>
            {showCoursera && (<><a className="hv-nav" href="#coursera" style={{ color: "var(--nav-fg)", textDecoration: "none", padding: "12px 0", transition: "color 500ms cubic-bezier(0.22,1,0.36,1)" }}>Coursera Partnership</a></>)}
            <a className="hv-nav" href="#about" style={{ color: "var(--nav-fg)", textDecoration: "none", padding: "12px 0", transition: "color 500ms cubic-bezier(0.22,1,0.36,1)" }}>About</a>
            <a className="hv-nav" href="#insights" style={{ color: "var(--nav-fg)", textDecoration: "none", padding: "12px 0", transition: "color 500ms cubic-bezier(0.22,1,0.36,1)" }}>Insights</a>
            <a className="hv-nav" href="#contact" style={{ color: "var(--nav-fg)", textDecoration: "none", padding: "12px 0", transition: "color 500ms cubic-bezier(0.22,1,0.36,1)" }}>Contact</a>
            <Button iconRight="arrow-right" onClick={goContact}>Book a Demo</Button>
          </nav>
        </>)}
        {isMobile && (<>
          <button data-arrow="no" type="button" aria-label="Open menu" onClick={openMenu} style={{ width: "48px", height: "48px", display: "grid", placeItems: "center", background: "var(--pci-green)", color: "var(--white)", border: "0", borderRadius: "var(--radius-sm)", cursor: "pointer" }}><Icon name="menu" size={22}></Icon></button>
        </>)}
      </div>
    </header>

    {menuOpen && (<>
      <div role="dialog" aria-modal="true" aria-label="Menu" style={{ position: "fixed", inset: "0", zIndex: "90", background: "var(--white)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ height: "104px", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: "0" }}>
          <img src="assets/pci-logo.png" alt="PCI Tech Center" style={{ width: "120px", height: "auto" }} />
          <button data-arrow="no" type="button" aria-label="Close menu" onClick={closeMenu} style={{ width: "48px", height: "48px", display: "grid", placeItems: "center", background: "var(--off-white)", color: "var(--near-black)", border: "0", borderRadius: "var(--radius-sm)", cursor: "pointer" }}><Icon name="x" size={22}></Icon></button>
        </div>
        <nav aria-label="Mobile" style={{ padding: "16px 24px 40px", display: "flex", flexDirection: "column", gap: "4px", fontFamily: "var(--font-heading)" }}>
          <div data-mlink="" style={{ fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--green-text)", padding: "8px 0" }}>Solutions</div>
          <a data-mlink="" href="#solutions" onClick={closeMenu} style={{ fontSize: "20px", fontWeight: "600", color: "var(--near-black)", textDecoration: "none", padding: "10px 0 10px 16px", borderLeft: "2px solid var(--gray-rule)" }}>Software Development</a>
          <a data-mlink="" href="#rover" onClick={closeMenu} style={{ fontSize: "20px", fontWeight: "600", color: "var(--near-black)", textDecoration: "none", padding: "10px 0 10px 16px", borderLeft: "2px solid var(--gray-rule)" }}>SaaS / Rover</a>
          <a data-mlink="" href="#solutions" onClick={closeMenu} style={{ fontSize: "20px", fontWeight: "600", color: "var(--near-black)", textDecoration: "none", padding: "10px 0 10px 16px", borderLeft: "2px solid var(--gray-rule)" }}>Training Solutions</a>
          <a data-mlink="" href="#infrastructure" onClick={closeMenu} style={{ fontSize: "20px", fontWeight: "600", color: "var(--near-black)", textDecoration: "none", padding: "10px 0 10px 16px", borderLeft: "2px solid var(--gray-rule)" }}>Digital Infrastructure</a>
          {showCoursera && (<><a data-mlink="" href="#coursera" onClick={closeMenu} style={{ fontSize: "32px", fontWeight: "700", color: "var(--near-black)", textDecoration: "none", padding: "14px 0", marginTop: "12px", borderTop: "1px solid var(--gray-rule)" }}>Coursera Partnership</a></>)}
          <a data-mlink="" href="#about" onClick={closeMenu} style={{ fontSize: "32px", fontWeight: "700", color: "var(--near-black)", textDecoration: "none", padding: "14px 0" }}>About</a>
          <a data-mlink="" href="#insights" onClick={closeMenu} style={{ fontSize: "32px", fontWeight: "700", color: "var(--near-black)", textDecoration: "none", padding: "14px 0" }}>Insights</a>
          <a data-mlink="" href="#contact" onClick={closeMenu} style={{ fontSize: "32px", fontWeight: "700", color: "var(--near-black)", textDecoration: "none", padding: "14px 0" }}>Contact</a>
          <div data-mlink="" style={{ marginTop: "20px" }}><Button size="lg" fullWidth={true} iconRight="arrow-right" onClick={goContact}>Book a Demo</Button></div>
        </nav>
      </div>
    </>)}

    <main>

    <section id="top" data-screen-label="01 Hero" style={{ position: "relative", overflow: "hidden", background: "var(--near-black)", color: "var(--white)", padding: "104px 24px clamp(56px,10vh,120px)", minHeight: "max(760px,100vh)", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div data-glow="0" aria-hidden="true" style={{ position: "absolute", inset: "-8%", pointerEvents: "none", willChange: "transform", background: "radial-gradient(ellipse min(620px,62vw) min(560px,56vw) at 50% min(500px,46vh),rgba(124,194,67,.95) 0%,rgba(124,194,67,.6) 32%,rgba(124,194,67,.22) 62%,rgba(124,194,67,0) 100%)" }}></div>
      <div data-glow="1" aria-hidden="true" style={{ position: "absolute", inset: "-8%", pointerEvents: "none", willChange: "transform", background: "radial-gradient(ellipse min(300px,30vw) min(280px,28vw) at 50% min(470px,42vh),rgba(197,232,154,.8) 0%,rgba(197,232,154,0) 100%)" }}></div>
      <div aria-hidden="true" style={{ position: "absolute", inset: "0", pointerEvents: "none", background: "radial-gradient(ellipse 85% 75% at 50% 42%,rgba(38,38,38,0) 50%,rgba(38,38,38,.9) 100%)" }}></div>
      <div aria-hidden="true" style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "34%", pointerEvents: "none", background: "linear-gradient(180deg,rgba(38,38,38,0) 0%,rgba(38,38,38,.7) 60%,#262626 100%)" }}></div>
      {isDesktop && (<>
        <div data-reveal="" data-delay="250" style={{ position: "absolute", left: "50%", bottom: "0", width: "min(66vw,980px)", marginLeft: "calc(min(66vw,980px) / -2)", zIndex: "2", pointerEvents: "none" }}>
          <img src="assets/hero-duo.webp" width={1448} height={1086} fetchPriority="high" alt="Two PCI Tech Center trainers in branded polo shirts using VR headsets and controllers" style={{ width: "100%", height: "auto", display: "block", WebkitMaskImage: "linear-gradient(180deg,#000 62%,transparent 98%)", maskImage: "linear-gradient(180deg,#000 62%,transparent 98%)" }} />
        </div>
      </>)}
      <div style={{ position: "relative", maxWidth: "1280px", width: "100%", margin: "0 auto", flex: "1", display: "flex", flexDirection: "column" }}>
        <div data-hero-h="" style={{ position: "relative", zIndex: "1", pointerEvents: "none" }}>
          <h1 aria-label="Simplify Learning." style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "900", fontSize: "clamp(84px,20.5vw,290px)", lineHeight: ".86", letterSpacing: "-.055em", color: "var(--white)", textAlign: "center", overflow: "hidden", padding: ".12em 0 .04em", marginTop: "clamp(4px,1.5vw,24px)" }}>
            <span data-word="" aria-hidden="true" style={{ display: "inline-block" }}>Simplify</span>
          </h1>
        </div>
        {isMobile && (<>
          <div data-reveal="" data-delay="250" style={{ position: "relative", zIndex: "2", margin: "-27vw -24px 0" }}>
            <img src="assets/hero-duo.webp" width={1448} height={1086} fetchPriority="high" alt="Two PCI Tech Center trainers in branded polo shirts using VR headsets and controllers" style={{ width: "100%", height: "auto", display: "block", WebkitMaskImage: "linear-gradient(180deg,#000 62%,transparent 98%)", maskImage: "linear-gradient(180deg,#000 62%,transparent 98%)" }} />
          </div>
        </>)}
        <div style={{ position: "relative", zIndex: "3", marginTop: "auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "32px", paddingTop: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "22px", maxWidth: "380px" }}>
            <div data-reveal="" data-delay="450" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 14px 6px 6px", border: "1px solid var(--gray-medium)", borderRadius: "999px", background: "var(--near-black)" }}>
              <FeatureIcon icon="users" size={32} variant="green"></FeatureIcon>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}><span style={{ fontSize: "13px", fontWeight: "600" }}>10,000+ users</span><span style={{ fontSize: "11px", color: "var(--gray-rule)" }}>on platforms we scale</span></span>
            </div>
            <div aria-hidden="true" style={{ position: "relative", display: "inline-block", overflow: "hidden", paddingBottom: "16px" }}>
              <span data-word="" style={{ display: "inline-block", fontFamily: "var(--font-heading)", fontWeight: "500", fontSize: "clamp(52px,6.4vw,92px)", lineHeight: "1", letterSpacing: "-.04em", color: "var(--white)" }}>Learning.</span>
            </div>
            <div data-reveal="" data-delay="650" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", width: "100%", maxWidth: "480px" }}>
              <Button size="lg" variant="outlineInverse" onClick={goSolutions} fullWidth={true}>Explore Our Solutions</Button>
              <Button size="lg" iconRight="arrow-right" onClick={goRover} fullWidth={true}>Book a Rover Demo</Button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "min(100%,330px)" }}>
            <div data-reveal="" data-delay="500" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "var(--white)", textWrap: "pretty" }}>We help schools, government agencies, and enterprises modernize learning and operations with custom software, SaaS platforms, managed training, and digital infrastructure, all under one roof.</p>
              <a className="hv-green" href="#contact" style={{ fontSize: "14px", fontWeight: "500", color: "var(--white)", textDecoration: "underline", textDecorationColor: "var(--pci-green)", textUnderlineOffset: "5px", padding: "6px 0", alignSelf: "flex-start" }}>How can we help you?</a>
            </div>
            <div data-reveal="" data-delay="700" style={{ background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-lg)", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "20px", lineHeight: "1.2", color: "var(--white)" }}>Contact by Email</h2>
              <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "var(--gray-rule)" }}>Enter your email and our team will reach out.</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <a className="hv-fb" href="#" aria-label="PCI Tech Center on Facebook" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--pci-green)", display: "grid", placeItems: "center", color: "var(--white)" }}><Icon name="facebook" size={18}></Icon></a>
                <a className="hv-social" href="#" aria-label="PCI Tech Center on LinkedIn" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--gray-medium)", display: "grid", placeItems: "center", color: "var(--white)" }}><Icon name="linkedin" size={18}></Icon></a>
                <a className="hv-social" href="mailto:info@pcitech.com.ph" aria-label="Email PCI Tech Center" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--gray-medium)", display: "grid", placeItems: "center", color: "var(--white)" }}><Icon name="mail" size={18}></Icon></a>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", borderTop: "1px solid var(--gray-medium)", paddingTop: "14px" }}>
                <div style={{ flex: "1", minWidth: "0" }}><Input type="email" placeholder="Your email" value={f_email} onChange={set_email}></Input></div>
                <IconButton icon="arrow-right" label="Send" variant="primary" onClick={goContact}></IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section data-screen-label="02 Statement" aria-label="About PCI Tech Center" style={{ background: "var(--near-black)", color: "var(--white)", padding: "24px 24px 96px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-xl)", padding: "clamp(28px,5vw,64px)", display: "flex", flexDirection: "column", gap: "72px", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "40px" }}>
          <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "300px" }}>
            <span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="globe" size={28}></Icon></span>
            <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-rule)" }}>Serving academe, government, and industry across the Philippines.</p>
          </div>
          <p data-statement="" style={{ gridColumn: "span 2", margin: "0", fontFamily: "var(--font-heading)", fontWeight: "500", fontSize: "clamp(26px,3.3vw,46px)", lineHeight: "1.22", letterSpacing: "-.015em", display: "flex", flexWrap: "wrap" }}><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>We</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>are</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>a</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>Filipino</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>EdTech</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>and</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>software</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>partner.</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>We</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>help</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>schools,</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>agencies,</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>and</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>enterprises</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--pci-green)" }}>simplify</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--pci-green)" }}>learning</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>and</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>run</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>better</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>operations,</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>all</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>under</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>one</span><span data-sw="" style={{ display: "inline-block", marginRight: ".26em", color: "var(--white)" }}>roof.</span></p>
        </div>
        <div data-stagger="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", containerType: "inline-size", minWidth: "0" }}><div data-count="2018" data-from="2000" style={{ fontFamily: "var(--font-heading)", fontWeight: "500", fontSize: "min(96px,22cqi)", lineHeight: "1", letterSpacing: "-.04em", color: "var(--white)", whiteSpace: "nowrap" }}>2018</div><div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", color: "var(--gray-rule)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--pci-green)", flexShrink: "0" }}></span>Founded in Intramuros, Manila</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", containerType: "inline-size", minWidth: "0" }}><div data-count="8" data-suffix="+" style={{ fontFamily: "var(--font-heading)", fontWeight: "500", fontSize: "min(96px,22cqi)", lineHeight: "1", letterSpacing: "-.04em", color: "var(--white)", whiteSpace: "nowrap" }}>8+</div><div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", color: "var(--gray-rule)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--pci-green)", flexShrink: "0" }}></span>Years building learning technology</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", containerType: "inline-size", minWidth: "0" }}><div data-count="10000" data-suffix="+" style={{ fontFamily: "var(--font-heading)", fontWeight: "500", fontSize: "min(96px,22cqi)", lineHeight: "1", letterSpacing: "-.04em", color: "var(--white)", whiteSpace: "nowrap" }}>10,000+</div><div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", color: "var(--gray-rule)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--pci-green)", flexShrink: "0" }}></span>Users our platforms scale to</div></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", containerType: "inline-size", minWidth: "0" }}><div data-count="4" style={{ fontFamily: "var(--font-heading)", fontWeight: "500", fontSize: "min(96px,22cqi)", lineHeight: "1", letterSpacing: "-.04em", color: "var(--white)", whiteSpace: "nowrap" }}>4</div><div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", color: "var(--gray-rule)" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--pci-green)", flexShrink: "0" }}></span>Integrated service pillars</div></div>
        </div>
      </div>
    </section>

    <section id="why" data-screen-label="03 Why Choose Us" style={{ background: "var(--near-black)", color: "var(--white)", padding: "104px 24px 0", overflowX: "clip", scrollMarginTop: "96px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: "16px", alignItems: "center" }}>
        <div style={{ position: "relative", zIndex: "3", display: "flex", flexDirection: "column", gap: "36px", justifySelf: "start", width: "calc(100% + clamp(0px, (100vw - 960px) * 0.45, 220px))", maxWidth: "800px", textShadow: "0 2px 18px rgba(38,38,38,.55)" }}>
          <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pci-green)" }}>Why Choose Us</div>
            <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(36px,4.4vw,56px)", lineHeight: "1.08", letterSpacing: "-.02em", color: "var(--white)", textWrap: "balance" }}>Why Choose PCI Tech Center?</h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", color: "var(--gray-rule)", maxWidth: "680px", textWrap: "pretty" }}>Transforming learning with technology, tailored to your organization, and driven by results.</p>
          </div>
          <div data-reveal="" data-delay="120" style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: "500", fontSize: "clamp(88px,10vw,140px)", lineHeight: ".85", letterSpacing: "-.05em", color: "var(--white)" }}><span style={{ fontSize: ".34em", fontWeight: "600", letterSpacing: "-.01em", verticalAlign: "top", lineHeight: "1.4", marginRight: ".08em", color: "var(--gray-rule)" }}>Over</span><span data-count="8">8</span><span style={{ color: "var(--pci-green)" }}>+</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "380px" }}><span style={{ fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "22px", color: "var(--white)" }}>Years</span><span style={{ fontSize: "16px", lineHeight: "1.5", color: "var(--gray-rule)" }}>Of building learning technology with the institutions we serve.</span></div>
          </div>
          <div data-stagger="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "24px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "18px", borderTop: "1px solid var(--gray-medium)" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="award" size={24}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", color: "var(--white)" }}>Proven Expertise</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-rule)" }}>Years of experience delivering impactful EdTech solutions.</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "18px", borderTop: "1px solid var(--gray-medium)" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="lightbulb" size={24}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", color: "var(--white)" }}>Innovative Solutions</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-rule)" }}>Immersive technologies and interactive content that boost engagement.</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "18px", borderTop: "1px solid var(--gray-medium)" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="sliders-horizontal" size={24}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", color: "var(--white)" }}>Tailored Approach</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-rule)" }}>Custom solutions designed for your unique goals.</p></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "18px", borderTop: "1px solid var(--gray-medium)" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="life-buoy" size={24}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", color: "var(--white)" }}>Full Support</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-rule)" }}>From deployment to training, we equip teams with future-ready skills.</p></div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginRight: "calc(-1 * max(24px, (100vw - 1280px) / 2))", minWidth: "0", alignSelf: "stretch" }}>
          <div style={{ position: "relative", flex: "1", minHeight: "clamp(480px,56vw,820px)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
            <div data-glow2="0" aria-hidden="true" style={{ position: "absolute", inset: "-8%", pointerEvents: "none", willChange: "transform", background: "radial-gradient(ellipse 46% 40% at 60% 46%,rgba(124,194,67,.95) 0%,rgba(124,194,67,.6) 32%,rgba(124,194,67,.22) 62%,rgba(124,194,67,0) 100%)" }}></div>
            <div data-glow2="1" aria-hidden="true" style={{ position: "absolute", inset: "-8%", pointerEvents: "none", willChange: "transform", background: "radial-gradient(ellipse 22% 20% at 60% 40%,rgba(197,232,154,.8) 0%,rgba(197,232,154,0) 100%)" }}></div>
            <div data-reveal="" data-delay="100" style={{ position: "relative", width: "min(92%,680px)" }}><div data-bubble="" data-phase="5"><img src="assets/visor-portrait-v2.webp" width={720} height={858} decoding="async" alt="PCI Tech Center learner wearing a mixed-reality headset" loading="lazy" style={{ width: "100%", height: "auto", display: "block", WebkitMaskImage: "linear-gradient(180deg,#000 72%,transparent 100%)", maskImage: "linear-gradient(180deg,#000 72%,transparent 100%)" }} /></div></div>
            {showAccredDesktop && (<>
              <div style={{ position: "absolute", top: "8%", left: "0", width: "min(240px,36%)", zIndex: "2" }}><div data-reveal="" data-delay="300"><div data-bubble="" data-phase="0"><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="graduation-cap" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>Official Coursera Partner for the Philippines</span></div></div></div></div>
              <div style={{ position: "absolute", top: "26%", left: "0", width: "min(240px,36%)", zIndex: "2" }}><div data-reveal="" data-delay="440"><div data-bubble="" data-phase="1"><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="badge-check" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>PHILGEPS Platinum Accredited</span></div></div></div></div>
              <div style={{ position: "absolute", top: "62%", left: "0", width: "min(240px,36%)", zIndex: "2" }}><div data-reveal="" data-delay="580"><div data-bubble="" data-phase="2"><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="shield-check" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>NPC-Compliant Data Handling</span></div></div></div></div>
              <div style={{ position: "absolute", top: "80%", left: "0", width: "min(240px,36%)", zIndex: "2" }}><div data-reveal="" data-delay="720"><div data-bubble="" data-phase="3"><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="handshake" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>Exclusive PH Reseller of Kongsberg Digital</span></div></div></div></div>
            </>)}
          </div>
          {showAccredMobile && (<>
            <div data-stagger="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "12px", paddingRight: "24px" }}>
              <div><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="graduation-cap" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>Official Coursera Partner for the Philippines</span></div></div>
              <div><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="badge-check" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>PHILGEPS Platinum Accredited</span></div></div>
              <div><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="shield-check" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>NPC-Compliant Data Handling</span></div></div>
              <div><div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--near-black)", border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "12px 16px 12px 12px", boxShadow: "var(--shadow-3)" }}><FeatureIcon icon="handshake" size={40} variant="green"></FeatureIcon><span style={{ fontSize: "14px", lineHeight: "1.35", fontWeight: "600", color: "var(--white)" }}>Exclusive PH Reseller of Kongsberg Digital</span></div></div>
            </div>
          </>)}
        </div>
      </div>
      <div data-navbg="" style={{ margin: "0 -24px", paddingLeft: "24px", paddingRight: "24px", background: "var(--near-black)", paddingTop: "96px", paddingBottom: "104px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "40px", alignItems: "start" }}>
          <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pci-green)" }}>No One-Size-Fits-All</div>
            <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(28px,3vw,36px)", lineHeight: "1.15", letterSpacing: "-.01em", color: "var(--white)", textWrap: "balance" }}>Built Around Your Strategy, Not Ours.</h3>
            <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.6", color: "var(--gray-rule)", textWrap: "pretty" }}>Every organization is unique—so your digital learning solution should be, too. All four solution layers can be mixed and matched into:</p>
          </div>
          <div data-reveal="" style={{ display: "flex", flexDirection: accDir, gap: accGap, width: "100%", height: pkgH }}>
            {pkgs.map((p, p_i) => (<Fragment key={p_i}>
              <div role="button" tabIndex={0} aria-expanded={p.openStr} aria-label={p.t} onMouseEnter={p.enter} onFocus={p.enter} onClick={p.enter} style={{ position: "relative", flex: p.flex, minWidth: "0", height: p.h, marginLeft: p.ml, zIndex: p.z, borderRadius: "24px", background: p.bg, overflow: "hidden", cursor: "pointer", boxShadow: "-14px 0 28px rgba(38,38,38,.35)", transition: "flex 700ms cubic-bezier(0.22,1,0.36,1),height 700ms cubic-bezier(0.22,1,0.36,1)" }}>
                <div style={{ position: "absolute", top: "20px", right: "20px" }}><FeatureIcon icon={p.icon} size={64}></FeatureIcon></div>
                <div style={{ position: "absolute", left: "clamp(20px,3vw,32px)", top: "clamp(20px,3vw,32px)", width: "min(300px,calc(100vw - 140px))", display: "flex", flexDirection: "column", gap: "12px", opacity: p.cop, transform: `translateY(${p.cty})`, transition: `opacity 500ms cubic-bezier(0.22,1,0.36,1) ${p.cdel},transform 600ms cubic-bezier(0.22,1,0.36,1) ${p.cdel}`, pointerEvents: "none" }}>
                  <h4 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(24px,2.4vw,32px)", lineHeight: "1.1", letterSpacing: "-.02em", color: "var(--near-black)" }}>{p.t}</h4>
                  <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--near-black)", maxWidth: "280px" }}>{p.d}</p>
                </div>
                <div style={{ position: "absolute", left: "14px", bottom: "14px", display: "flex", alignItems: "center", gap: "10px", padding: "6px 16px 6px 6px", borderRadius: "999px", background: "rgba(38,38,38,.82)", maxWidth: "calc(100% - 28px)", boxSizing: "border-box" }}>
                  <FeatureIcon icon={p.icon} size={32} variant="green"></FeatureIcon>
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.2", minWidth: "0" }}><span style={{ fontFamily: "var(--font-heading)", fontSize: "9px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "#C5E89A" }}>{p.k}</span><span style={{ fontSize: "13px", fontWeight: "600", color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.t}</span></span>
                </div>
              </div>
            </Fragment>))}
          </div>
        </div>
        </div>
      </div>
      <div data-navbg="" style={{ margin: "0 -24px", paddingLeft: "24px", paddingRight: "24px", background: "var(--white)", paddingTop: "104px", paddingBottom: "104px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(40px,5vw,64px)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", maxWidth: "760px" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--green-text)" }}>From Consultation to Completion</div>
            <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(28px,3.4vw,44px)", lineHeight: "1.12", letterSpacing: "-.015em", color: "var(--near-black)", textWrap: "balance" }}>Start Your Project in Four Easy Steps</h3>
          </div>
          <div data-acc="" style={{ display: "flex", flexDirection: accDir, gap: accGap, width: "100%", maxWidth: "1200px", height: accH }}>
            {steps.map((s, s_i) => (<Fragment key={s_i}>
              <div role="button" tabIndex={0} aria-expanded={s.openStr} aria-label={s.label} onMouseEnter={s.enter} onFocus={s.enter} onClick={s.enter} style={{ position: "relative", flex: s.flex, minWidth: "0", height: s.h, marginLeft: s.ml, zIndex: s.z, borderRadius: "24px", background: s.bg, color: s.fg, overflow: "hidden", cursor: "pointer", boxShadow: "-14px 0 28px rgba(38,38,38,.22)", transition: "flex 700ms cubic-bezier(0.22,1,0.36,1),height 700ms cubic-bezier(0.22,1,0.36,1)" }}>
                <span aria-hidden="true" style={{ position: "absolute", top: "18px", right: "24px", fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "clamp(72px,8vw,128px)", lineHeight: "1", letterSpacing: "-.05em", color: s.num }}>{s.n}</span>
                <div style={{ position: "absolute", left: "clamp(20px,3vw,36px)", top: "clamp(20px,3vw,36px)", width: "min(380px,calc(100vw - 120px))", display: "flex", flexDirection: "column", gap: "14px", opacity: s.cop, transform: `translateY(${s.cty})`, transition: `opacity 500ms cubic-bezier(0.22,1,0.36,1) ${s.cdel},transform 600ms cubic-bezier(0.22,1,0.36,1) ${s.cdel}`, pointerEvents: "none" }}>
                  <h4 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(28px,3vw,40px)", lineHeight: "1.08", letterSpacing: "-.02em", color: s.fg }}>{s.t}</h4>
                  <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.55", color: s.fg, maxWidth: "340px" }}>{s.d}</p>
                </div>
                <div style={{ position: "absolute", left: "14px", bottom: "14px", display: "flex", alignItems: "center", gap: "10px", padding: "6px 16px 6px 6px", borderRadius: "999px", background: "rgba(38,38,38,.78)", maxWidth: "calc(100% - 28px)", boxSizing: "border-box" }}>
                  <FeatureIcon icon={s.icon} size={32} variant="green"></FeatureIcon>
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.2", minWidth: "0" }}><span style={{ fontFamily: "var(--font-heading)", fontSize: "9px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "#C5E89A" }}>Step {s.n}</span><span style={{ fontSize: "13px", fontWeight: "600", color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.t}</span></span>
                </div>
              </div>
            </Fragment>))}
          </div>
        </div>
        </div>
      </div>
    </section>







    {showSolutions && (<>
    <section id="solutions" data-screen-label="04 Pillars" style={{ background: "var(--off-white)", padding: "96px 24px", scrollMarginTop: "96px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div data-reveal="">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px", maxWidth: "760px", margin: "0 auto" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: "700", color: "var(--green-text)" }}>Our Solutions</div>
            <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontSize: "var(--fs-h2)", lineHeight: "var(--lh-h2)", letterSpacing: "var(--ls-h2)", fontWeight: "700", color: "var(--near-black)", textWrap: "balance" }}>Our Integrated Learning Ecosystem</h2>
            <p style={{ margin: "0", fontFamily: "var(--font-body)", fontSize: "var(--fs-lead)", lineHeight: "var(--lh-lead)", color: "var(--gray-medium)", textWrap: "pretty" }}>Four Core Solutions, One Seamless Experience</p>
          </div>
        </div>
        <div data-stagger="" style={{ marginTop: "56px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "20px" }}>
          <div data-pillar="" style={{ display: "flex" }}>
            <Card interactive={true} padding={28} onClick={goSolutions} style={{ width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "280px" }}>
                <div data-bar="" style={{ height: "6px", borderRadius: "3px", background: "var(--pci-green)", transform: "scaleX(.22)", transformOrigin: "left" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div data-draw="" style={{ display: "flex" }}><FeatureIcon icon="code-xml" size={56}></FeatureIcon></div><span style={{ fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "14px", color: "var(--gray-medium)" }}>01</span></div>
                <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "21px", lineHeight: "1.2" }}>Software Development</h3>
                <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-medium)" }}>Interactive learning assets including videos, gamified modules, 360°/AR/VR simulations, and global content through our Coursera partnership.</p>
                <span style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "14px" }}>Learn more<Icon name="arrow-right" size={16}></Icon></span>
              </div>
            </Card>
          </div>
          <div data-pillar="" style={{ display: "flex" }}>
            <Card interactive={true} padding={28} onClick={goRoverSection} style={{ width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "280px" }}>
                <div data-bar="" style={{ height: "6px", borderRadius: "3px", background: "var(--pci-green)", transform: "scaleX(.22)", transformOrigin: "left" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div data-draw="" style={{ display: "flex" }}><FeatureIcon icon="cloud" size={56}></FeatureIcon></div><span style={{ fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "14px", color: "var(--gray-medium)" }}>02</span></div>
                <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "21px", lineHeight: "1.2" }}>SaaS (Rover)</h3>
                <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-medium)" }}>Web, mobile, and desktop platforms—custom-built or off-the-shelf—anchored by our tech expertise for learner-centered delivery.</p>
                <span style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "14px" }}>Learn more<Icon name="arrow-right" size={16}></Icon></span>
              </div>
            </Card>
          </div>
          <div data-pillar="" style={{ display: "flex" }}>
            <Card interactive={true} padding={28} onClick={goCoursera} style={{ width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "280px" }}>
                <div data-bar="" style={{ height: "6px", borderRadius: "3px", background: "var(--pci-green)", transform: "scaleX(.22)", transformOrigin: "left" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div data-draw="" style={{ display: "flex" }}><FeatureIcon icon="graduation-cap" size={56}></FeatureIcon></div><span style={{ fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "14px", color: "var(--gray-medium)" }}>03</span></div>
                <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "21px", lineHeight: "1.2" }}>Training Solutions</h3>
                <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-medium)" }}>Custom or off-the-shelf programs delivered asynchronously, synchronously, or via hybrid modalities to build critical skills.</p>
                <span style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "14px" }}>Learn more<Icon name="arrow-right" size={16}></Icon></span>
              </div>
            </Card>
          </div>
          <div data-pillar="" style={{ display: "flex" }}>
            <Card interactive={true} padding={28} onClick={goInfra} style={{ width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", minHeight: "280px" }}>
                <div data-bar="" style={{ height: "6px", borderRadius: "3px", background: "var(--pci-green)", transform: "scaleX(.22)", transformOrigin: "left" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div data-draw="" style={{ display: "flex" }}><FeatureIcon icon="server" size={56}></FeatureIcon></div><span style={{ fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "14px", color: "var(--gray-medium)" }}>04</span></div>
                <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "21px", lineHeight: "1.2" }}>Digital Infrastructure</h3>
                <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-medium)" }}>Deployment-ready servers, secure networks, simulators, and hardware kits designed to power your digital learning environment.</p>
                <span style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "14px" }}>Learn more<Icon name="arrow-right" size={16}></Icon></span>
              </div>
            </Card>
          </div>
        </div>

        <div id="infrastructure" style={{ marginTop: "72px", scrollMarginTop: "120px", background: "var(--white)", borderRadius: "var(--radius-lg)", padding: "clamp(28px,4vw,56px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "40px", alignItems: "center" }}>
          <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--green-text)" }}>Digital Infrastructure</div>
            <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(26px,3vw,34px)", lineHeight: "1.15", letterSpacing: "-.01em", textWrap: "balance" }}>From Simulation Labs to Smart Campuses</h3>
            <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.6", color: "var(--gray-medium)", textWrap: "pretty" }}>We plan, deploy, and support the physical layer of learning. Simulation laboratories, campus networks, and connected smart-campus systems work as one.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "16px" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="circle-check" size={20}></Icon></span>Simulation and computer laboratories</div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "16px" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="circle-check" size={20}></Icon></span>Campus networking and cloud infrastructure</div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "16px" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="circle-check" size={20}></Icon></span>Smart campus deployments</div>
            </div>
          </div>
          <div data-reveal="" data-delay="150">
            <svg data-flow="" viewBox="0 0 560 380" role="img" aria-label="Isometric diagram of a laboratory, a network hub, and a smart campus connected by data lines" style={{ width: "100%", height: "auto", display: "block" }}>
              <polygon points="280,105 530,230 280,355 30,230" fill="#F2F2F2" stroke="#CCCCCC" strokeWidth="1"></polygon>
              <path id="fl1" d="M170 215 L280 160" fill="none" stroke="#7CC243" strokeWidth="2" strokeDasharray="4 6"></path>
              <path id="fl2" d="M280 170 L390 225" fill="none" stroke="#7CC243" strokeWidth="2" strokeDasharray="4 6"></path>
              <path id="fl3" d="M170 215 L270 265 L390 205" fill="none" stroke="#7CC243" strokeWidth="2" strokeDasharray="4 6"></path>
              <path id="fl4" d="M390 235 L470 275" fill="none" stroke="#7CC243" strokeWidth="2" strokeDasharray="4 6"></path>
              <path id="fl5" d="M170 215 L90 255" fill="none" stroke="#7CC243" strokeWidth="2" strokeDasharray="4 6"></path>
              <circle cx="470" cy="275" r="7" fill="#FFFFFF" stroke="#262626" strokeWidth="1.5"></circle>
              <circle cx="90" cy="255" r="7" fill="#FFFFFF" stroke="#262626" strokeWidth="1.5"></circle>
              <circle data-dot="" data-path="fl1" data-off="0" data-dur="3200" cx="170" cy="215" r="4" fill="#7CC243"></circle>
              <circle data-dot="" data-path="fl2" data-off=".4" data-dur="3400" cx="280" cy="170" r="4" fill="#7CC243"></circle>
              <circle data-dot="" data-path="fl3" data-off=".2" data-dur="5200" cx="170" cy="215" r="4" fill="#7CC243"></circle>
              <circle data-dot="" data-path="fl3" data-off=".7" data-dur="5200" cx="170" cy="215" r="4" fill="#7CC243"></circle>
              <circle data-dot="" data-path="fl4" data-off=".1" data-dur="2400" cx="390" cy="235" r="4" fill="#7CC243"></circle>
              <circle data-dot="" data-path="fl5" data-off=".6" data-dur="2600" cx="170" cy="215" r="4" fill="#7CC243"></circle>
              <polygon points="280,70 320,90 280,110 240,90" fill="#EAF5D9" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <polygon points="240,90 280,110 280,190 240,170" fill="#FFFFFF" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <polygon points="280,110 320,90 320,170 280,190" fill="#C5E89A" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <line x1="248" y1="120" x2="272" y2="132" stroke="#7CC243" strokeWidth="2" strokeLinecap="round"></line>
              <line x1="248" y1="136" x2="272" y2="148" stroke="#7CC243" strokeWidth="2" strokeLinecap="round"></line>
              <line x1="248" y1="152" x2="272" y2="164" stroke="#7CC243" strokeWidth="2" strokeLinecap="round"></line>
              <polygon points="170,135 230,165 170,195 110,165" fill="#EAF5D9" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <polygon points="110,165 170,195 170,245 110,215" fill="#FFFFFF" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <polygon points="170,195 230,165 230,215 170,245" fill="#C5E89A" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <polygon points="122,190 158,208 158,226 122,208" fill="none" stroke="#262626" strokeWidth="1.2"></polygon>
              <polygon points="390,160 460,195 390,230 320,195" fill="#EAF5D9" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <polygon points="320,195 390,230 390,270 320,235" fill="#FFFFFF" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <polygon points="390,230 460,195 460,235 390,270" fill="#C5E89A" stroke="#262626" strokeWidth="1.5" strokeLinejoin="round"></polygon>
              <line x1="336" y1="220" x2="336" y2="238" stroke="#262626" strokeWidth="1.2"></line>
              <line x1="356" y1="230" x2="356" y2="248" stroke="#262626" strokeWidth="1.2"></line>
              <line x1="376" y1="240" x2="376" y2="258" stroke="#262626" strokeWidth="1.2"></line>
              <text x="170" y="120" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="14" fontWeight="600" fill="#262626">Laboratories</text>
              <text x="280" y="56" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="14" fontWeight="600" fill="#262626">Networks</text>
              <text x="400" y="146" textAnchor="middle" fontFamily="Poppins, Arial, sans-serif" fontSize="14" fontWeight="600" fill="#262626">Smart Campus</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
    </>)}

    <section id="serve" data-screen-label="05 Who We Serve" style={{ background: "var(--off-white)", padding: "104px 24px", scrollMarginTop: "96px", overflowX: "clip" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(48px,6vw,80px)" }}>
        <div data-reveal="" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "14px", maxWidth: "640px" }}>
          <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: "700", color: "var(--green-text)" }}>Who We Partner With</div>
          <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontSize: "clamp(32px,3.6vw,48px)", lineHeight: "1.1", letterSpacing: "-.02em", fontWeight: "700", color: "var(--near-black)", textWrap: "balance" }}>Empower Your People. Close the Skills Gap.</h2>
          <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", color: "var(--gray-medium)", textWrap: "pretty" }}>Organizations that see talent development not as a cost—but as a catalyst for growth.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", rowGap: serveRowGap }}>
          {sectors.map((x, x_i) => (<Fragment key={x_i}>
            <article data-reveal="" data-delay={x.delay} style={{ width: x.w, marginTop: x.mt, marginLeft: x.ml, display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ position: "relative", aspectRatio: x.ar, borderRadius: "var(--radius-xl)", overflow: "hidden", background: "var(--near-black)", boxShadow: "var(--shadow-2)" }}>
                <div className="hv-zoom105" style={{ position: "absolute", inset: "0", transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}><ImageSlot id={x.slot} shape="rect" placeholder={x.ph}></ImageSlot></div>
                <span aria-hidden="true" style={{ position: "absolute", top: "12px", right: "20px", fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "clamp(64px,7vw,112px)", lineHeight: "1", letterSpacing: "-.05em", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,.9)", pointerEvents: "none" }}>{x.n}</span>
                <div style={{ position: "absolute", left: "16px", bottom: "16px", display: "flex", alignItems: "center", gap: "10px", padding: "6px 18px 6px 6px", borderRadius: "999px", background: "rgba(38,38,38,.82)", pointerEvents: "none" }}>
                  <FeatureIcon icon={x.icon} size={36} variant="green"></FeatureIcon>
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}><span style={{ fontFamily: "var(--font-heading)", fontSize: "9px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "#C5E89A" }}>Sector {x.n}</span><span style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF" }}>{x.k}</span></span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 4px" }}>
                <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(28px,2.8vw,36px)", lineHeight: "1.1", letterSpacing: "-.02em", color: "var(--near-black)" }}>{x.k}</h3>
                <p style={{ margin: "0", fontSize: "17px", lineHeight: "1.6", color: "var(--gray-medium)", maxWidth: "520px" }}>{x.d}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingTop: "4px" }}>{x.tags.map((tg, tg_i) => (<Fragment key={tg_i}><span style={{ fontSize: "13px", fontWeight: "600", color: "var(--green-text)", background: "var(--green-tint)", padding: "6px 12px", borderRadius: "999px" }}>{tg.t}</span></Fragment>))}</div>
              </div>
            </article>
          </Fragment>))}
        </div>
      </div>
    </section>

    {showRover && (<>
    <section id="rover" data-screen-label="06 Rover" style={{ background: "var(--near-black)", color: "var(--white)", padding: "104px 24px", scrollMarginTop: "96px", overflow: "hidden" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "64px", alignItems: "center" }}>
          <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", gap: "14px", maxWidth: "680px", margin: "0" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: "700", color: "var(--pci-green)" }}>Rover by PCI Tech Center</div>
            <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontSize: "var(--fs-h2)", lineHeight: "var(--lh-h2)", letterSpacing: "var(--ls-h2)", fontWeight: "700", color: "var(--white)", textWrap: "balance" }}>Run Your Whole School on One Platform</h2>
            <p style={{ margin: "0", fontFamily: "var(--font-body)", fontSize: "var(--fs-lead)", lineHeight: "var(--lh-lead)", color: "var(--off-white)", textWrap: "pretty" }}>One place to manage enrollment, scheduling, academics, online learning, assessments, and administration, without managing the infrastructure.</p>
          </div>
            <Button size="lg" iconRight="arrow-right" onClick={goContact}>Schedule a Free Rover Demo</Button>
          </div>
          <div data-reveal="" data-dash="" data-delay="150" style={{ position: "relative", padding: "12px 12px 40px 0" }}>
            <div data-parallax="" style={{ willChange: "transform" }}>
              <div aria-label="Rover dashboard preview" role="img" style={{ background: "var(--white)", color: "var(--near-black)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-3)", overflow: "hidden" }}>
                <div style={{ height: "40px", background: "var(--off-white)", display: "flex", alignItems: "center", gap: "8px", padding: "0 16px", borderBottom: "1px solid var(--gray-rule)" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--gray-rule)" }}></span><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--gray-rule)" }}></span><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--gray-rule)" }}></span>
                  <span style={{ marginLeft: "12px", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "13px" }}>Rover</span>
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--gray-medium)" }}>SY 2026–2027</span>
                </div>
                <div style={{ display: "flex" }}>
                  {isDesktop && (<>
                    <div style={{ width: "132px", flexShrink: "0", borderRight: "1px solid var(--gray-rule)", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", fontWeight: "500" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "6px", background: "var(--green-tint)" }}><Icon name="user-round" size={14}></Icon>SIS</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", color: "var(--gray-medium)" }}><Icon name="calendar-days" size={14}></Icon>SMS</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", color: "var(--gray-medium)" }}><Icon name="book-open" size={14}></Icon>LMS</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", color: "var(--gray-medium)" }}><Icon name="clipboard-check" size={14}></Icon>Assessments</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", color: "var(--gray-medium)" }}><Icon name="file-text" size={14}></Icon>Reports</div>
                    </div>
                  </>)}
                  <div style={{ flex: "1", minWidth: "0", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "15px" }}>Enrollment overview</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "10px" }}>
                      <div style={{ background: "var(--off-white)", borderRadius: "8px", padding: "10px 12px" }}><div style={{ fontSize: "11px", color: "var(--gray-medium)" }}>Enrolled</div><div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "20px" }}>1,248</div></div>
                      <div style={{ background: "var(--off-white)", borderRadius: "8px", padding: "10px 12px" }}><div style={{ fontSize: "11px", color: "var(--gray-medium)" }}>Pending</div><div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "20px" }}>86</div></div>
                      <div style={{ background: "var(--off-white)", borderRadius: "8px", padding: "10px 12px" }}><div style={{ fontSize: "11px", color: "var(--gray-medium)" }}>Sections</div><div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "20px" }}>42</div></div>
                    </div>
                    <div style={{ border: "1px solid var(--gray-rule)", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ fontSize: "11px", color: "var(--gray-medium)", marginBottom: "8px" }}>Enrollment by grade level</div>
                      <div style={{ height: "96px", display: "flex", alignItems: "flex-end", gap: "10px" }}>
                        <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "4px" }}><div data-grow="" style={{ height: "58%", background: "var(--green-mid)", borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}></div><span style={{ fontSize: "10px", textAlign: "center", color: "var(--gray-medium)" }}>G7</span></div>
                        <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "4px" }}><div data-grow="" style={{ height: "70%", background: "var(--green-mid)", borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}></div><span style={{ fontSize: "10px", textAlign: "center", color: "var(--gray-medium)" }}>G8</span></div>
                        <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "4px" }}><div data-grow="" style={{ height: "64%", background: "var(--green-mid)", borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}></div><span style={{ fontSize: "10px", textAlign: "center", color: "var(--gray-medium)" }}>G9</span></div>
                        <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "4px" }}><div data-grow="" style={{ height: "78%", background: "var(--green-mid)", borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}></div><span style={{ fontSize: "10px", textAlign: "center", color: "var(--gray-medium)" }}>G10</span></div>
                        <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "4px" }}><div data-grow="" style={{ height: "82%", background: "var(--pci-green)", borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}></div><span style={{ fontSize: "10px", textAlign: "center", color: "var(--gray-medium)" }}>G11</span></div>
                        <div style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "4px" }}><div data-grow="" style={{ height: "72%", background: "var(--green-mid)", borderRadius: "4px 4px 0 0", transformOrigin: "bottom" }}></div><span style={{ fontSize: "10px", textAlign: "center", color: "var(--gray-medium)" }}>G12</span></div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
                      <div data-row="" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) auto", gap: "8px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--gray-rule)" }}><span style={{ fontWeight: "600" }}>Andrea Santos</span><span style={{ color: "var(--gray-medium)" }}>Grade 11 · STEM</span><span style={{ background: "var(--green-tint)", color: "var(--green-text)", fontWeight: "600", padding: "2px 8px", borderRadius: "999px", fontSize: "11px" }}>Enrolled</span></div>
                      <div data-row="" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) auto", gap: "8px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--gray-rule)" }}><span style={{ fontWeight: "600" }}>Miguel Reyes</span><span style={{ color: "var(--gray-medium)" }}>Grade 9</span><span style={{ background: "var(--green-tint)", color: "var(--green-text)", fontWeight: "600", padding: "2px 8px", borderRadius: "999px", fontSize: "11px" }}>Enrolled</span></div>
                      <div data-row="" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) auto", gap: "8px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--gray-rule)" }}><span style={{ fontWeight: "600" }}>Bea Dela Cruz</span><span style={{ color: "var(--gray-medium)" }}>Grade 12 · ABM</span><span style={{ background: "var(--off-white)", color: "var(--gray-medium)", fontWeight: "600", padding: "2px 8px", borderRadius: "999px", fontSize: "11px" }}>Pending</span></div>
                      <div data-row="" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) auto", gap: "8px", alignItems: "center", padding: "8px 0" }}><span style={{ fontWeight: "600" }}>Paolo Garcia</span><span style={{ color: "var(--gray-medium)" }}>Grade 7</span><span style={{ background: "var(--green-tint)", color: "var(--green-text)", fontWeight: "600", padding: "2px 8px", borderRadius: "999px", fontSize: "11px" }}>Enrolled</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ position: "absolute", right: "-8px", bottom: "0", width: "230px", background: "var(--white)", color: "var(--near-black)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-3)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--gray-medium)" }}><span>LMS · General Chemistry</span><span>72%</span></div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "14px" }}>Course completion</div>
                <div style={{ height: "8px", borderRadius: "4px", background: "var(--off-white)", overflow: "hidden" }}><div data-fill="" style={{ width: "72%", height: "100%", background: "var(--pci-green)", borderRadius: "4px", transformOrigin: "left" }}></div></div>
              </div>
            </div>
          </div>
        </div>
        <div data-stagger="" style={{ marginTop: "72px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "16px" }}>
          <div style={{ border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="user-round" size={28}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", lineHeight: "1.25" }}>Student Information System (SIS)</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-light)" }}>Student records, enrollment, and grades in one profile.</p></div>
          <div style={{ border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="calendar-days" size={28}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", lineHeight: "1.25" }}>School Management System (SMS)</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-light)" }}>Scheduling, sections, fees, and daily administration.</p></div>
          <div style={{ border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="book-open" size={28}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", lineHeight: "1.25" }}>Learning Management System (LMS)</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-light)" }}>Online classes, modules, and assessments in one place.</p></div>
          <div style={{ border: "1px solid var(--gray-medium)", borderRadius: "var(--radius-md)", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}><span style={{ color: "var(--pci-green)", display: "flex" }}><Icon name="cloud" size={28}></Icon></span><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "18px", lineHeight: "1.25" }}>Cloud-Based Single Subscription</h3><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-light)" }}>One subscription. We host, secure, and update it.</p></div>
        </div>
      </div>
    </section>
    </>)}

    {showCoursera && (<>
    <section id="coursera" data-screen-label="07 Coursera" style={{ background: "var(--white)", padding: "104px 24px", scrollMarginTop: "96px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "56px" }}>
        <div data-reveal="" style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap", gap: "40px", padding: "40px 24px", background: "var(--off-white)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ width: "min(300px,70vw)", height: "89px" }}><ImageSlot id="coursera-logo" shape="rect" fit="contain" placeholder="Coursera logo (official file)"></ImageSlot></div>
          <div aria-hidden="true" style={{ width: "1px", height: "89px", background: "var(--gray-rule)" }}></div>
          <img src="assets/pci-logo.png" alt="PCI Tech Center" style={{ height: "89px", width: "auto", display: "block" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "48px", alignItems: "start" }}>
          <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-start" }}>
            <Badge tone="coursera">Official Coursera Partner for the Philippines</Badge>
            <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(30px,3.4vw,40px)", lineHeight: "1.15", letterSpacing: "-.01em", textWrap: "balance" }}>Global Certifications, Delivered Locally</h2>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", color: "var(--gray-medium)", textWrap: "pretty" }}>As the official Coursera Partner for the Philippines since 2024, we bring globally recognized certifications to local organizations.</p>
          </div>
          <div data-stagger="" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px 22px", border: "1px solid var(--gray-rule)", borderTop: "4px solid var(--coursera-blue)", borderRadius: "var(--radius-md)" }}><div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "19px" }}>Coursera for Business</h3><p style={{ margin: "0", fontSize: "16px", color: "var(--gray-medium)" }}>Upskill teams with role-based learning paths.</p></div></div>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px 22px", border: "1px solid var(--gray-rule)", borderTop: "4px solid var(--coursera-blue)", borderRadius: "var(--radius-md)" }}><div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "19px" }}>Coursera for Campus</h3><p style={{ margin: "0", fontSize: "16px", color: "var(--gray-medium)" }}>Add job-ready certificates to your curriculum.</p></div></div>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "20px 22px", border: "1px solid var(--gray-rule)", borderTop: "4px solid var(--coursera-blue)", borderRadius: "var(--radius-md)" }}><div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "19px" }}>Coursera for Government</h3><p style={{ margin: "0", fontSize: "16px", color: "var(--gray-medium)" }}>Train public servants at national scale.</p></div></div>
          </div>
        </div>
      </div>
    </section>
    </>)}



    {showJourney && (<>
    <section id="about" data-screen-label="09 Journey" style={{ background: "var(--white)", padding: "104px 24px", scrollMarginTop: "96px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "56px", alignItems: "start" }}>
        <div data-reveal="" style={{ position: "sticky", top: "140px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", gap: "14px", maxWidth: "680px", margin: "0" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: "700", color: "var(--green-text)" }}>Our Journey</div>
            <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontSize: "var(--fs-h2)", lineHeight: "var(--lh-h2)", letterSpacing: "var(--ls-h2)", fontWeight: "700", color: "var(--near-black)", textWrap: "balance" }}>From AR/VR Pioneer to Integrated Partner</h2>
            <p style={{ margin: "0", fontFamily: "var(--font-body)", fontSize: "var(--fs-lead)", lineHeight: "var(--lh-lead)", color: "var(--gray-medium)", textWrap: "pretty" }}>Eight years of building learning technology for Philippine institutions.</p>
          </div>
        </div>
        <ol data-tl="" style={{ position: "relative", listStyle: "none", margin: "0", padding: "0 0 0 56px", display: "flex", flexDirection: "column", gap: "48px" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: "12px", top: "10px", bottom: "10px", width: "2px", background: "var(--gray-rule)" }}></span>
          <span data-tl-line="" aria-hidden="true" style={{ position: "absolute", left: "12px", top: "10px", bottom: "10px", width: "2px", background: "var(--pci-green)", transformOrigin: "top" }}></span>
          {timeline.map((t, t_i) => (<Fragment key={t_i}>
            <li style={{ position: "relative", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span data-tl-dot="" aria-hidden="true" style={{ position: "absolute", left: "-54px", top: "6px", width: "22px", height: "22px", borderRadius: "50%", background: "var(--white)", border: "4px solid var(--pci-green)", boxSizing: "border-box" }}><span data-ring="" style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: "2px solid var(--pci-green)", opacity: "0" }}></span></span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "28px", lineHeight: "1.1" }}>{t.year}</span>
              <span style={{ fontSize: "17px", lineHeight: "1.6", color: "var(--gray-medium)", maxWidth: "520px" }}>{t.text}</span>
            </li>
          </Fragment>))}
        </ol>
      </div>
    </section>
    </>)}

    {showMission && (<>
    <section id="mission" data-screen-label="10 Mission" style={{ background: "var(--off-white)", padding: "96px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "64px" }}>
        <div data-stagger="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "24px" }}>
          <div style={{ background: "var(--white)", borderRadius: "var(--radius-lg)", padding: "clamp(28px,4vw,48px)", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--green-text)" }}>Mission</div>
            <p style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "clamp(22px,2.3vw,28px)", lineHeight: "1.35", textWrap: "pretty" }}>To provide accessible, impactful technology solutions that empower businesses and learners with adaptive capability.</p>
          </div>
          <div style={{ background: "var(--near-black)", color: "var(--white)", borderRadius: "var(--radius-lg)", padding: "clamp(28px,4vw,48px)", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pci-green)" }}>Vision</div>
            <p style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "600", fontSize: "clamp(22px,2.3vw,28px)", lineHeight: "1.35", textWrap: "pretty" }}>A world of responsible digital citizens, fostering a culture of continuous learning and eliminating educational gaps.</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <h2 data-reveal="" style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "var(--fs-h2)", lineHeight: "1.2" }}>Our Core Values: AGI</h2>
          <p data-reveal="" style={{ margin: "-12px 0 0", fontSize: "17px", lineHeight: "1.6", color: "var(--gray-medium)", maxWidth: "760px" }}>Agility, Grit, Innovation – The principles that guide everything we do at PCI. Together, AGI drives our mission to empower organizations, equip learners, and close gaps in learning everywhere.</p>
          <div data-stagger="" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "20px" }}>
            <div data-draw-on-reveal="" style={{ background: "var(--white)", borderRadius: "var(--radius-md)", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}><div style={{ display: "flex", alignItems: "center", gap: "20px" }}><div data-draw="" style={{ display: "flex" }}><FeatureIcon icon="zap" size={64}></FeatureIcon></div><span style={{ fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "26px" }}>Agility</span></div><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-medium)" }}>We adapt quickly to changing needs, delivering solutions that are flexible, responsive, and effective.</p></div>
            <div data-draw-on-reveal="" style={{ background: "var(--white)", borderRadius: "var(--radius-md)", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}><div style={{ display: "flex", alignItems: "center", gap: "20px" }}><div data-draw="" style={{ display: "flex" }}><FeatureIcon icon="mountain" size={64}></FeatureIcon></div><span style={{ fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "26px" }}>Grit</span></div><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-medium)" }}>We persevere through challenges, staying committed to impact and excellence in every project.</p></div>
            <div data-draw-on-reveal="" style={{ background: "var(--white)", borderRadius: "var(--radius-md)", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}><div style={{ display: "flex", alignItems: "center", gap: "20px" }}><div data-draw="" style={{ display: "flex" }}><FeatureIcon icon="lightbulb" size={64}></FeatureIcon></div><span style={{ fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "26px" }}>Innovation</span></div><p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "var(--gray-medium)" }}>We embrace creativity and technology to reimagine learning and unlock new possibilities.</p></div>
          </div>
        </div>
      </div>
    </section>
    </>)}

    <section id="insights" data-screen-label="11 Portfolio" style={{ background: "var(--white)", padding: "104px 24px", scrollMarginTop: "96px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "48px" }}>
        <div data-reveal="" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "14px", maxWidth: "680px" }}>
            <span style={{ width: "56px", height: "6px", background: "var(--pci-green)" }}></span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: "700", color: "var(--green-text)" }}>Portfolio</div>
            <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontSize: "clamp(32px,3.6vw,48px)", lineHeight: "1.1", letterSpacing: "-.02em", fontWeight: "700", color: "var(--near-black)", textWrap: "balance" }}>Notable Projects That Drive Real Impact</h2>
          </div>
        </div>
        <div data-stagger="" style={{ display: "grid", gridTemplateColumns: pfCols, gridAutoRows: pfRow, gap: "16px" }}>
          {projects.map((s, s_i) => (<Fragment key={s_i}>
            <article className="hv-shadow3" style={{ position: "relative", gridColumn: s.col, gridRow: s.row, borderRadius: "var(--radius-xl)", overflow: "hidden", background: "var(--near-black)", isolation: "isolate" }}>
              <div className="hv-zoom106" style={{ position: "absolute", inset: "0", transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}><ImageSlot id={s.slot} src={s.src} shape="rect" placeholder={s.photo} alt={s.title + " project by PCI Tech Center"}></ImageSlot></div>
              <div aria-hidden="true" style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(38,38,38,0) 40%,rgba(38,38,38,.85) 100%)", pointerEvents: "none" }}></div>
              <div style={{ position: "absolute", top: "16px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "none" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--near-black)", background: "var(--white)", padding: "6px 12px", borderRadius: "999px" }}>{s.sector}</span>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "14px", color: "var(--white)", background: "rgba(38,38,38,.7)", padding: "6px 10px", borderRadius: "999px" }}>{s.num}</span>
              </div>
              <div style={{ position: "absolute", left: "20px", right: "20px", bottom: "20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", pointerEvents: "none" }}>
                <h3 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: s.fs, lineHeight: "1.15", letterSpacing: "-.01em", color: "var(--white)", textWrap: "balance", maxWidth: "520px" }}>{s.title}</h3>
                <span style={{ flexShrink: "0", width: "44px", height: "44px", borderRadius: "50%", background: "var(--pci-green)", color: "var(--white)", display: "grid", placeItems: "center" }}><Icon name="arrow-up-right" size={20}></Icon></span>
              </div>
            </article>
          </Fragment>))}
        </div>
      </div>
    </section>

    <section id="partners" data-screen-label="12 Partners" style={{ background: "var(--white)", color: "var(--near-black)", padding: "16px 24px 104px", overflow: "hidden" }}>
      <div data-reveal="" style={{ maxWidth: "1280px", margin: "88px auto 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "12px", textAlign: "center" }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}><div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--green-text)" }}>Partners</div><h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "var(--fs-h2)", lineHeight: "1.2", color: "var(--near-black)" }}>Meet Our Partners</h2></div></div>
      <div data-stagger="" style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
        {partnersGrid.map((m, m_i) => (<Fragment key={m_i}>
          <div className="hv-lift" style={{ width: "clamp(140px,22vw,176px)", height: "112px", borderRadius: "var(--radius-md)", background: "var(--white)", padding: "18px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 320ms cubic-bezier(0.22,1,0.36,1),box-shadow 320ms cubic-bezier(0.22,1,0.36,1)" }}><img src={m.src} alt={m.label} loading="lazy" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} /></div>
        </Fragment>))}
      </div>
    </section>

    <section id="contact" data-screen-label="12 CTA" style={{ position: "relative", overflow: "hidden", background: "var(--pci-green)", color: "var(--white)", padding: "120px 24px", scrollMarginTop: "96px" }}>
      <div data-reveal="" style={{ position: "relative", maxWidth: "820px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        <h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "clamp(40px,6vw,72px)", lineHeight: "1.08", letterSpacing: "-.02em", color: "var(--white)", textWrap: "balance" }}>Let’s Build Your Learning Solution</h2>
        <p style={{ margin: "0", fontSize: "clamp(17px,1.6vw,20px)", lineHeight: "1.6", color: "var(--white)", maxWidth: "600px" }}>From strategy to deployment, we co-create future-ready learning ecosystems tailored to your goals.</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "8px" }}>
          <Button size="lg" variant="inverse" iconRight="arrow-right" onClick={goContact}>Book a Demo Today</Button>
          <Button size="lg" variant="outlineInverse" onClick={goContact}>Talk to Our Team</Button>
        </div>
      </div>
    </section>

    <Dialog open={bookOpen} title="Get in touch with us" onClose={closeBook} width={540}>
      {notSent && (<>
        <form onSubmit={submitBook} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "15px", lineHeight: "1.6", color: "var(--gray-medium)" }}>Fill up the form &amp; our team will get back to you within hours</p>
          <Input label="Full name (optional)" type="text" placeholder="Juan Dela Cruz" value={f_name} onChange={set_name}></Input>
          <Input label="Email address (required)" type="email" placeholder="you@organization.ph" value={f_email} onChange={set_email} error={e_email}></Input>
          <Input label="Phone number (required)" type="tel" placeholder="+63 9XX XXX XXXX" value={f_phone} onChange={set_phone} error={e_phone}></Input>
          <Input label="Organization (required)" type="text" placeholder="School, agency, or company" value={f_org} onChange={set_org} error={e_org}></Input>
          {/* Honeypot for spam bots — hidden from people and assistive tech. */}
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }} />
          <div style={{ marginTop: "8px" }}><Button type="submit" size="lg" fullWidth={true} iconRight="arrow-right" disabled={sending} aria-busy={sending}>Book an Appointment</Button></div>
          {sendError && <div role="alert" style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--danger)" }}>{sendError}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: "14px", color: "var(--gray-medium)", paddingTop: "6px" }}>
            <a href="tel:+639177002131" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--near-black)", textDecoration: "none", padding: "6px 0" }}><Icon name="phone" size={16}></Icon>+63 917 700 2131</a>
            <a href="mailto:info@pcitech.com.ph" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--near-black)", textDecoration: "none", padding: "6px 0" }}><Icon name="mail" size={16}></Icon>info@pcitech.com.ph</a>
          </div>
        </form>
      </>)}
      {sent && (<>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px", padding: "8px 0" }}>
          <FeatureIcon icon="circle-check" size={56}></FeatureIcon>
          <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.6", color: "var(--near-black)" }}>Thank you. Our team will get back to you within hours.</p>
          <Button variant="secondary" onClick={closeBook}>Close</Button>
        </div>
      </>)}
    </Dialog>

    </main>

    <footer data-screen-label="13 Footer" style={{ background: "var(--near-black)", color: "var(--white)", padding: "80px 24px 32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "56px" }}>
        {showFooterCta && (<><div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px", paddingBottom: "48px", borderBottom: "1px solid var(--gray-medium)" }}><h2 style={{ margin: "0", fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "clamp(28px,3.4vw,44px)", lineHeight: "1.15", color: "var(--white)" }}>Ready to Close Your Skills Gap?</h2><Button size="lg" iconRight="arrow-right" onClick={goContact}>Book a Demo Today</Button></div></>)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", gridColumn: "span 1" }}>
            <img src="assets/pci-logo-white.png" alt="PCI Tech Center" style={{ width: "132px", height: "auto", display: "block" }} />
            <span style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontWeight: "600", fontSize: "20px", color: "var(--pci-green)" }}>Simplify Learning.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pci-green)" }}>Visit</div>
            <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.6", color: "var(--gray-rule)" }}>3F ECJ Building, Real St. cor. Arzobispo St., Intramuros, Manila</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pci-green)", marginBottom: "4px" }}>Contact</div>
            <a className="hv-green" href="mailto:info@pcitech.com.ph" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "4px 0" }}>info@pcitech.com.ph</a>
            <a className="hv-green" href="tel:+639177002131" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "4px 0" }}>+63 917 700 2131</a>
            <a className="hv-green" href="tel:+63282152049" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "4px 0" }}>(02) 215 2049</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "10px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--pci-green)", marginBottom: "4px" }}>Explore</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              <a className="hv-green" href="#solutions" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "6px 0" }}>Solutions</a>
              <a className="hv-green" href="#rover" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "6px 0" }}>Rover</a>
              {showCoursera && (<><a className="hv-green" href="#coursera" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "6px 0" }}>Coursera</a></>)}
              <a className="hv-green" href="#about" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "6px 0" }}>About</a>
              <a className="hv-green" href="#" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "6px 0" }}>Careers</a>
              <a className="hv-green" href="#" style={{ color: "var(--white)", textDecoration: "none", fontSize: "16px", padding: "6px 0" }}>Privacy Policy</a>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <a className="hv-social" href="#" aria-label="PCI Tech Center on Facebook" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--gray-medium)", display: "grid", placeItems: "center", color: "var(--white)" }}><Icon name="facebook" size={18}></Icon></a>
              <a className="hv-social" href="#" aria-label="PCI Tech Center on LinkedIn" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--gray-medium)", display: "grid", placeItems: "center", color: "var(--white)" }}><Icon name="linkedin" size={18}></Icon></a>
              <a className="hv-social" href="#" aria-label="PCI Tech Center on YouTube" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--gray-medium)", display: "grid", placeItems: "center", color: "var(--white)" }}><Icon name="youtube" size={18}></Icon></a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--gray-medium)", paddingTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px", fontSize: "14px", color: "var(--gray-light)" }}>
          <span>© 2026 PCI Innovations Tech Center, Inc.</span>
          <span>Intramuros, Manila, Philippines</span>
        </div>
      </div>
    </footer>

    </div>
  )
}
