/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowLeft,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function CertificatePage() {
  const { id } = useParams();
  const certId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const { data, isLoading, error } = useSWR(
    certId ? `/users/certificates/${certId}` : null,
    fetcher
  );

  const cert = data?.data;

  const handleDownloadPDF = () => {
    if (!certId) return;
    toast.success('Generating official Gyanix Academy diploma PDF...');
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/certificates/${certId}/pdf`;
    window.open(downloadUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate verification link copied to clipboard!');
    }
  };

  const studentName = cert?.studentName || cert?.student?.name || 'Distinguished Scholar';
  const courseTitle = cert?.courseTitle || cert?.course?.title || 'Advanced Master Curriculum';
  const instructorName = cert?.instructorName || cert?.course?.instructor?.name || 'James Brookes';
  const certificateCode = cert?.certificateId || cert?._id || certId;

  // Format formal date e.g. "22nd of August, 2026"
  const formattedDate = (() => {
    const d = cert?.completedAt ? new Date(cert.completedAt) : new Date();
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
    return `${day}${suffix} of ${month}, ${year}`;
  })();

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const linkedInShareUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    courseTitle
  )}&organizationName=Gyanix%20Academy&issueYear=${new Date(
    cert?.completedAt || Date.now()
  ).getFullYear()}&issueMonth=${
    new Date(cert?.completedAt || Date.now()).getMonth() + 1
  }&certId=${encodeURIComponent(certificateCode)}&certUrl=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div className="min-h-screen bg-[#05060f] text-white relative py-8 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Navigation & Toolbar (hidden during print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200/70 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Learning Dashboard</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2.5 rounded-xl glow-btn-primary font-semibold text-xs inline-flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-indigo-500/20 text-xs font-semibold text-indigo-200 hover:text-white transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Diploma</span>
            </button>

            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#0077b5]/20 hover:bg-[#0077b5]/30 border border-[#0077b5]/40 text-xs font-semibold text-[#38bdf8] inline-flex items-center gap-2 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.02-3.28 1.64 1.64 0 0 0 .02 3.28M5.07 18.5h2.79v-8.37H5.07v8.37Z" />
              </svg>
              <span>Add to LinkedIn</span>
            </a>

            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-indigo-500/20 text-indigo-300 hover:text-white transition cursor-pointer"
              title="Copy Verification Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Verification Status Pill (hidden during print) */}
        <div className="glass-card rounded-2xl p-4 border border-teal-500/30 bg-teal-500/5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Officially Verified Gyanix Academy Credential
              </p>
              <p className="text-[11px] text-teal-300 font-mono">
                Verification Key: {certificateCode}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Permanent Ledger Record</span>
          </div>
        </div>

        {/* ── CLASSIC LUXURY IVORY & GOLD DIPLOMA (Matching Screenshot 3) ── */}
        <div className="relative shadow-[0_25px_70px_rgba(0,0,0,0.85)] rounded-2xl overflow-hidden print:shadow-none print:m-0 print:p-0 print:border-none print:rounded-none">
          <div
            id="certificate-print-canvas"
            className="w-full bg-[#fdfbf7] text-[#1e293b] p-8 sm:p-14 relative overflow-hidden flex flex-col justify-between aspect-[1.414/1] min-h-[640px] select-none"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #ffffff 0%, #faf6ee 60%, #f4ede0 100%)`,
            }}
          >
            {/* Vintage Subtle Watermark Pattern */}
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#2a5a52 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* ── BAROQUE GUILLOCHE ENGRAVED TEAL & GOLD FRAME ── */}
            {/* Outer Deep Teal Guilloche Engraved Border */}
            <div className="absolute inset-3 sm:inset-5 border-[6px] sm:border-[10px] border-[#2a5a52] pointer-events-none" />

            {/* Inset Gold Foil Pinstripe */}
            <div className="absolute inset-5 sm:inset-8 border-[1.5px] border-[#c6a664] pointer-events-none" />

            {/* Inner Fine Guilloche Border */}
            <div className="absolute inset-6 sm:inset-10 border border-[#2a5a52]/40 pointer-events-none" />

            {/* Four Corner Rosette Ornaments */}
            <svg
              className="absolute top-4 sm:top-7 left-4 sm:left-7 w-12 h-12 sm:w-16 sm:h-16 text-[#2a5a52] pointer-events-none"
              viewBox="0 0 100 100"
            >
              <path
                d="M 10 10 Q 50 10 50 50 Q 10 50 10 10 Z"
                fill="#2a5a52"
                opacity="0.9"
              />
              <circle cx="28" cy="28" r="8" fill="#c6a664" />
              <path
                d="M 10 10 L 90 10 L 10 90 Z"
                fill="none"
                stroke="#c6a664"
                strokeWidth="1.5"
              />
            </svg>

            <svg
              className="absolute top-4 sm:top-7 right-4 sm:right-7 w-12 h-12 sm:w-16 sm:h-16 text-[#2a5a52] pointer-events-none rotate-90"
              viewBox="0 0 100 100"
            >
              <path
                d="M 10 10 Q 50 10 50 50 Q 10 50 10 10 Z"
                fill="#2a5a52"
                opacity="0.9"
              />
              <circle cx="28" cy="28" r="8" fill="#c6a664" />
              <path
                d="M 10 10 L 90 10 L 10 90 Z"
                fill="none"
                stroke="#c6a664"
                strokeWidth="1.5"
              />
            </svg>

            <svg
              className="absolute bottom-4 sm:bottom-7 left-4 sm:left-7 w-12 h-12 sm:w-16 sm:h-16 text-[#2a5a52] pointer-events-none -rotate-90"
              viewBox="0 0 100 100"
            >
              <path
                d="M 10 10 Q 50 10 50 50 Q 10 50 10 10 Z"
                fill="#2a5a52"
                opacity="0.9"
              />
              <circle cx="28" cy="28" r="8" fill="#c6a664" />
              <path
                d="M 10 10 L 90 10 L 10 90 Z"
                fill="none"
                stroke="#c6a664"
                strokeWidth="1.5"
              />
            </svg>

            <svg
              className="absolute bottom-4 sm:bottom-7 right-4 sm:right-7 w-12 h-12 sm:w-16 sm:h-16 text-[#2a5a52] pointer-events-none rotate-180"
              viewBox="0 0 100 100"
            >
              <path
                d="M 10 10 Q 50 10 50 50 Q 10 50 10 10 Z"
                fill="#2a5a52"
                opacity="0.9"
              />
              <circle cx="28" cy="28" r="8" fill="#c6a664" />
              <path
                d="M 10 10 L 90 10 L 10 90 Z"
                fill="none"
                stroke="#c6a664"
                strokeWidth="1.5"
              />
            </svg>

            {/* ── CERTIFICATE CONTENT ── */}
            <div className="relative z-10 space-y-6 sm:space-y-8 text-center flex-1 flex flex-col justify-between py-2 sm:py-4 px-4 sm:px-10">
              {/* Header Title Section */}
              <div className="space-y-1 sm:space-y-2">
                {/* Brand Insignia */}
                <div className="flex items-center justify-center gap-2 text-[#2a5a52] mb-1">
                  <Award className="w-5 h-5 text-[#c6a664]" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#2a5a52]">
                    Gyanix Academy
                  </span>
                  <Award className="w-5 h-5 text-[#c6a664]" />
                </div>

                <h1
                  className="text-4xl sm:text-6xl font-serif tracking-[0.08em] text-[#0f172a] uppercase font-light"
                  style={{ fontFamily: 'Cinzel, Georgia, serif' }}
                >
                  Certificate
                </h1>

                <p
                  className="text-sm sm:text-lg uppercase tracking-[0.35em] text-[#2a5a52] font-semibold"
                  style={{ fontFamily: 'Cinzel, Georgia, serif' }}
                >
                  of Achievement
                </p>

                {/* Classical Ornamental Scroll Divider */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent to-[#c6a664]" />
                  <span className="text-[#c6a664] text-xs">❖ ── ❖</span>
                  <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-l from-transparent to-[#c6a664]" />
                </div>
              </div>

              {/* Recipient Presentation */}
              <div className="space-y-3">
                <p
                  className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#475569] font-medium"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  This Certificate is Proudly Presented To
                </p>

                {/* Calligraphic Recipient Name */}
                <div className="relative inline-block px-4 py-1">
                  <h2
                    className="text-4xl sm:text-6xl text-[#b45309] tracking-normal font-serif capitalize"
                    style={{
                      fontFamily: '"Playfair Display", "Great Vibes", "Georgia", cursive, serif',
                      fontStyle: 'italic',
                      color: '#b45309',
                      textShadow: '0 1px 2px rgba(180,83,9,0.15)',
                    }}
                  >
                    {studentName}
                  </h2>
                  {/* Elegant Golden Calligraphic Underline */}
                  <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#c6a664] to-transparent mt-1" />
                </div>

                {/* Recognition & Course Title Statement */}
                <p
                  className="text-xs sm:text-sm text-[#334155] max-w-2xl mx-auto leading-relaxed pt-2"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  in recognition of your outstanding performance, dedication, and verified mastery in the{' '}
                  <span className="font-bold text-[#0f172a] underline decoration-[#c6a664]/60">
                    {courseTitle}
                  </span>
                  . Your exceptional contributions and commitment to excellence have significantly advanced our team&apos;s success.
                </p>
              </div>

              {/* ── FOOTER: DATE, GOLD MEDALLION & SIGNATURE ── */}
              <div className="pt-6 sm:pt-10 flex items-end justify-between gap-4 px-2 sm:px-6 relative">
                {/* Formal Date Block (Left) */}
                <div className="text-left space-y-1 w-44 sm:w-56">
                  <p
                    className="text-xs sm:text-sm text-[#1e293b] font-medium"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {formattedDate}
                  </p>
                  <div className="h-[1px] w-36 sm:w-44 bg-[#94a3b8]" />
                  <p className="text-[10px] sm:text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                    Date of Conferment
                  </p>
                </div>

                {/* Radiant 3D Sunburst Gold Foil Medallion Seal (Center) */}
                <div className="flex flex-col items-center justify-center -mb-2">
                  <div className="relative flex items-center justify-center">
                    {/* Radiant Sun-Ray Star SVG */}
                    <svg
                      className="w-18 h-18 sm:w-24 sm:h-24 drop-shadow-[0_4px_12px_rgba(217,119,6,0.45)] animate-pulse-slow"
                      viewBox="0 0 100 100"
                    >
                      <defs>
                        <radialGradient id="sunburstFoil" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="45%" stopColor="#f59e0b" />
                          <stop offset="85%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#92400e" />
                        </radialGradient>
                      </defs>

                      {/* 24-point Sunburst Rosette Star */}
                      <path
                        d="M 50 0 L 55 18 L 71 6 L 68 25 L 88 20 L 78 37 L 98 39 L 82 53 L 99 62 L 81 71 L 91 85 L 73 85 L 75 100 L 59 92 L 50 100 L 41 92 L 25 100 L 27 85 L 9 85 L 19 71 L 1 62 L 18 53 L 2 39 L 22 37 L 12 20 L 32 25 L 29 6 L 45 18 Z"
                        fill="url(#sunburstFoil)"
                        stroke="#92400e"
                        strokeWidth="0.75"
                      />

                      {/* Inner Gold Embossed Rim */}
                      <circle cx="50" cy="50" r="28" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" />
                      <circle cx="50" cy="50" r="24" fill="#d97706" stroke="#92400e" strokeWidth="1" />
                    </svg>

                    {/* Seal Emblem Typography */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[7px] sm:text-[9px] font-extrabold text-[#fef08a] uppercase tracking-wider leading-tight drop-shadow-sm">
                        OFFICIAL
                      </span>
                      <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest leading-tight drop-shadow">
                        SEAL
                      </span>
                      <span className="text-[6px] sm:text-[8px] text-[#fef08a] font-bold">
                        ★ VERIFIED ★
                      </span>
                    </div>
                  </div>
                </div>

                {/* Faculty Signature Block (Right) */}
                <div className="text-right space-y-1 w-44 sm:w-56">
                  {/* Calligraphic Handwritten Signature */}
                  <p
                    className="text-xl sm:text-2xl text-[#1e293b] leading-tight font-serif"
                    style={{
                      fontFamily: '"Playfair Display", "Great Vibes", cursive, serif',
                      fontStyle: 'italic',
                    }}
                  >
                    {instructorName}
                  </p>
                  <div className="h-[1px] w-36 sm:w-44 bg-[#94a3b8] ml-auto" />
                  <p className="text-[10px] sm:text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                    {instructorName}, Faculty Director
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
