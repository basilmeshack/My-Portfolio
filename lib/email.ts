import nodemailer from "nodemailer"

const FROM_EMAIL = process.env.SMTP_USER || "bmwandera14@gmail.com"
const FROM_NAME = "Meshack Bwire"

type SendMailPayload = {
    to: string
    subject: string
    html: string
}

async function sendMail({ to, subject, html }: SendMailPayload) {
    try {
        const host = process.env.SMTP_HOST
        const port = Number(process.env.SMTP_PORT || 587)
        const user = process.env.SMTP_USER
        const pass = process.env.SMTP_PASSWORD
        const useTls = String(process.env.SMTP_TLS || "true").toLowerCase() === "true"
        const secure = port === 465

        if (!host || !user || !pass) {
            throw new Error("SMTP credentials are not configured")
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            requireTLS: useTls,
            auth: {
                user,
                pass,
            },
        })

        console.log("[sendMail] Sending via SMTP", {
            to,
            from: FROM_EMAIL,
            host,
            port,
            secure,
            requireTLS: useTls,
            subject,
            hasHtml: Boolean(html),
        })

        const info = await transporter.sendMail({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to,
            subject,
            html,
        })

        console.log(`[sendMail] Email sent to ${to}, messageId: ${info.messageId}`)
        return true
    } catch (error) {
        console.error("[sendMail] Failed to send email:", error)
        throw error
    }
}

// ─── Contact Form Email ─────────────────────────────────────────────────────

interface ContactEmailData {
    senderName: string
    senderEmail: string
    subject: string
    message: string
}

const ADMIN_EMAIL = process.env.ALERT_EMAIL_TO?.trim() || process.env.SMTP_USER?.trim() || "bmwandera14@gmail.com"

export async function sendContactEmail(data: ContactEmailData) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact Message</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #0f172a; background: #f8fafc; padding: 24px; margin: 0; }
        .card { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
        .pill { display: inline-block; padding: 6px 14px; background: #ecfdf3; color: #166534; border-radius: 999px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
        h1 { font-size: 22px; font-weight: 700; margin: 0 0 18px; color: #0f172a; }
        .field { margin-bottom: 14px; }
        .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
        .value { font-size: 15px; color: #0f172a; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .message-box { font-size: 15px; color: #0f172a; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.6; }
        .btn { display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
        .footer { margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
    </style>
</head>
<body>
    <div class="card">
        <span class="pill">📬 New Message from Your Website</span>
        <h1>${data.subject}</h1>

        <div class="field">
            <div class="label">Visitor Name</div>
            <div class="value">${data.senderName}</div>
        </div>

        <div class="field">
            <div class="label">Visitor Email</div>
            <div class="value">${data.senderEmail}</div>
        </div>

        <div class="field">
            <div class="label">Subject</div>
            <div class="value">${data.subject}</div>
        </div>

        <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${data.message.replace(/\n/g, "<br/>")}</div>
        </div>

        <a href="mailto:${data.senderEmail}?subject=Re: ${encodeURIComponent(data.subject)}" class="btn">Reply to ${data.senderName}</a>

        <div class="footer">
            <p>This message was submitted through the contact form on <a href="${appUrl}" style="color:#7c3aed;">${appUrl}</a></p>
        </div>
    </div>
</body>
</html>`

    await sendMail({
        to: ADMIN_EMAIL,
        subject: `Website Contact: ${data.subject}`,
        html: htmlTemplate,
    })

    console.log("[sendContactEmail] Contact message forwarded to", ADMIN_EMAIL)
    return { success: true }
}

// ─── Resume Request Email ─────────────────────────────────────────────────────

interface ResumeRequestEmailData {
    senderName: string
    senderEmail: string
    company?: string
    subject: string
    message: string
}

export async function sendResumeRequestEmail(data: ResumeRequestEmailData) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const companyInfo = data.company ? `<div class="field">
            <div class="label">Company / Organization</div>
            <div class="value">${data.company}</div>
        </div>` : ""

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resume Request</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #0f172a; background: #f8fafc; padding: 24px; margin: 0; }
        .card { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
        .pill { display: inline-block; padding: 6px 14px; background: #ede9fe; color: #7c3aed; border-radius: 999px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
        h1 { font-size: 22px; font-weight: 700; margin: 0 0 18px; color: #0f172a; }
        .field { margin-bottom: 14px; }
        .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
        .value { font-size: 15px; color: #0f172a; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .message-box { font-size: 15px; color: #0f172a; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.6; }
        .btn { display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
        .footer { margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
        .highlight { background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
        .highlight h2 { margin: 0 0 8px; font-size: 16px; }
        .highlight p { margin: 0; font-size: 14px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="card">
        <span class="pill">📄 Resume Request</span>
        <h1>${data.subject}</h1>

        <div class="highlight">
            <h2>🎯 Action Required</h2>
            <p>Please send your CV/Resume to this requester at your earliest convenience.</p>
        </div>

        <div class="field">
            <div class="label">Requester Name</div>
            <div class="value">${data.senderName}</div>
        </div>

        <div class="field">
            <div class="label">Requester Email</div>
            <div class="value">${data.senderEmail}</div>
        </div>

        ${companyInfo}

        <div class="field">
            <div class="label">Subject</div>
            <div class="value">${data.subject}</div>
        </div>

        <div class="field">
            <div class="label">Message</div>
            <div class="message-box">${data.message.replace(/\n/g, "<br/>")}</div>
        </div>

        <a href="mailto:${data.senderEmail}?subject=Re: ${encodeURIComponent(data.subject)}&body=Hi ${data.senderName},%0D%0A%0D%0AThank you for your interest in my resume. Please find it attached.%0D%0A%0D%0ABest regards,%0D%0AMeshack Bwire" class="btn">Reply with Resume</a>

        <div class="footer">
            <p>This resume request was submitted through <a href="${appUrl}" style="color:#7c3aed;">${appUrl}</a></p>
            <p style="margin-top: 8px; font-size: 12px;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`

    await sendMail({
        to: ADMIN_EMAIL,
        subject: `Resume Request: ${data.subject}`,
        html: htmlTemplate,
    })

    console.log("[sendResumeRequestEmail] Resume request forwarded to", ADMIN_EMAIL)
    return { success: true }
}