// Email sending through Resend (https://resend.com). Needs RESEND_API_KEY and EMAIL_FROM in Vercel.
export const emailReady = () => !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

export type Mail = { to: string; subject: string; html: string; text: string; unsub: string };

export function postMail(o: { base: string; siteName: string; slug: string; title: string; excerpt: string; token: string; to: string }): Mail {
  const link = `${o.base}/blog/${o.slug}`;
  const unsub = `${o.base}/unsubscribe?t=${o.token}`;
  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1d1b">
<p style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#8a6d12">${esc(o.siteName)}</p>
<h1 style="font-size:28px;margin:8px 0">${esc(o.title)}</h1>
<p style="font-size:16px;line-height:1.6">${esc(o.excerpt)}</p>
<p><a href="${link}" style="display:inline-block;background:#d4af37;color:#000;padding:12px 22px;border-radius:99px;text-decoration:none;font-family:Arial,sans-serif">Read the post</a></p>
<p style="font-size:12px;color:#777;font-family:Arial,sans-serif;margin-top:32px">You get this email because you subscribed on ${esc(o.base.replace(/^https?:\/\//, ""))}. <a href="${unsub}">Unsubscribe</a></p></div>`;
  const text = `${o.title}\n\n${o.excerpt}\n\nRead the post: ${link}\n\nUnsubscribe: ${unsub}`;
  return { to: o.to, subject: o.title, html, text, unsub };
}

export async function sendMany(mails: Mail[]): Promise<{ sent: number; failed: number; error?: string }> {
  let sent = 0, failed = 0, error = "";
  for (let i = 0; i < mails.length; i += 100) {
    const chunk = mails.slice(i, i + 100);
    const r = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(chunk.map((m) => ({ from: process.env.EMAIL_FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text, headers: { "List-Unsubscribe": `<${m.unsub}>` } }))),
    }).catch(() => null);
    if (r && r.ok) sent += chunk.length;
    else { failed += chunk.length; if (!error) error = r ? `Email service said ${r.status}` : "Could not reach the email service"; }
  }
  return { sent, failed, error: error || undefined };
}
