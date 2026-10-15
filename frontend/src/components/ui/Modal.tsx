'use client';

import { useRef } from 'react';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Solid Opaque Modal Container */}
      <div
        className={`relative w-full ${maxWidthMap[maxWidth]} bg-[#0c0f24] rounded-3xl border border-indigo-500/30 shadow-2xl shadow-black overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-500/20 bg-[#121735]">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {title}
          </h3>
          <button
            aria-label="Close dialog"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
