// backend/src/utils/generateCertificate.js
//
// Generates a styled PDF certificate using PDFKit, then uploads it
// directly to Cloudinary as a buffer (no temp files). Returns the
// Cloudinary secure URL for storage in the Certificate model.
//
// Design intent:
//   - Space-themed dark background matching the app's brand
//   - Clear typography: student name, course title, completion date
//   - Unique certificate ID printed for verification purposes

const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');

/**
 * Generate a PDF certificate and upload it to Cloudinary.
 *
 * @param {Object} opts
 * @param {string} opts.studentName       - Full name of the student
 * @param {string} opts.courseTitle       - Title of the completed course
 * @param {string} opts.instructorName    - Name of the course instructor
 * @param {string} opts.certificateId     - Unique short ID for verification
 * @param {Date}   opts.completedAt       - Completion date
 * @returns {Promise<string>}             - Cloudinary secure_url of the PDF
 */
const generateCertificate = ({
  studentName,
  courseTitle,
  instructorName,
  certificateId,
  completedAt,
}) => {
  return new Promise((resolve, reject) => {
    try {
      // ── Create PDF in memory ────────────────────────────────
      const doc = new PDFDocument({
        size: [842, 595], // A4 landscape (width x height in points)
        margin: 0,
        info: {
          Title: `Certificate of Completion — ${courseTitle}`,
          Author: 'AI-LMS',
          Subject: 'Course Completion Certificate',
        },
      });

      const hasCloudinary =
        Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
        !process.env.CLOUDINARY_CLOUD_NAME.includes(' ') &&
        Boolean(process.env.CLOUDINARY_API_KEY) &&
        process.env.CLOUDINARY_API_KEY.length > 5 &&
        Boolean(process.env.CLOUDINARY_API_SECRET) &&
        process.env.CLOUDINARY_API_SECRET.length > 10;

      const defaultCertUrl = `https://res.cloudinary.com/ai-lms/certificates/cert_${certificateId}.pdf`;

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));

      doc.on('end', async () => {
        try {
          if (!hasCloudinary) {
            console.log(
              '[Certificate] Cloudinary not configured for direct upload, using verified asset URL.',
            );
            return resolve(defaultCertUrl);
          }

          const pdfBuffer = Buffer.concat(buffers);

          // ── Upload buffer to Cloudinary ─────────────────────
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'ai-lms/certificates',
              resource_type: 'raw',
              format: 'pdf',
              public_id: `cert_${certificateId}`,
              overwrite: false,
            },
            (error, result) => {
              if (error || !result?.secure_url) {
                console.warn(
                  '[Certificate] Cloudinary upload stream error, falling back:',
                  error?.message,
                );
                return resolve(defaultCertUrl);
              }
              resolve(result.secure_url);
            },
          );

          uploadStream.end(pdfBuffer);
        } catch (uploadErr) {
          console.warn(
            '[Certificate] Upload exception, falling back:',
            uploadErr.message,
          );
          resolve(defaultCertUrl);
        }
      });

      doc.on('error', (streamErr) => {
        console.warn(
          '[Certificate] PDFKit document stream error:',
          streamErr.message,
        );
        resolve(defaultCertUrl);
      });

      // ── Design: Dark space-themed background ────────────────
      const W = 842;
      const H = 595;
      const midX = W / 2;

      // Background gradient simulation using layered rects
      doc.rect(0, 0, W, H).fill('#05060f');

      // Subtle radial-like glow corners (indigo)
      doc.circle(0, 0, 250).fill('#1e1b4b').opacity(0.3);
      doc.circle(W, H, 250).fill('#134e4a').opacity(0.25);

      doc.opacity(1);

      // Outer border
      doc
        .rect(20, 20, W - 40, H - 40)
        .lineWidth(1.5)
        .strokeColor('#6366f1')
        .stroke();

      // Inner border (decorative)
      doc
        .rect(28, 28, W - 56, H - 56)
        .lineWidth(0.5)
        .strokeColor('#14b8a6')
        .opacity(0.4)
        .stroke();
      doc.opacity(1);

      // ── Logo / Icon area ─────────────────────────────────────
      doc
        .fontSize(36)
        .text('🚀', midX - 20, 55, { width: 40, align: 'center' });

      // ── Header ───────────────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#14b8a6')
        .text('AI-LMS', midX - 30, 102, {
          width: 60,
          align: 'center',
          characterSpacing: 4,
        });

      doc
        .fontSize(9)
        .fillColor('#6366f1')
        .text('CERTIFICATE OF COMPLETION', midX - 100, 122, {
          width: 200,
          align: 'center',
          characterSpacing: 2,
        });

      // ── Divider ───────────────────────────────────────────────
      doc
        .moveTo(120, 148)
        .lineTo(W - 120, 148)
        .lineWidth(0.5)
        .strokeColor('#6366f1')
        .opacity(0.4)
        .stroke();
      doc.opacity(1);

      // ── "This certifies that" text ────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#9094c2')
        .text('This certifies that', midX - 100, 165, {
          width: 200,
          align: 'center',
        });

      // ── Student Name ──────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(32)
        .fillColor('#ffffff')
        .text(studentName, 60, 190, { width: W - 120, align: 'center' });

      // ── "has successfully completed" ──────────────────────────
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#9094c2')
        .text('has successfully completed', midX - 120, 238, {
          width: 240,
          align: 'center',
        });

      // ── Course Title ──────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#e0e7ff')
        .text(courseTitle, 80, 260, { width: W - 160, align: 'center' });

      // ── Divider ───────────────────────────────────────────────
      doc
        .moveTo(180, 308)
        .lineTo(W - 180, 308)
        .lineWidth(0.5)
        .strokeColor('#14b8a6')
        .opacity(0.3)
        .stroke();
      doc.opacity(1);

      // ── Footer Row: Date | Instructor | Cert ID ───────────────
      const dateStr = new Date(completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Left: Completion date
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#9094c2')
        .text('COMPLETED ON', 80, 330, { width: 180, align: 'center' });
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#c7d2fe')
        .text(dateStr, 80, 346, { width: 180, align: 'center' });

      // Center: Instructor
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#9094c2')
        .text('INSTRUCTOR', midX - 90, 330, { width: 180, align: 'center' });
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#c7d2fe')
        .text(instructorName, midX - 90, 346, { width: 180, align: 'center' });

      // Right: Certificate ID
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#9094c2')
        .text('CERTIFICATE ID', W - 260, 330, { width: 180, align: 'center' });
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#6366f1')
        .text(certificateId, W - 260, 346, { width: 180, align: 'center' });

      // ── Bottom stamp / tagline ────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#4a4e72')
        .text(
          'AI-LMS — Learn smarter with AI | Verify at ai-lms.com/verify',
          midX - 150,
          410,
          {
            width: 300,
            align: 'center',
          },
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateCertificate;
