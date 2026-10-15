// backend/src/services/email.service.js
//
// Professional responsive HTML email templates for Gyanix Academy.
// Designed with executive styling, gold accents, and verified security tokens.

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup (logs warning, doesn't crash the server)
transporter.verify((error) => {
  if (error) {
    console.error(
      '⚠️ SMTP Notice (Gmail App Password required for production delivery):',
      error.message,
    );
  } else {
    console.log('✅ Gyanix Academy SMTP Email Service Ready');
  }
});

// ── Shared Executive Gyanix Academy HTML Email Wrapper ─────────────────
const wrapEmail = (bodyHtml) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #05060f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05060f; padding: 40px 15px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0a0d20; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.25); box-shadow: 0 20px 50px rgba(0,0,0,0.8); overflow: hidden;">

            <!-- Header with Gyanix Academy Insignia -->
            <tr>
              <td align="center" style="padding: 36px 30px 20px; background: linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(10, 13, 32, 0) 100%);">
                <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #2dd4bf); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);">
                  🚀
                </div>
                <h2 style="margin: 14px 0 2px; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">
                  Gyanix<span style="color: #2dd4bf; font-weight: 400;">Academy</span>
                </h2>
                <p style="margin: 0; color: rgba(165, 180, 252, 0.6); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                  Intelligent Learning Portal
                </p>
              </td>
            </tr>

            <!-- Main Body Content -->
            <tr>
              <td style="padding: 10px 36px 36px;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 24px 30px; background-color: #060814; border-top: 1px solid rgba(99, 102, 241, 0.15);">
                <p style="margin: 0 0 6px; color: rgba(165, 180, 252, 0.5); font-size: 12px;">
                  © ${new Date().getFullYear()} Gyanix Academy. All rights reserved.
                </p>
                <p style="margin: 0; color: rgba(165, 180, 252, 0.35); font-size: 11px;">
                  This is an automated administrative notification. Please do not reply directly to this email.
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

const FROM =
  process.env.EMAIL_FROM || '"Gyanix Academy" <security@gyanix-academy.com>';

// ─── Welcome Email (sent on registration) ─────────────────────
const sendWelcomeEmail = async (toEmail, name) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: '🎉 Welcome to Gyanix Academy — Your Scholar Portal is Active!',
      html: wrapEmail(`
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 10px;">Welcome to Gyanix Academy, ${name}! 🎉</h1>
          <p style="color: rgba(199, 210, 254, 0.8); font-size: 14px; line-height: 1.6; margin: 0;">
            Your executive learning profile is confirmed. Access industry-verified curriculums, AI assessments, and verified certifications.
          </p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 16px;">
            Ready to explore verified engineering & AI programs?
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses"
            style="display: inline-block; background: linear-gradient(135deg, #2dd4bf, #6366f1); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 8px 20px rgba(45, 212, 191, 0.35);">
            Explore Academy Courses →
          </a>
        </div>
      `),
    });
  } catch (error) {
    console.error('Welcome email delivery note:', error.message);
  }
};

// ─── Password Reset Email ──────────────────────────────────────
const sendPasswordReset = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: '🔐 Reset your Gyanix Academy Account Password',
      html: wrapEmail(`
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 10px;">
            Password Reset Request
          </h1>
          <p style="color: rgba(199, 210, 254, 0.8); font-size: 14px; line-height: 1.6; margin: 0;">
            We received an official request to reset the password for your Gyanix Academy account.
          </p>
        </div>

        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 14px; padding: 26px; text-align: center; margin: 24px 0;">
          <p style="color: #ffffff; font-size: 14px; margin: 0 0 20px; line-height: 1.5;">
            Click the secure button below to set your new credentials. This security token will expire in <strong style="color: #2dd4bf;">10 minutes</strong>.
          </p>

          <a href="${resetUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);">
            Reset Account Password →
          </a>
        </div>

        <div style="background: rgba(255, 255, 255, 0.02); border-radius: 10px; padding: 14px; margin-top: 20px;">
          <p style="color: rgba(165, 180, 252, 0.6); font-size: 12px; margin: 0 0 6px;">
            If the button above does not open, copy and paste this URL into your browser:
          </p>
          <p style="color: #2dd4bf; font-size: 11px; word-break: break-all; margin: 0; font-family: monospace;">
            ${resetUrl}
          </p>
        </div>

        <p style="color: rgba(165, 180, 252, 0.45); font-size: 12px; text-align: center; margin: 24px 0 0;">
          If you did not request this password reset, your credentials remain secure and you can safely disregard this email.
        </p>
      `),
    });
  } catch (error) {
    console.error('SMTP delivery unavailable:', error.code || 'unknown');
    throw Object.assign(new Error('Password reset delivery unavailable'), {
      statusCode: 503,
    });
  }
};

// ─── Course Approved Email (sent to instructor) ────────────────
const sendCourseApproved = async (toEmail, instructorName, courseTitle) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: `✅ Approved: "${courseTitle}" is now live on Gyanix Academy!`,
      html: wrapEmail(`
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 10px;">
          Curriculum Approved! 🎉
        </h1>
        <p style="color: rgba(199, 210, 254, 0.8); text-align: center; margin: 0 0 20px;">
          Hi ${instructorName}, great news from the Academic Board!
        </p>

        <div style="background: rgba(45, 212, 191, 0.08); border: 1px solid rgba(45, 212, 191, 0.3); border-radius: 14px; padding: 24px; margin: 20px 0;">
          <p style="color: rgba(199, 210, 254, 0.7); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 8px;">
            Published Program:
          </p>
          <p style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 14px;">
            "${courseTitle}"
          </p>
          <p style="color: rgba(199, 210, 254, 0.85); font-size: 13px; margin: 0;">
            Your course has been approved and is now live in the catalogue. Students worldwide can enroll and earn verified certifications.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/instructor/courses"
            style="display: inline-block; background: linear-gradient(135deg, #2dd4bf, #6366f1); color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 10px; font-weight: 700; font-size: 14px;">
            View Course in Dashboard →
          </a>
        </div>
      `),
    });
  } catch (error) {
    console.error('Course approval email note:', error.message);
  }
};

// ─── Course Rejected Email (sent to instructor) ────────────────
const sendCourseRejected = async (
  toEmail,
  instructorName,
  courseTitle,
  feedback,
) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: `📋 Changes Requested: "${courseTitle}" — Gyanix Academy`,
      html: wrapEmail(`
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 10px;">
          Curriculum Revision Requested
        </h1>
        <p style="color: rgba(199, 210, 254, 0.8); text-align: center; margin: 0 0 20px;">
          Hi ${instructorName},
        </p>

        <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 14px; padding: 24px; margin: 20px 0;">
          <p style="color: #ffffff; font-size: 16px; font-weight: 700; margin: 0 0 14px;">
            "${courseTitle}"
          </p>
          ${
            feedback
              ? `
            <p style="color: #fb7185; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">
              Admin Review Notes:
            </p>
            <div style="color: #e0e7ff; background: rgba(0, 0, 0, 0.3); border-left: 3px solid #fb7185; border-radius: 6px; padding: 12px; margin: 0; font-size: 13px; line-height: 1.5;">
              ${feedback}
            </div>
          `
              : ''
          }
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/instructor/courses"
            style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; padding: 13px 30px; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Update Course in Studio →
          </a>
        </div>
      `),
    });
  } catch (error) {
    console.error('Course revision email note:', error.message);
  }
};

// ─── Certificate Issued Email (sent to student) ────────────────
const sendCertificateIssued = async (
  toEmail,
  studentName,
  courseTitle,
  certificateUrl,
) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: `🏆 Certificate Issued: "${courseTitle}" — Gyanix Academy`,
      html: wrapEmail(`
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 10px;">
          Congratulations, ${studentName}! 🏆
        </h1>
        <p style="color: rgba(199, 210, 254, 0.8); text-align: center; margin: 0 0 20px;">
          You have successfully completed and passed the official certification assessment for:
        </p>

        <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 14px; padding: 24px; text-align: center; margin: 20px 0;">
          <p style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0 0 16px;">
            "${courseTitle}"
          </p>
          <a href="${certificateUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #2dd4bf, #6366f1); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 10px 25px rgba(45, 212, 191, 0.4);">
            View Official Diploma →
          </a>
        </div>
      `),
    });
  } catch (error) {
    console.error('Certificate email note:', error.message);
  }
};

// ─── Course Edit / Change Request Email (sent to instructor) ─────
const sendCourseChangeRequest = async (
  toEmail,
  instructorName,
  courseTitle,
  feedback,
  actionNeeded,
) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: `⚠️ Action Required: Changes requested for "${courseTitle}"`,
      html: wrapEmail(`
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 10px;">
          Course Updates Requested ✏️
        </h1>
        <p style="color: rgba(199, 210, 254, 0.8); text-align: center; margin: 0 0 20px;">
          Hi ${instructorName},
        </p>
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 24px; margin: 20px 0;">
          <p style="color: #ffffff; font-size: 17px; font-weight: 600; margin: 0 0 16px;">"${courseTitle}"</p>
          ${
            actionNeeded
              ? `
            <p style="color: #f59e0b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">Status Update:</p>
            <p style="color: #e0e7ff; margin: 0 0 14px; font-size: 14px;">${actionNeeded}</p>
          `
              : ''
          }
          ${
            feedback
              ? `
            <p style="color: #f59e0b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">Admin Instructions / Feedback:</p>
            <div style="color: #e0e7ff; background: rgba(0,0,0,0.3); border-left: 3px solid #f59e0b; border-radius: 6px; padding: 14px; margin: 0; font-size: 14px; line-height: 1.5;">
              ${feedback}
            </div>
          `
              : ''
          }
        </div>
      `),
    });
  } catch (error) {
    console.error('Course change request email note:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordReset,
  sendCourseApproved,
  sendCourseRejected,
  sendCourseChangeRequest,
  sendCertificateIssued,
};
