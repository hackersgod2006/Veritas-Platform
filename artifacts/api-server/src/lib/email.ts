import nodemailer from "nodemailer";
import { logger } from "./logger";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "masmat170290@gmail.com";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn("Email SMTP not configured — emails will be logged only");
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    logger.info({ to, subject }, "Email (not sent — SMTP not configured)");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"Veritas Infrastructure Systems" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info({ to, subject }, "Email sent");
    return true;
  } catch (err) {
    logger.error({ err, to, subject }, "Failed to send email");
    return false;
  }
}

export async function sendPasswordResetEmail(opts: {
  email: string;
  name: string;
  code: string;
}): Promise<boolean> {
  return sendEmail(
    opts.email,
    "Your Veritas Password Reset Code",
    `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1E3A5F;">Password Reset Request</h2>
      <p style="color: #0A1628;">Dear ${opts.name},</p>
      <p style="color: #0A1628;">
        We received a request to reset your password. Use the code below within 15 minutes:
      </p>
      <div style="background: #F1F5F9; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1E3A5F;">${opts.code}</span>
      </div>
      <p style="color: #6B7A99; font-size: 14px;">
        If you did not request a password reset, please ignore this email.
      </p>
      <hr style="margin-top: 32px; border-color: #E2E8F0;" />
      <p style="color: #6B7A99; font-size: 12px;">Veritas Infrastructure Systems, Inc. — Delaware, USA</p>
    </div>
    `
  );
}

export async function notifyAdminNewVerification(professional: {
  name: string;
  email: string;
  skillsCategory: string | null;
  country: string | null;
}): Promise<void> {
  await sendEmail(
    ADMIN_EMAIL,
    `New Verification Application — ${professional.name}`,
    `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1E3A5F;">New Verification Application Received</h2>
      <p style="color: #0A1628;"><strong>Name:</strong> ${professional.name}</p>
      <p style="color: #0A1628;"><strong>Email:</strong> ${professional.email}</p>
      <p style="color: #0A1628;"><strong>Skills Category:</strong> ${professional.skillsCategory || "N/A"}</p>
      <p style="color: #0A1628;"><strong>Country:</strong> ${professional.country || "N/A"}</p>
      <p style="margin-top: 24px;">
        <a href="${process.env.PLATFORM_URL || "https://veritas.co"}/admin"
           style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Review Application
        </a>
      </p>
      <hr style="margin-top: 32px; border-color: #E2E8F0;" />
      <p style="color: #6B7A99; font-size: 12px;">Veritas Infrastructure Systems, Inc. — Delaware, USA</p>
    </div>
    `
  );
}

export async function notifyProfessionalApproved(professional: {
  name: string;
  email: string;
  trustScore: number | null;
  tier: string | null;
  passportId: string | null;
}): Promise<void> {
  await sendEmail(
    professional.email,
    "Your Veritas Trust Passport Has Been Approved",
    `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1E3A5F;">Verification Approved</h2>
      <p style="color: #0A1628;">Dear ${professional.name},</p>
      <p style="color: #0A1628;">
        We are pleased to inform you that your Veritas verification application has been reviewed and approved.
        Your Trust Passport is now active.
      </p>
      <p style="color: #0A1628;"><strong>Trust Score:</strong> ${professional.trustScore || "N/A"}</p>
      <p style="color: #0A1628;"><strong>Tier:</strong> ${professional.tier || "N/A"}</p>
      ${professional.passportId ? `
      <p style="margin-top: 24px;">
        <a href="${process.env.PLATFORM_URL || "https://veritas.co"}/passport/${professional.passportId}"
           style="background: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Your Trust Passport
        </a>
      </p>
      ` : ""}
      <hr style="margin-top: 32px; border-color: #E2E8F0;" />
      <p style="color: #6B7A99; font-size: 12px;">Veritas Infrastructure Systems, Inc. — Delaware, USA</p>
    </div>
    `
  );
}

export async function notifyProfessionalRejected(professional: {
  name: string;
  email: string;
  reason: string;
}): Promise<void> {
  await sendEmail(
    professional.email,
    "Update on Your Veritas Verification Application",
    `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1E3A5F;">Verification Application — Update Required</h2>
      <p style="color: #0A1628;">Dear ${professional.name},</p>
      <p style="color: #0A1628;">
        Thank you for submitting your Veritas verification application. After careful review,
        we are unable to approve your application at this time.
      </p>
      <p style="color: #0A1628;"><strong>Reason:</strong> ${professional.reason}</p>
      <p style="color: #0A1628;">
        You are welcome to address the feedback above and resubmit your application.
        If you have questions, please contact our verification team.
      </p>
      <hr style="margin-top: 32px; border-color: #E2E8F0;" />
      <p style="color: #6B7A99; font-size: 12px;">Veritas Infrastructure Systems, Inc. — Delaware, USA</p>
    </div>
    `
  );
}

export async function notifyAdminNewUser(user: {
  name: string;
  email: string;
  role: string;
}): Promise<void> {
  await sendEmail(
    ADMIN_EMAIL,
    `New User Registration — ${user.name}`,
    `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1E3A5F;">New User Registered</h2>
      <p style="color: #0A1628;"><strong>Name:</strong> ${user.name}</p>
      <p style="color: #0A1628;"><strong>Email:</strong> ${user.email}</p>
      <p style="color: #0A1628;"><strong>Role:</strong> ${user.role}</p>
      <hr style="margin-top: 32px; border-color: #E2E8F0;" />
      <p style="color: #6B7A99; font-size: 12px;">Veritas Infrastructure Systems, Inc. — Delaware, USA</p>
    </div>
    `
  );
}
