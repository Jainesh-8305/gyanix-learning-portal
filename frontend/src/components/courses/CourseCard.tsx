/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Star, Users, Clock, BookOpen, Sparkles } from 'lucide-react';
import { Course } from '@/types';

interface Props {
  course: Course;
}

const LEVEL_STYLES: Record<string, string> = {
  beginner: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  intermediate: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  advanced: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
};

export default function CourseCard({ course }: Props) {
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const displayPrice = hasDiscount ? course.discountPrice : course.price;

  return (
    <Link href={`/courses/${course._id}`} className="block group">
      <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-indigo-500/40">
        {/* Thumbnail Banner */}
        <div className="relative aspect-video bg-gradient-to-br from-indigo-950/80 to-[#05060f] overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-9 h-9 text-indigo-400/40" />
              <span className="text-xs text-indigo-300/40 font-medium">AI-LMS Course</span>
            </div>
          )}
          <span
            className={`absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
              LEVEL_STYLES[course.level] || LEVEL_STYLES.beginner
            }`}
          >
            {course.level}
          </span>
        </div>

        {/* Card Content */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{course.category?.replace('-', ' ')}</span>
          </div>

          <h3 className="font-bold text-white text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-teal-300 transition-colors">
            {course.title}
          </h3>

          <p className="text-xs text-indigo-200/50 mb-4">
            by {typeof course.instructor === 'object' ? course.instructor.name : 'Instructor'}
          </p>

          <div className="flex items-center gap-3.5 text-xs text-indigo-200/60 mb-4">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-white">{course.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-indigo-300/40">({course.totalRatings || 0})</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{course.totalStudents?.toLocaleString() || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.totalLessons || 0} lessons</span>
            </span>
          </div>

          {/* Pricing Footer */}
          <div className="flex items-center justify-between pt-3.5 border-t border-indigo-500/15">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-white">
                {displayPrice === 0 ? 'Free' : `₹${(displayPrice ?? 0).toLocaleString('en-IN')}`}
              </span>
              {hasDiscount && (
                <span className="text-xs text-indigo-300/40 line-through">
                  ₹{(course.price ?? 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[11px] bg-pink-500/15 text-pink-300 font-semibold px-2 py-0.5 rounded-full border border-pink-500/30">
                {Math.round((1 - (displayPrice! / course.price)) * 100)}% off
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}