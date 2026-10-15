'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { Search, Telescope } from 'lucide-react';
import api from '@/lib/api';
import CourseCard from '@/components/courses/CourseCard';
import CourseFilters from '@/components/courses/CourseFilters';
import AstroMascot from '@/components/ui/AstroMascot';
import { Course } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function CoursesPage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    sort: '-createdAt',
    page: 1,
  });

  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters)
        .filter(([_, v]) => v !== '' && v !== 1)
        .map(([k, v]) => [k, String(v)]),
    ),
  ).toString();

  const { data, isLoading } = useSWR(`/courses?${queryString}`, fetcher);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero: Dark Glass Card Shield Matching Student Dashboard */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-3 gap-6 items-center relative z-10">
            <div className="lg:col-span-2 space-y-3">
              {/* Mission Badge Matching Dashboard */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                <Telescope className="w-3.5 h-3.5 text-teal-400" />
                <span>Mission Catalogue</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              </div>

              {/* Title Matching Dashboard Font Size */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Explore{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-teal-200 to-teal-400 bg-clip-text text-transparent">
                  Courses
                </span>{' '}
                ✨
              </h1>

              {/* Subtitle Matching Dashboard Body Font */}
              <p className="text-sm text-indigo-200/70 max-w-xl leading-relaxed">
                {data?.pagination?.total || 0} premier curricula charted across
                the galaxy. Explore deep technical masterclasses, advance your
                skills, and unlock verified credentials.
              </p>

              {/* Proportional Cosmic Search Bar */}
              <div className="pt-1">
                <div className="w-full max-w-xl bg-[#05060f]/90 backdrop-blur-xl border border-indigo-500/35 hover:border-teal-400 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 rounded-2xl p-1.5 shadow-xl flex items-center gap-2 transition-all">
                  <div className="pl-2.5 text-teal-400 shrink-0">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for courses, technologies, topics…"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange({ search: e.target.value })
                    }
                    className="bg-transparent text-white placeholder:text-indigo-200/60 text-xs sm:text-sm font-medium px-2 py-1.5 w-full focus:outline-none"
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={() => handleFilterChange({ search: '' })}
                      className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition text-xs shrink-0"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                  <button
                    type="button"
                    className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-500 hover:brightness-110 active:scale-95 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-indigo-500/25 text-xs shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Astronaut Mascot Cockpit Wing */}
            <div className="hidden lg:flex flex-col items-center justify-center p-2">
              <AstroMascot
                role="student"
                className="w-32 h-32 drop-shadow-[0_15px_30px_rgba(99,102,241,0.45)] animate-float"
              />
              <div className="mt-2.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                Student Learning Center
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 flex gap-8">
        <aside className="w-64 shrink-0 hidden lg:block">
          <CourseFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        <main className="flex-1">
          {/* Results & Sort Control HUD Bar */}
          <div className="glass-card rounded-2xl px-5 py-3.5 mb-6 flex justify-between items-center border border-indigo-500/20 shadow-xl flex-wrap gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <p className="text-white font-bold text-sm">
                {isLoading
                  ? 'Scanning academy archives...'
                  : `${data?.data?.length || 0} active courses`}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-indigo-200/80 uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="px-4 py-2 bg-[#05060f]/95 border-2 border-indigo-400/40 hover:border-teal-400 focus:border-teal-400 rounded-xl text-sm font-bold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400/25 transition cursor-pointer"
              >
                <option value="-createdAt" className="bg-[#0c0f24] text-white">
                  Newest
                </option>
                <option value="-rating" className="bg-[#0c0f24] text-white">
                  Highest rated
                </option>
                <option
                  value="-totalStudents"
                  className="bg-[#0c0f24] text-white"
                >
                  Most popular
                </option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#0f1120]/60 border border-indigo-500/10 rounded-2xl h-72 animate-pulse"
                />
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-linear-to-br from-indigo-500/15 to-teal-400/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Telescope size={28} className="text-indigo-300" />
              </div>
              <p className="text-white font-medium">No courses found</p>
              <p className="text-indigo-200/40 text-sm mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data?.data?.map((course: Course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}

          {data?.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(data.pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleFilterChange({ page: i + 1 })}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition ${
                    filters.page === i + 1
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/5 text-indigo-200/50 hover:bg-white/10 border border-indigo-400/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
