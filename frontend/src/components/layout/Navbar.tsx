'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Rocket, BookOpen, LayoutDashboard, LogOut,
  Menu, X, User, ChevronDown, Settings, Sparkles, HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import PlatformGuideModal from '@/components/guide/PlatformGuideModal';

const roleBadgeColor: Record<string, string> = {
  instructor: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  student:    'bg-teal-500/15 text-teal-300 border-teal-400/30',
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const dashboardPath =
    user?.role === 'instructor' ? '/dashboard/instructor' :
    '/dashboard/student';

  const navLinks = [
    ...(isAuthenticated ? [{ href: dashboardPath, label: 'Dashboard', icon: LayoutDashboard }] : []),
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05060f] border-b border-indigo-500/20 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ── Logo ──────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <Rocket size={16} className="text-[#05060f]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-teal-300 transition-colors">
              Gyanix<span className="text-teal-400 font-normal ml-1">Academy</span>
            </span>
            <span className="text-[9px] uppercase tracking-[2px] text-indigo-300/60 font-semibold">Learning Portal</span>
          </div>
        </Link>

        {/* ── Desktop nav links ──────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'text-white bg-indigo-500/20 border border-indigo-400/40 shadow-sm'
                    : 'text-indigo-200 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={16} className={active ? 'text-teal-400' : 'text-indigo-300'} />
                {label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Interactive Platform Guide & AI Helping Agent Button */}
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-400/35 text-xs font-bold text-teal-300 hover:text-white transition cursor-pointer shadow-sm group"
          >
            <Sparkles size={14} className="text-teal-400 group-hover:rotate-12 transition-transform" />
            <span>How Gyanix Works</span>
            <span className="px-1.5 py-0.5 rounded-md bg-teal-400/20 text-[10px] text-teal-200 font-extrabold uppercase tracking-wider">
              Guide
            </span>
          </button>
        </div>

        {/* ── Right: auth controls ───────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-[#0e1226] hover:bg-[#141a38] border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl px-3.5 py-2 transition-all cursor-pointer shadow-md"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-full flex items-center justify-center text-xs font-bold text-[#05060f]">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white font-semibold">{user?.name?.split(' ')[0]}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleBadgeColor[user?.role || 'student']}`}>
                  {user?.role}
                </span>
                <ChevronDown size={14} className={`text-indigo-300/60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Solid High-Contrast Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-60 bg-[#0e1226] rounded-2xl shadow-2xl shadow-black/90 border border-indigo-500/30 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3.5 bg-[#141936] border-b border-indigo-500/20">
                    <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-indigo-200/60 text-xs truncate mt-0.5">{user?.email}</p>
                  </div>

                  {/* Nav Links */}
                  <div className="p-1.5 space-y-0.5 bg-[#0e1226]">
                    <Link
                      href={dashboardPath}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-600/20 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} className="text-indigo-400" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-600/20 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} className="text-teal-400" />
                      <span>My Profile & Socials</span>
                    </Link>
                    <Link
                      href="/courses"
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-indigo-100 hover:text-white hover:bg-indigo-600/20 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <BookOpen size={16} className="text-indigo-400" />
                      <span>Browse Courses</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="p-1.5 border-t border-indigo-500/20 bg-[#0e1226]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-sm font-medium text-indigo-200 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="glow-btn-primary text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile menu button ─────────────────────────────── */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-indigo-500/20 text-indigo-200 hover:text-white flex items-center justify-center transition"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0d20] border-t border-indigo-500/20 px-4 py-5 space-y-2 shadow-2xl">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                  : 'text-indigo-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} className="text-teal-400" />
              <span>{label}</span>
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="pt-3 border-t border-indigo-500/20 space-y-1">
              <div className="px-4 py-2">
                <p className="text-white text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-indigo-300/50">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-indigo-500/20 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-indigo-200 hover:text-white border border-indigo-500/30 bg-white/5"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold glow-btn-primary text-white"
              >
                Get started
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-indigo-500/15">
            <button
              type="button"
              onClick={() => {
                setShowGuideModal(true);
                setMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-500/15 border border-teal-400/30 text-teal-300 font-bold text-xs"
            >
              <Sparkles size={14} />
              <span>How Gyanix Works (Platform Guide)</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Platform Guide & Helping Agent Modal */}
      {showGuideModal && (
        <PlatformGuideModal onClose={() => setShowGuideModal(false)} />
      )}
    </nav>
  );
}