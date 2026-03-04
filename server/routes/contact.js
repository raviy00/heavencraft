import express from 'express'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import ContactMessage from '../models/ContactMessage.js'

const router = express.Router()

// ── Build transporter lazily so env vars are definitely loaded ─
function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,          // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // Gmail App Password (no quotes)
    },
    tls: {
      rejectUnauthorized: false,      // fixes some self-signed cert issues
    },
  })
}

// ── Verify SMTP connection once at startup ─────────────────────
// This will print to Render logs so you can confirm credentials work
setTimeout(async () => {
  try {
    const t = getTransporter()
    await t.verify()
    console.log('✅ Nodemailer: SMTP connection to Gmail verified')
  } catch (err) {
    console.error('❌ Nodemailer: SMTP verification failed —', err.message)
    console.error('   Check EMAIL_USER and EMAIL_PASS env vars, and that the Gmail App Password has no surrounding quotes')
  }
}, 3000) // wait 3s after startup

// ── Send notification email ────────────────────────────────────
async function sendContactNotification({ name, email, message }) {
  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const transporter = getTransporter()

  const info = await transporter.sendMail({
    from: `"Heavencraft Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `📬 New Contact Message from ${name}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0b1520; margin: 0; padding: 0; }
    .wrap { max-width: 600px; margin: 30px auto; background: #0f1928; border-radius: 12px; overflow: hidden; border: 1px solid rgba(51,65,85,0.5); }
    .header { background: linear-gradient(135deg, #258cf4 0%, #1a6fd4 100%); padding: 28px 32px; }
    .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; }
    .header p { color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px; }
    .value { background: #0b1520; border: 1px solid rgba(51,65,85,0.4); border-radius: 8px; padding: 12px 16px; color: #e2e8f0; font-size: 15px; line-height: 1.6; }
    .message-value { white-space: pre-wrap; }
    .footer { padding: 16px 32px; border-top: 1px solid rgba(51,65,85,0.3); font-size: 11px; color: #475569; text-align: center; }
    .badge { display: inline-block; background: rgba(37,140,244,0.15); border: 1px solid rgba(37,140,244,0.3); color: #258cf4; border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>⛏ Heavencraft</h1>
      <p>New contact form submission</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">From</div>
        <div class="value">${name} &nbsp;<span class="badge">${email}</span></div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="value message-value">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>
      <div class="field">
        <div class="label">Received</div>
        <div class="value">${submittedAt}</div>
      </div>
    </div>
    <div class="footer">
      💡 Hit "Reply" to respond directly to ${name} at ${email}
    </div>
  </div>
</body>
</html>`,
    text: `New contact message on Heavencraft\n\nFrom: ${name} <${email}>\n\nMessage:\n${message}\n\nReceived: ${submittedAt}`,
  })

  console.log(`✅ Contact email sent to ${process.env.EMAIL_USER} — messageId: ${info.messageId}`)
}

// ── Middleware: require admin JWT ────────────────────────────
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ── POST /api/contact ────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide all required fields: name, email, and message.' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' })
    }

    // Save to DB
    const newMessage = new ContactMessage({ name, email, message })
    await newMessage.save()

    // Send email — log any error clearly to Render logs
    sendContactNotification({ name, email, message }).catch((err) => {
      console.error(`❌ Contact email FAILED for "${name}" <${email}>:`, err.message)
    })

    res.status(201).json({ message: 'Your message has been successfully sent!' })
  } catch (error) {
    console.error('[Contact Error]', error)
    res.status(500).json({ error: 'An error occurred while saving your message. Please try again later.' })
  }
})

// ── GET /api/contact — Admin only ────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages.' })
  }
})

export default router
