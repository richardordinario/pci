// Vercel Function: POST /api/contact
// Sends the "Get in touch with us" form to the PCI inbox through Resend (https://resend.com).
//
// Environment variables (Vercel → Project → Settings → Environment Variables, or .env.local for dev):
//   RESEND_API_KEY      required  API key from Resend
//   CONTACT_TO_EMAIL    optional  inbox that receives the leads (default: info@pcitech.com.ph)
//   CONTACT_FROM_EMAIL  optional  sender on a domain verified in Resend, e.g. "PCI Website <website@pcitech.com.ph>"
//                                 (default: Resend's test sender, which can only deliver to the Resend account owner)

type Payload = { name?: unknown; email?: unknown; phone?: unknown; org?: unknown; website?: unknown }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "")

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

export async function POST(request: Request) {
  const env = process.env
  let data: Payload
  try {
    data = (await request.json()) as Payload
  } catch {
    return json({ error: "Invalid request." }, 400)
  }

  // Honeypot: real visitors never see or fill this field.
  if (str(data.website)) return json({ ok: true })

  const name = str(data.name)
  const email = str(data.email)
  const phone = str(data.phone, 40)
  const org = str(data.org)

  // Same rules as the form in the design.
  const errors: Record<string, string> = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address."
  if (phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number."
  if (!org) errors.org = "Enter your organization."
  if (Object.keys(errors).length) return json({ errors }, 422)

  const apiKey = env.RESEND_API_KEY
  if (!apiKey) return json({ error: "Email is not configured on the server." }, 500)

  const to = env.CONTACT_TO_EMAIL || "info@pcitech.com.ph"
  const from = env.CONTACT_FROM_EMAIL || "PCI Website <onboarding@resend.dev>"

  const rows: [string, string][] = [
    ["Full name", name || "—"],
    ["Email", email],
    ["Phone", phone],
    ["Organization", org],
  ]
  const html = `<h2 style="font-family:Arial,sans-serif;color:#262626">New appointment request</h2>
<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#4A4A4A">${k}</td><td style="padding:6px 0;color:#262626"><strong>${esc(v)}</strong></td></tr>`).join("\n")}
</table>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#AAAAAA">Sent from the "Get in touch with us" form on the PCI Tech Center website.</p>`
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n")

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      reply_to: email,
      subject: `New appointment request — ${org}`,
      html,
      text,
    }),
  })

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text())
    return json({ error: "We couldn't send your request. Please try again or email info@pcitech.com.ph." }, 502)
  }
  return json({ ok: true })
}
