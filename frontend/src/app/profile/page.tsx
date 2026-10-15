/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Award,
  ShieldCheck,
  Save,
  ExternalLink,
  BookOpen,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import AstroMascot from '@/components/ui/AstroMascot';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function ProfilePage() {
  const { user, setAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token) return;
        }
      } catch {
        /* Invalid cached browser state is ignored; server authentication remains authoritative. */
      }
    }
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data, mutate } = useSWR('/users/me', fetcher);
  const profileData = data?.data || user;

  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setBio(profileData.bio || '');
      setAvatar(profileData.avatar || '');
      setLinkedinUrl(profileData.learningPreferences?.linkedinUrl || '');
      setGithubUrl(profileData.learningPreferences?.githubUrl || '');
      setPortfolioUrl(profileData.learningPreferences?.portfolioUrl || '');
    }
  }, [profileData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', {
        name,
        bio,
        avatar,
        learningPreferences: {
          ...(profileData?.learningPreferences || {}),
          linkedinUrl,
          githubUrl,
          portfolioUrl,
        },
      });

      const updatedUser = res.data.data;
      const currentToken = localStorage.getItem('token') || '';
      setAuth(updatedUser, currentToken);
      mutate();
      toast.success('Profile and credential settings updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const certificates = profileData?.certificates || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>User Identity & Social Credentials</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Personal Profile Studio
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/60 mt-1">
              Customize your certificate recipient name, professional links, and
              showcase verified credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/${profileData?.role || 'student'}`}
              className="px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition"
            >
              ← My Dashboard
            </Link>
          </div>
        </div>

        {/* Profile Card & Avatar */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <AstroMascot
              role={profileData?.role as any}
              className="w-24 h-24 sm:w-28 sm:h-28"
            />
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-white">
                {name || 'Scholar'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider">
                {profileData?.role}
              </span>
            </div>
            <p className="text-xs text-indigo-200/60">{profileData?.email}</p>

            {/* Role-Specific Badge Status */}
            {profileData?.role === 'admin' ? (
              <p className="text-xs text-teal-400 font-medium pt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  Platform Executive Clearance: Active · System Administrator
                </span>
              </p>
            ) : profileData?.role === 'instructor' ? (
              <p className="text-xs text-teal-400 font-medium pt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Faculty Mentor · Active Instructor</span>
              </p>
            ) : (
              <p className="text-xs text-teal-400 font-medium pt-1">
                Daily Study Streak: {profileData?.learningStreak || 1} Days 🔥
              </p>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <form
          onSubmit={handleSaveProfile}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6"
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-teal-400" />
            <span>Profile & Credential Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Official Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2">
                Official Diploma Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full legal name as it appears on certificates"
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none"
              />
              <p className="text-[11px] text-indigo-300/50 mt-1.5">
                This exact name will be engraved on all your issued
                certificates.
              </p>
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profileData?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-indigo-300/60 cursor-not-allowed bg-white/3"
                />
                <Mail className="w-4 h-4 text-indigo-400/40 absolute right-4 top-3.5" />
              </div>
              <p className="text-[11px] text-indigo-300/50 mt-1.5">
                Managed by account authentication
              </p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2">
              Academic & Professional Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your technical interests, skills, or career aspirations..."
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none"
            />
          </div>

          {/* Social Profiles & Credential Links */}
          <div className="space-y-4 pt-2 border-t border-indigo-500/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Professional Links & Verification Handles</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-indigo-200/80 mb-1.5">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200/80 mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/yourhandle"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200/80 mb-1.5">
                  Portfolio / Website
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl glow-btn-primary font-semibold text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Verified Certificates Portfolio */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Verified Gyanix Academy Credentials
              </h3>
            </div>
            <span className="text-xs text-indigo-300/60 font-semibold uppercase">
              {certificates.length} Conferred
            </span>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto text-indigo-300 text-xl font-bold">
                📜
              </div>
              <p className="text-sm font-bold text-white">
                No Certificates Conferred Yet
              </p>
              <p className="text-xs text-indigo-200/60 max-w-sm mx-auto">
                Complete your enrolled course modules and pass the AI Assessment
                to earn your verified credential.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert: any) => {
                const certId =
                  typeof cert === 'object'
                    ? cert._id || cert.certificateId
                    : cert;
                const title =
                  cert.courseTitle || 'Executive Certificate of Achievement';
                return (
                  <div
                    key={certId}
                    className="p-5 rounded-2xl bg-white/3 border border-indigo-500/20 hover:border-teal-400/40 transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-teal-400 font-bold uppercase tracking-wider">
                        <span>Verified Diploma</span>
                        <span>
                          {cert.completedAt
                            ? new Date(cert.completedAt).toLocaleDateString()
                            : 'Issued'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {title}
                      </h4>
                      <p className="text-xs text-indigo-200/60">ID: {certId}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/15">
                      <Link
                        href={`/certificates/${certId}`}
                        className="flex-1 py-2 px-3 rounded-xl glow-btn-teal text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Official Diploma</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
