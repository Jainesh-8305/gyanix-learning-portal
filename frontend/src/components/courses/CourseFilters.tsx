'use client';

interface Filters {
  search: string;
  category: string;
  level: string;
  sort: string;
  page: number;
}

interface Props {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
}

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data science' },
  { value: 'ai-ml', label: 'AI and machine learning' },
  { value: 'mobile-dev', label: 'Mobile development' },
  { value: 'devops', label: 'DevOps' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
];

const LEVELS = [
  { value: '', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function CourseFilters({ filters, onFilterChange }: Props) {
  return (
    <div className="glass-card rounded-3xl p-6 border border-indigo-500/25 sticky top-24 shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
        <h3 className="font-extrabold text-base text-white tracking-wide">Filters</h3>
        {(filters.category || filters.level || filters.search) && (
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={e => onFilterChange({ category: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-[#05060f]/90 border-2 border-indigo-400/35 hover:border-teal-400 focus:border-teal-400 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400/25 shadow-md transition cursor-pointer"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value} className="bg-[#0c0f24] text-white">{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Level</label>
        <select
          value={filters.level}
          onChange={e => onFilterChange({ level: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-[#05060f]/90 border-2 border-indigo-400/35 hover:border-teal-400 focus:border-teal-400 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400/25 shadow-md transition cursor-pointer"
        >
          {LEVELS.map(l => (
            <option key={l.value} value={l.value} className="bg-[#0c0f24] text-white">{l.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onFilterChange({ category: '', level: '', search: '', page: 1 })}
        className="w-full text-xs font-bold uppercase tracking-wider text-teal-300 hover:text-white py-2.5 border border-teal-400/30 rounded-xl bg-teal-400/10 hover:bg-teal-400/20 active:scale-95 transition shadow-sm cursor-pointer"
      >
        Clear filters
      </button>
    </div>
  );
}