// backend/src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const {
  getMe,
  updateProfile,
  getEnrolledCourses,
  getCompletedCourses,
  getUserCertificates,
} = require('../controllers/user.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const Certificate = require('../models/Certificate');

// ─── PROTECTED USER PROFILE ROUTES ──────────────────────────
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.get('/enrolled-courses', protect, getEnrolledCourses);
router.get('/completed-courses', protect, getCompletedCourses);
router.get('/certificates', protect, getUserCertificates);

// ─── PUBLIC / VERIFIABLE CERTIFICATE LOOKUP ──────────────────
router.get('/certificates/:id', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    let cert = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await Certificate.findById(id)
        .populate('student', 'name avatar')
        .populate('course', 'title category level thumbnail');
    }
    if (!cert) {
      cert = await Certificate.findOne({ certificateId: id })
        .populate('student', 'name avatar')
        .populate('course', 'title category level thumbnail');
    }
    if (
      !cert ||
      !cert.isValid ||
      !cert.assessmentAttempt ||
      !(await require('../models/QuizAttempt').exists({
        _id: cert.assessmentAttempt,
        status: 'submitted',
        'result.passed': true,
      }))
    ) {
      return res
        .status(404)
        .json({ success: false, message: 'Certificate not found' });
    }
    res.json({ success: true, data: cert });
  } catch (error) {
    next(error);
  }
});

// ─── DIRECT HIGH-RES PDF STREAM (CLASSIC IVORY & GOLD DIPLOMA) ───────
router.get('/certificates/:id/pdf', optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    let cert = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cert = await Certificate.findById(id)
        .populate('student', 'name')
        .populate('course', 'title');
    }
    if (!cert) {
      cert = await Certificate.findOne({ certificateId: id })
        .populate('student', 'name')
        .populate('course', 'title');
    }

    if (
      !cert ||
      !cert.isValid ||
      !cert.assessmentAttempt ||
      !(await require('../models/QuizAttempt').exists({
        _id: cert.assessmentAttempt,
        status: 'submitted',
        'result.passed': true,
      }))
    ) {
      return res
        .status(404)
        .json({ success: false, message: 'Certificate not found' });
    }

    const doc = new PDFDocument({
      size: [842, 595], // A4 landscape
      margin: 0,
      info: {
        Title: `Certificate of Achievement — ${cert.courseTitle}`,
        Author: 'Gyanix Academy Academic Board',
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Gyanix_Academy_Certificate_${cert.certificateId}.pdf"`,
    );

    doc.pipe(res);

    const W = 842;
    const H = 595;
    const midX = W / 2;

    // Background: Classic Warm Ivory Parchment (Screenshot 3 style)
    doc.rect(0, 0, W, H).fill('#fdfbf7');

    // Outer Deep Teal Guilloche Frame
    doc
      .rect(20, 20, W - 40, H - 40)
      .lineWidth(7)
      .strokeColor('#2a5a52')
      .stroke();

    // Inset Gold Foil Line
    doc
      .rect(28, 28, W - 56, H - 56)
      .lineWidth(1.5)
      .strokeColor('#c6a664')
      .stroke();

    // Inner Fine Guilloche Border
    doc
      .rect(34, 34, W - 68, H - 68)
      .lineWidth(0.8)
      .strokeColor('#2a5a52')
      .stroke();

    // Header: Gyanix Academy Insignia
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#2a5a52')
      .text('❖   GYANIX ACADEMY   ❖', 0, 52, {
        align: 'center',
        characterSpacing: 4,
      });

    // Certificate Title
    doc
      .font('Times-Roman')
      .fontSize(36)
      .fillColor('#0f172a')
      .text('CERTIFICATE', 0, 72, { align: 'center', characterSpacing: 6 });
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#2a5a52')
      .text('OF ACHIEVEMENT', 0, 114, { align: 'center', characterSpacing: 5 });

    // Ornamental Divider
    doc
      .moveTo(260, 134)
      .lineTo(midX - 15, 134)
      .lineWidth(1)
      .strokeColor('#c6a664')
      .stroke();
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#c6a664')
      .text('❖', midX - 4, 130);
    doc
      .moveTo(midX + 15, 134)
      .lineTo(W - 260, 134)
      .lineWidth(1)
      .strokeColor('#c6a664')
      .stroke();

    // Preamble
    doc
      .font('Times-Roman')
      .fontSize(11)
      .fillColor('#475569')
      .text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 0, 155, {
        align: 'center',
        characterSpacing: 2,
      });

    // Recipient Name (Warm Gold/Bronze Calligraphic Style)
    doc
      .font('Times-Italic')
      .fontSize(38)
      .fillColor('#b45309')
      .text(cert.studentName, 0, 182, { align: 'center' });
    doc
      .moveTo(220, 230)
      .lineTo(W - 220, 230)
      .lineWidth(1)
      .strokeColor('#c6a664')
      .stroke();

    // Recognition Body
    doc
      .font('Times-Roman')
      .fontSize(11)
      .fillColor('#334155')
      .text(
        'in recognition of your outstanding performance, dedication, and verified mastery in the',
        90,
        250,
        { width: W - 180, align: 'center', lineGap: 3 },
      );
    doc
      .font('Times-Bold')
      .fontSize(15)
      .fillColor('#0f172a')
      .text(`"${cert.courseTitle}"`, 90, 270, {
        width: W - 180,
        align: 'center',
      });
    doc
      .font('Times-Roman')
      .fontSize(10)
      .fillColor('#475569')
      .text(
        "Your exceptional contributions and commitment to excellence have significantly advanced our team's success.",
        100,
        294,
        { width: W - 200, align: 'center' },
      );

    // Format Date string
    const d = new Date(cert.completedAt || cert.createdAt);
    const day = d.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th';
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();
    const formattedDate = `${day}${suffix} of ${month}, ${year}`;

    // Date Block (Left)
    doc
      .font('Times-Roman')
      .fontSize(12)
      .fillColor('#1e293b')
      .text(formattedDate, 80, 420, { width: 180, align: 'center' });
    doc
      .moveTo(80, 440)
      .lineTo(260, 440)
      .lineWidth(1)
      .strokeColor('#94a3b8')
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#64748b')
      .text('DATE OF CONFERMENT', 80, 446, {
        width: 180,
        align: 'center',
        characterSpacing: 1,
      });

    // Faculty Director Signature (Right)
    doc
      .font('Times-Italic')
      .fontSize(18)
      .fillColor('#1e293b')
      .text(cert.instructorName || 'James Brookes', W - 260, 415, {
        width: 180,
        align: 'center',
      });
    doc
      .moveTo(W - 260, 440)
      .lineTo(W - 80, 440)
      .lineWidth(1)
      .strokeColor('#94a3b8')
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#64748b')
      .text(
        `${cert.instructorName || 'James Brookes'}, Faculty Director`,
        W - 260,
        446,
        { width: 180, align: 'center', characterSpacing: 0.5 },
      );

    // Radiant Gold Sunburst Seal (Center)
    doc.circle(midX, 420, 36).lineWidth(2).strokeColor('#92400e').stroke();
    doc.circle(midX, 420, 32).fill('#d97706');
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#fef08a')
      .text('OFFICIAL', midX - 30, 410, { width: 60, align: 'center' });
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text('SEAL', midX - 30, 420, { width: 60, align: 'center' });
    doc
      .font('Helvetica')
      .fontSize(6)
      .fillColor('#fef08a')
      .text('★ VERIFIED ★', midX - 30, 432, { width: 60, align: 'center' });

    // Footer Verification Key
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#2a5a52')
      .text(`OFFICIAL DIPLOMA ID: ${cert.certificateId}`, 0, 520, {
        align: 'center',
        characterSpacing: 1,
      });
    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor('#94a3b8')
      .text(
        `Verify authenticity at gyanix-academy.com/certificates/${cert.certificateId}`,
        0,
        534,
        { align: 'center' },
      );

    doc.end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
