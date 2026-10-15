'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthHydrated } from '@/hooks/useAuth';
const ChatWindow = dynamic(() => import('./ChatWindow'), {
  ssr: false,
  loading: () => (
    <div className="assistant-loading" role="status">
      Opening assistant…
    </div>
  ),
});
export function openAssistant(prompt = '') {
  window.dispatchEvent(
    new CustomEvent('gyanix:open-assistant', { detail: { prompt } }),
  );
}
function ScopedLauncher() {
  const [open, setOpen] = useState(false),
    [initialized, setInitialized] = useState(false),
    [prompt, setPrompt] = useState('');
  useEffect(() => {
    const listener = (event: Event) => {
      setPrompt(
        (event as CustomEvent<{ prompt?: string }>).detail?.prompt?.slice(
          0,
          4000,
        ) || '',
      );
      setInitialized(true);
      setOpen(true);
    };
    window.addEventListener('gyanix:open-assistant', listener);
    return () => window.removeEventListener('gyanix:open-assistant', listener);
  }, []);
  const close = () => {
    setOpen(false);
    document.getElementById('assistant-launcher')?.focus();
  };
  return (
    <div className="assistant">
      {initialized && (
        <div hidden={!open} inert={!open}>
          <ChatWindow open={open} onClose={close} initialPrompt={prompt} />
        </div>
      )}
      <button
        type="button"
        id="assistant-launcher"
        aria-label={open ? 'Close Gyanix assistant' : 'Open Gyanix assistant'}
        aria-expanded={open}
        aria-controls="gyanix-chat-window"
        onClick={() => {
          setInitialized(true);
          setOpen(!open);
        }}
        className="assistant-launcher"
      >
        <MessageCircle size={24} />
        <span className="sr-only">Gyanix assistant</span>
      </button>
    </div>
  );
}
export default function AssistantLauncher() {
  const user = useAuthStore((s) => s.user),
    authenticated = useAuthStore((s) => s.isAuthenticated),
    ready = useAuthHydrated(),
    path = usePathname();
  if (
    !ready ||
    !authenticated ||
    !user ||
    /^\/(login|register|forgot-password|reset-password)/.test(path)
  )
    return null;
  return <ScopedLauncher key={`${user._id}:${user.role}`} />;
}
