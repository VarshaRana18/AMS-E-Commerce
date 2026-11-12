import { Resend } from "resend";

// Initialize Resend client lazily or on demand
let resendClient = null;

const getResendClient = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

/**
 * Low-level email sender wrapping Resend with dev simulation fallback.
 * Prevents third-party delivery glitches from crashing application workflows.
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plaintext fallback
 * @param {string} [options.from] - Sender address
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from = process.env.EMAIL_FROM || "AMS E-Commerce <onboarding@resend.dev>",
}) => {
  const recipient = Array.isArray(to) ? to : [to];
  const client = getResendClient();

  // If no Resend API key configured or explicitly set to mock, log dev simulation
  if (!client || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key") {
    console.log(`\n======================================================`);
    console.log(`[EMAIL SIMULATOR - NO API KEY CONFIGURED]`);
    console.log(`To:      ${recipient.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`From:    ${from}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true, id: "simulated-" + Date.now() };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: recipient,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ""),
    });

    if (error) {
      console.warn(`[EMAIL WARNING] Resend rejected dispatch (${error.message}). Falling back to simulation log.`);
      console.log(`[EMAIL SIMULATION] Recipient: ${recipient.join(", ")} | Subject: ${subject}`);
      return { success: true, simulated: true, error: error.message };
    }

    return { success: true, simulated: false, data };
  } catch (err) {
    console.warn(`[EMAIL ERROR] Network/Transport failure (${err.message}). Logging simulated event.`);
    return { success: true, simulated: true, error: err.message };
  }
};

/**
 * Sends a transactional verification email to a newly registered or requesting user.
 *
 * @param {Object} params
 * @param {string} params.email - User email address
 * @param {string} params.name - User full name
 * @param {string} params.token - Raw 32-byte cryptographic hex token
 * @param {Object} [params.req] - Express request object to resolve dynamic host/protocol
 */
export const sendVerificationEmail = async ({ email, name, token }) => {
  // Determine frontend client URL (defaults to Vite dev server port 5173)
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; line-height: 1.6; color: #cbd5e1; }
        .greeting { font-size: 18px; color: #ffffff; font-weight: 600; margin-bottom: 16px; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
        .alt-link { font-size: 13px; color: #94a3b8; word-break: break-all; margin-top: 24px; padding: 12px; background: #0f172a; border-radius: 6px; }
        .footer { padding: 20px 28px; background: #0f172a; border-top: 1px solid #334155; font-size: 12px; color: #64748b; text-align: center; }
        .badge { display: inline-block; background: #3b82f620; color: #60a5fa; border: 1px solid #3b82f640; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="badge">Security & Authentication</span>
          <h1>AMS E-Commerce Verification</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name || "Valued Customer"},</div>
          <p>Thank you for registering with <strong>AMS E-Commerce</strong>. To complete your registration and activate your account privileges (including ordering and personalized recommendations), please verify your email address.</p>
          
          <div class="btn-wrapper">
            <a href="${verificationUrl}" target="_blank" class="btn">Verify Email Address</a>
          </div>

          <p style="font-size: 14px; color: #94a3b8;">This verification link will expire in <strong>24 hours</strong>. If you did not create an account on AMS E-Commerce, you can safely ignore this email.</p>
          
          <div class="alt-link">
            <strong>Or copy and paste this link in your browser:</strong><br />
            <a href="${verificationUrl}" style="color: #818cf8;">${verificationUrl}</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} AMS E-Commerce Inc. All rights reserved. &bull; Secure Account Services
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email - AMS E-Commerce",
    html,
  });
};
