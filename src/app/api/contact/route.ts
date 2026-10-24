import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";
import { isMongoConfigured, getSiteDataFromMongo } from "@/lib/mongodb";

const RUNTIME_DATA_PATH = path.join(process.cwd(), "data", "site-data.json");
const FALLBACK_DATA_PATH = path.join(process.cwd(), "src", "data", "site-data.json");

const TARGET_EMAIL = "info@artsavvy.co.in";

async function getSiteSecurityAndContact() {
  if (isMongoConfigured()) {
    try {
      const mongoData = await getSiteDataFromMongo();
      if (mongoData && Object.keys(mongoData).length > 0) {
        return {
          smtp: mongoData.security?.smtp,
          contactEmail: mongoData.contact?.email || TARGET_EMAIL,
        };
      }
    } catch {}
  }

  try {
    const raw = await fs.readFile(RUNTIME_DATA_PATH, "utf-8");
    const json = JSON.parse(raw);
    return {
      smtp: json.security?.smtp,
      contactEmail: json.contact?.email || TARGET_EMAIL,
    };
  } catch {
    try {
      const fallback = await fs.readFile(FALLBACK_DATA_PATH, "utf-8");
      const json = JSON.parse(fallback);
      return {
        smtp: json.security?.smtp,
        contactEmail: json.contact?.email || TARGET_EMAIL,
      };
    } catch {
      return {
        smtp: undefined,
        contactEmail: TARGET_EMAIL,
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, projectType, message } = body;

    // Validate Input
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json(
        { error: "Please enter a project scope or message." },
        { status: 400 }
      );
    }

    const { smtp, contactEmail } = await getSiteSecurityAndContact();
    const recipient = contactEmail || TARGET_EMAIL;

    // Configure Transporter
    const smtpUser = smtp?.user || process.env.SMTP_USER || "avadhkheni1@gmail.com";
    const smtpPass = smtp?.pass || process.env.SMTP_PASS || "brsx igyu auzk mmsj";
    const smtpHost = smtp?.host || process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = smtp?.port || Number(process.env.SMTP_PORT) || 465;
    const isSecure = smtp?.secure !== undefined ? smtp.secure : smtpPort === 465;

    let transporter: nodemailer.Transporter;

    if (smtp?.service === "gmail" || smtpHost.includes("gmail")) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanType = (projectType || "General Inquiry").trim();
    const cleanMessage = message.trim();
    const formattedDate = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Project Inquiry - ArtSavvy</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #08090d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08090d; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #111218; border: 1px solid #232530; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                
                <!-- HEADER -->
                <tr>
                  <td style="padding: 32px 36px; background: linear-gradient(135deg, #181922 0%, #0e0f14 100%); border-bottom: 1px solid #232530;">
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #ff3344; margin-bottom: 6px;">
                      ✦ NEW PORTFOLIO INQUIRY
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      ${cleanName} wants to initiate a project
                    </h1>
                    <p style="margin: 6px 0 0; font-size: 12px; color: #8e90a2;">
                      Received on ${formattedDate}
                    </p>
                  </td>
                </tr>

                <!-- DETAILS -->
                <tr>
                  <td style="padding: 32px 36px;">
                    
                    <!-- PROJECT TYPE BADGE -->
                    <div style="margin-bottom: 24px;">
                      <span style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 100px; font-size: 12px; font-weight: 600; color: #ffffff; letter-spacing: 0.5px;">
                        Scope: ${cleanType}
                      </span>
                    </div>

                    <!-- CLIENT INFO TABLE -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #171821; border: 1px solid #262835; border-radius: 12px;">
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #262835; font-size: 13px; color: #8e90a2; width: 100px;">
                          Client Name
                        </td>
                        <td style="padding: 14px 18px; border-bottom: 1px solid #262835; font-size: 14px; font-weight: 600; color: #ffffff;">
                          ${cleanName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px; font-size: 13px; color: #8e90a2;">
                          Client Email
                        </td>
                        <td style="padding: 14px 18px; font-size: 14px; font-weight: 600; color: #4da6ff;">
                          <a href="mailto:${cleanEmail}" style="color: #4da6ff; text-decoration: none;">${cleanEmail}</a>
                        </td>
                      </tr>
                    </table>

                    <!-- MESSAGE BODY -->
                    <div style="margin-bottom: 30px;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8e90a2; margin-bottom: 10px;">
                        Project Scope / Message:
                      </div>
                      <div style="padding: 18px 20px; background-color: #0b0c10; border-left: 3px solid #ffffff; border-radius: 0 10px 10px 0; font-size: 14px; line-height: 1.6; color: #e1e3ec; white-space: pre-wrap;">
                        ${cleanMessage}
                      </div>
                    </div>

                    <!-- REPLY BUTTON -->
                    <div style="text-align: center; margin-top: 10px;">
                      <a href="mailto:${cleanEmail}?subject=${encodeURIComponent("Re: Project Inquiry — " + cleanType)}" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(255,255,255,0.2);">
                        Reply to ${cleanName} &rarr;
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="padding: 20px 36px; background-color: #0c0d12; border-top: 1px solid #1f202a; text-align: center; font-size: 11px; color: #5a5c6d;">
                    ArtSavvy Portfolio Notification System &bull; Sent to ${recipient}
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
      from: `"${cleanName} via Portfolio" <${smtpUser}>`,
      to: recipient,
      replyTo: cleanEmail,
      subject: `✨ Project Inquiry: ${cleanName} (${cleanType})`,
      html: htmlBody,
      text: `New Inquiry from ${cleanName} (${cleanEmail})\nProject Type: ${cleanType}\n\nMessage:\n${cleanMessage}\n\nReceived: ${formattedDate}`,
    });

    return NextResponse.json({
      success: true,
      message: `Thank you, ${cleanName}! Your message has been delivered to ${recipient}. We will get back to you shortly.`,
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      {
        error: "Failed to deliver message via email server. Please try again or reach out directly at " + TARGET_EMAIL,
      },
      { status: 500 }
    );
  }
}
