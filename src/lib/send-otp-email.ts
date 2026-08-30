import nodemailer from "nodemailer";
import { SmtpSettings } from "./site-types";

export interface SendOtpResult {
  success: boolean;
  delivered: boolean;
  message: string;
  error?: string;
}

export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  smtpConfig?: SmtpSettings
): Promise<SendOtpResult> {
  // Resolve credentials from custom stored SMTP or .env variables
  const user = smtpConfig?.user || process.env.SMTP_USER;
  const pass = smtpConfig?.pass || process.env.SMTP_PASS;
  const host = smtpConfig?.host || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = smtpConfig?.port || Number(process.env.SMTP_PORT) || 465;
  const isSecure = smtpConfig?.secure !== undefined ? smtpConfig.secure : port === 465;
  const fromName = smtpConfig?.fromName || "Studio Security";

  // If no email credentials configured, return fallback notification
  if (!user || !pass) {
    return {
      success: true,
      delivered: false,
      message: "SMTP is not configured yet. Add your Gmail / SMTP credentials in Admin Security to receive real emails.",
    };
  }

  try {
    let transporter: nodemailer.Transporter;

    if (smtpConfig?.service === "gmail" || (!smtpConfig?.service && host.includes("gmail"))) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: { user, pass },
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin 2FA Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #07080c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07080c; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #0e0f18; border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 36px 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                
                <!-- Logo & Badge -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); color: #22d3ee; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace;">
                      🔒 FORTRESS 2FA SECURITY
                    </div>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">
                      Admin Verification Code
                    </h1>
                  </td>
                </tr>

                <!-- Subtitle -->
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.6);">
                      A login or registration attempt was initiated for your Studio Admin portal. Enter the 6-digit code below to unlock the dashboard.
                    </p>
                  </td>
                </tr>

                <!-- OTP Code Display Card -->
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <div style="background-color: #07080c; border: 2px solid rgba(34,211,238,0.4); border-radius: 16px; padding: 24px; text-align: center;">
                      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.5); margin-bottom: 8px; font-family: monospace;">
                        Your One-Time Password
                      </div>
                      <div style="font-size: 38px; font-weight: 900; letter-spacing: 0.25em; color: #22d3ee; font-family: 'Courier New', Courier, monospace; margin-left: 0.25em;">
                        ${otpCode}
                      </div>
                      <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 10px;">
                        ⏱️ Valid for 5 minutes only
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Security Note -->
                <tr>
                  <td style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);">
                    <p style="margin: 0; font-size: 11px; line-height: 1.6; color: rgba(255,255,255,0.4);">
                      • <strong>Strict Limit:</strong> Only 2 admin accounts are permitted for this portfolio.<br>
                      • If you did not request this verification code, please ignore this email. Your dashboard remains securely locked behind your password.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding-top: 24px;">
                    <p style="margin: 0; font-size: 10px; color: rgba(255,255,255,0.3); font-family: monospace; letter-spacing: 0.05em;">
                      © ${new Date().getFullYear()} STUDIO • SECURE ADMIN PORTAL
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: toEmail,
      subject: `🔐 [SECURITY] Your Admin Verification Code: ${otpCode}`,
      text: `Your Studio 2FA verification code is: ${otpCode}. It expires in 5 minutes. Strict limit: Maximum 2 admin accounts allowed.`,
      html: htmlContent,
    });

    return {
      success: true,
      delivered: true,
      message: `Real 2FA OTP code successfully sent to ${toEmail}! Check your inbox.`,
    };
  } catch (err: any) {
    console.error("Failed to send OTP email via SMTP:", err);
    return {
      success: false,
      delivered: false,
      message: `Failed to deliver email: ${err.message}`,
      error: err.message,
    };
  }
}
