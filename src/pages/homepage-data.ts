// Content from renderVals() in Homepage v2.dc.html.

export const STEPS = [
  { n: "01", t: "Assess", d: "We conduct a needs analysis to identify learning gaps and infrastructure readiness.", icon: "search-check" },
  { n: "02", t: "Design", d: "We co-create a solution package aligned to your organizational goals.", icon: "pencil-ruler" },
  { n: "03", t: "Implement", d: "We deploy platforms, content, and training through agile project management.", icon: "rocket" },
  { n: "04", t: "Evaluate", d: "We measure outcomes, ensure adoption, and refine based on data.", icon: "trending-up" },
]

export const SECTORS = [
  {
    k: "Academe",
    n: "01",
    icon: "school",
    slot: "serve-academe",
    ph: "Photo: Filipino K–12 or university classroom, natural light",
    d: "We help basic, techvoc, and higher education institutions integrate world-class content, immersive technology, and flexible learning pathways.",
    tags: [{ t: "Rover" }, { t: "Coursera for Campus" }, { t: "AR/VR laboratories" }],
  },
  {
    k: "Government",
    n: "02",
    icon: "landmark",
    slot: "serve-government",
    ph: "Photo: government agency training session",
    d: "We support NGAs, LGUs, and GOCCs in delivering scalable and COA-compliant upskilling programs—whether for internal workforce development or citizen training.",
    tags: [{ t: "Coursera for Government" }, { t: "Managed Learning" }, { t: "PHILGEPS Platinum" }],
  },
  {
    k: "Industry",
    n: "03",
    icon: "factory",
    slot: "serve-industry",
    ph: "Photo: professionals in a corporate training room",
    d: "Whether you’re launching leadership tracks, digital skills pathways, or sectoral academies, PCI delivers measurable ROI through curated learning journeys and integrated platforms.",
    tags: [{ t: "Coursera for Business" }, { t: "Corporate academies" }, { t: "Custom e-learning" }],
  },
]

export const PKGS = [
  { t: "Standard Packages", d: "For rapid rollout and proven implementation models.", icon: "package-check", k: "Option A", bg: "#7CC243" },
  {
    t: "Tailored Solutions",
    d: "Co-designed with your team to meet exact technical, learning, or policy goals.",
    icon: "pencil-ruler",
    k: "Option B",
    bg: "#C5E89A",
  },
]

const PARTNER_LABELS = [
  "KargaX",
  "CompTIA",
  "The Medical City",
  "Saint Mutien College",
  "Coursera",
  "Concentrix",
  "Digiscript",
  "MARINA",
  "DOST",
  "DepEd",
  "LTFRB",
  "Knowledge Channel",
  "World Vision",
  "The University of Tokyo",
  "Biliran Province State University",
  "Province of Ilocos Sur",
]

export const PARTNERS = [...Array(16).keys(), ...Array(16).keys()].map((i) => ({
  src: "assets/partners/partner-" + String(i + 1).padStart(2, "0") + ".png",
  label: PARTNER_LABELS[i],
}))

export const TIMELINE = [
  { year: "2018", text: "Founded, focused on immersive AR/VR learning." },
  { year: "2019", text: "Exclusive PH reseller of Kongsberg Digital." },
  {
    year: "2020–2022",
    text: "Full learning ecosystems; first AR/VR learning and simulation system in Philippine tertiary education (PMMA, with Seaversity).",
  },
  { year: "2023", text: "Launched Rover." },
  { year: "2024", text: "Became Official Coursera Partner for the Philippines." },
  { year: "2025–2026", text: "Scaling Rover nationwide; End-to-End Managed Learning; expanded Digital Infrastructure." },
]

export const PROJECTS = [
  { slot: "portfolio-aaccup", src: "assets/portfolio/aaccup.webp", sector: "Academe", title: "AACCUP Big Data Platform", photo: "AACCUP" },
  {
    slot: "portfolio-lufthansa",
    src: "assets/portfolio/lufthansa.webp",
    sector: "Industry",
    title: "Lufthansa for Aviation, Analog for Semicon",
    photo: "Lufthansa and Analog Devices",
  },
  { slot: "portfolio-sti", src: "assets/portfolio/sti.webp", sector: "Academe", title: "STI and Zamboanga Sim Labs", photo: "STI" },
  { slot: "portfolio-dict", src: "assets/portfolio/dict.webp", sector: "Government", title: "DICT MERN Pharma Training", photo: "DICT" },
  { slot: "portfolio-csc", src: "assets/portfolio/csc.webp", sector: "Government", title: "CSC LMS for Nation Building", photo: "CSC" },
  { slot: "portfolio-dost-sei", src: "", sector: "Government", title: "DOST SEI", photo: "DOST SEI.png (Drive: Portfolio)" },
]
