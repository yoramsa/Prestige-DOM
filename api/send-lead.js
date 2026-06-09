import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO = "hervesebag@hotmail.fr";
const FROM = process.env.RESEND_FROM || "Prestige Dom <onboarding@resend.dev>";

const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { cabinet, contactName, email, telephone, besoin } = req.body || {};

  if (!cabinet || !contactName || !email || !telephone) {
    return res.status(400).json({ success: false, message: "Champs obligatoires manquants." });
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Nouveau lead — ${cabinet}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
          <div style="background:#0B1F3A;padding:24px 30px">
            <h2 style="color:#C5A880;margin:0;font-size:20px;letter-spacing:2px">PRESTIGE DOM</h2>
            <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px">Nouveau lead reçu depuis le site</p>
          </div>
          <div style="padding:30px;background:#ffffff">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:10px 0;color:#6b6b6b;width:140px">Cabinet</td><td style="padding:10px 0;color:#1c1c1c;font-weight:500">${escapeHtml(cabinet)}</td></tr>
              <tr style="background:#f9f5ef"><td style="padding:10px 0;color:#6b6b6b;width:140px">Contact</td><td style="padding:10px 0;color:#1c1c1c;font-weight:500">${escapeHtml(contactName)}</td></tr>
              <tr><td style="padding:10px 0;color:#6b6b6b">Email</td><td style="padding:10px 0"><a href="mailto:${escapeHtml(email)}" style="color:#0B1F3A">${escapeHtml(email)}</a></td></tr>
              <tr style="background:#f9f5ef"><td style="padding:10px 0;color:#6b6b6b">Téléphone</td><td style="padding:10px 0;color:#1c1c1c">${escapeHtml(telephone)}</td></tr>
              <tr><td style="padding:10px 0;color:#6b6b6b;vertical-align:top">Besoin</td><td style="padding:10px 0;color:#1c1c1c">${escapeHtml(besoin) || "—"}</td></tr>
            </table>
          </div>
          <div style="background:#f9f5ef;padding:16px 30px;text-align:center;font-size:12px;color:#6b6b6b">
            Prestige Dom · 16 rue Vandel, 13008 Marseille
          </div>
        </div>
      `,
    });

    if (error) {
      return res.status(502).json({ success: false, message: "Erreur d'envoi." });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
}
