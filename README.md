# PCI Tech Center — Homepage (React + shadcn/ui)

Port of the Claude Design file **"Homepage built with motion and placeholders" → `Homepage v2.dc.html`**.

- React 19 + Vite 8 + Tailwind CSS 4 + shadcn/ui (radix, nova)
- `src/pages/Homepage.tsx`: markup generated from the design template (all inline styles copied 1:1), logic ported from `renderVals()`
- `src/lib/homepage-motion.ts`: port of the design's motion layer (reveals, counters, glows, nav theming, ripple, flow dots)
- `src/components/ui/*`: the PCI design-system components (Button, IconButton, Icon, FeatureIcon, Input, Card, Badge, Dialog) as shadcn components
- `src/styles/*`: design-system tokens and fonts, copied verbatim from `_ds/`
- Tailwind Preflight is intentionally **not** loaded so rendering matches the design (browser defaults, no global reset)

Section toggles (same defaults as the design's props): pass `showSolutions`, `showRover`, `showCoursera`,
`showJourney`, `showMission`, `showAccreditations`, `ambientMotion`, `rippleSpeed` to `<Homepage />` in `src/App.tsx`.

## Images

`public/assets/` holds the images exactly as the design serves them. The original uploads from Claude Design
(`uploads/`) are kept in `design-assets-src/` (git-ignored) and were processed the same way the design did:

- `hero-duo.png`: the "VR Tech Center Duo" upload, unchanged (pixel-identical)
- `visor-portrait-v2.png`: the visor portrait downscaled to 720×858
- `portfolio/*.png`: downscaled from 5000×2813 to 960×540; DOST SEI uses the image stored in the design's image slot (`dost-sei.webp`)
- `partners/partner-NN.png`: cropped to the logo, fit in 446×150 with white padding; 04 and 05 are the design's own files

## Contact form email

The "Get in touch with us" form posts to `api/contact.ts` (a Vercel Function), which emails the lead through
[Resend](https://resend.com). `npm run dev` serves the same function locally (see `vite.config.ts`).

Environment variables (copy `.env.example` to `.env.local` for local testing, and add them in Vercel → Settings →
Environment Variables for deployments):

| Variable | |
|---|---|
| `RESEND_API_KEY` | required |
| `CONTACT_TO_EMAIL` | inbox for leads, default `info@pcitech.com.ph` (comma-separated for several) |
| `CONTACT_FROM_EMAIL` | sender on a domain verified in Resend, e.g. `PCI Website <website@pcitech.com.ph>` |

Replies go straight to the visitor (`reply_to` is their email).

## Scripts

```bash
npm run dev      # dev server
npm run build    # type-check + production build
```

## Deploy to Vercel

`vercel.json` is already set up (Vite preset, `npm ci`, `npm run build`, output `dist/`):

- Hashed JS/CSS/fonts are emitted to `/_app/` and cached for a year (`immutable`).
- Design images in `/assets/` keep stable names, so they are cached for a day and revalidated.
- Node 22+ is required (`engines` in `package.json`).

Either import the Git repository in the Vercel dashboard (framework is auto-detected), or use the CLI:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```
