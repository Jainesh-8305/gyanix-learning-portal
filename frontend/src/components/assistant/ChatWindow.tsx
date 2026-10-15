'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  Send,
  Plus,
  History,
  ShieldCheck,
  ExternalLink,
  Square,
  MessageCircle,
  ChevronLeft,
  Trash2,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { apiError } from '@/lib/errors';
interface Source {
  id: string;
  title: string;
  url: string;
}
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  mode?: string;
  language?: string;
}
interface Thread {
  _id: string;
  title: string;
  updatedAt: string;
}
interface Reply {
  answer: string;
  threadId: string;
  sources: Source[];
  mode: string;
  language: string;
}
function Text({ value }: { value: string }) {
  return (
    <>
      {value
        .split(/(\*\*[^*]+\*\*)/g)
        .map((part, i) =>
          part.startsWith('**') ? (
            <strong key={i}>{part.slice(2, -2)}</strong>
          ) : (
            part
          ),
        )}
    </>
  );
}
export default function ChatWindow({
  open,
  onClose,
  initialPrompt,
}: {
  open: boolean;
  onClose: () => void;
  initialPrompt: string;
}) {
  const user = useAuthStore((s) => s.user),
    path = usePathname();
  const [messages, setMessages] = useState<Message[]>([]),
    [draft, setDraft] = useState(initialPrompt),
    [threadId, setThreadId] = useState<string>(),
    [language, setLanguage] = useState('auto'),
    [sending, setSending] = useState(false),
    [error, setError] = useState(''),
    [history, setHistory] = useState(false),
    [threads, setThreads] = useState<Thread[]>([]),
    [configured, setConfigured] = useState<boolean>(),
    [removing, setRemoving] = useState<string>();
  const visible = useRef(open);
  useEffect(() => {
    visible.current = open;
    if (open) input.current?.focus();
  }, [open]);
  const input = useRef<HTMLTextAreaElement>(null),
    bottom = useRef<HTMLDivElement>(null),
    controller = useRef<AbortController | null>(null),
    close = useRef(onClose),
    requestVersion = useRef(0);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const active = document.activeElement;
    if (open && !sending && (active === document.body || active?.closest('#gyanix-chat-window'))) input.current?.focus();
  }, [open, sending]);
  useEffect(() => {
    input.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (visible.current && event.key === 'Escape') {
        event.preventDefault();
        close.current();
        document.getElementById('assistant-launcher')?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (initialPrompt) setDraft(initialPrompt);
  }, [initialPrompt]);
  useEffect(() => {
    if (open)
      api
        .get('/ai/chat/status')
        .then((r) => setConfigured(r.data.data.configured))
        .catch(() => {});
  }, [open]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [messages, sending]);
  async function showHistory() {
    setHistory(true);
    setError('');
    try {
      const r = await api.get('/ai/chat/threads');
      setThreads(r.data.data);
    } catch (e) {
      setError(apiError(e, 'Could not load conversation history'));
    }
  }
  async function removeThread(id: string) {
    setError('');
    try {
      await api.delete('/ai/chat/threads/' + id);
      setThreads((current) => current.filter((t) => t._id !== id));
      if (threadId === id) {
        setThreadId(undefined);
        setMessages([]);
      }
      setRemoving(undefined);
    } catch (e) {
      setError(apiError(e, 'Could not remove conversation'));
    }
  }
  async function restore(id: string) {
    setError('');
    try {
      const r = await api.get('/ai/chat/threads/' + id);
      setThreadId(id);
      setMessages(r.data.data.messages);
      setHistory(false);
      input.current?.focus();
    } catch (e) {
      setError(apiError(e, 'Conversation unavailable'));
    }
  }
  function newConversation() {
    controller.current?.abort();
    requestVersion.current++;
    setMessages([]);
    setThreadId(undefined);
    setDraft('');
    setHistory(false);
    setError('');
    setSending(false);
    input.current?.focus();
  }
  async function send(event?: React.FormEvent) {
    event?.preventDefault();
    if (!draft.trim() || sending) return;
    const text = draft.trim(),
      version = ++requestVersion.current;
    const previous = messages;
    setDraft('');
    setError('');
    setMessages([...previous, { role: 'user', content: text }]);
    setSending(true);
    const abort = new AbortController();
    controller.current = abort;
    const match = path.match(
      /^\/courses\/([a-f\d]{24})\/(learn|community|quiz)/i,
    );
    try {
      const r = await api.post(
        '/ai/chat',
        {
          message: text,
          threadId,
          language,
          ...(match ? { courseId: match[1] } : {}),
        },
        { signal: abort.signal, timeout: 35000 },
      );
      if (version !== requestVersion.current) return;
      const reply: Reply = r.data.data;
      setThreadId(reply.threadId);
      setMessages([
        ...previous,
        { role: 'user', content: text },
        {
          role: 'assistant',
          content: reply.answer,
          sources: reply.sources,
          mode: reply.mode,
          language: reply.language,
        },
      ]);
    } catch (e) {
      if (version !== requestVersion.current) return;
      setMessages(previous);
      setDraft(text);
      setError(
        abort.signal.aborted
          ? 'Request stopped. Your message is ready to send again.'
          : apiError(e, 'Could not get a reply. Please try again.'),
      );
    } finally {
      if (version === requestVersion.current) {
        setSending(false);
        controller.current = null;
        input.current?.focus();
      }
    }
  }
  const prompts =
    user?.role === 'student'
      ? [
          'How do I join a classroom?',
          'मेरे प्रमाणपत्र कैसे मिलेंगे?',
          'નોંધો કેવી રીતે બનાવું?',
        ]
      : user?.role === 'instructor'
        ? [
            'How do I submit a course for review?',
            'Gradebook में अंक कैसे दूँ?',
            'વર્ગ માટે ક્વિઝ કેવી રીતે બનાવું?',
          ]
        : [
            'How do I review pending courses?',
            'How do I manage user access?',
            'નોંધણીના રેકોર્ડ ક્યાં છે?',
          ];
  return (
    <section
      id="gyanix-chat-window"
      className="assistant-window"
      role="dialog"
      aria-modal="false"
      aria-labelledby="assistant-title"
    >
      <header className="assistant-header">
        <div className="assistant-avatar">
          <MessageCircle size={21} />
        </div>
        <div>
          <h2 id="assistant-title">Gyanix assistant</h2>
          <p>
            <ShieldCheck size={12} />
            Private to your account
          </p>
        </div>
        <button
          aria-label="New conversation"
          title="New conversation"
          onClick={newConversation}
        >
          <Plus size={18} />
        </button>
        <button
          aria-label="Conversation history"
          title="Conversation history"
          onClick={showHistory}
          disabled={sending}
        >
          <History size={18} />
        </button>
        <button aria-label="Close chat window" onClick={onClose}>
          <X size={19} />
        </button>
      </header>
      <div className="assistant-meta">
        <label>
          Reply language
          <select
            aria-label="Assistant reply language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="auto">Auto-detect</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
            <option value="mr">मराठी</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="bn">বাংলা</option>
            <option value="ta">தமிழ்</option>
          </select>
        </label>
        <Link href="/help" onClick={onClose}>
          Help centre
          <ExternalLink size={11} />
        </Link>
      </div>
      {history ? (
        <div className="assistant-messages">
          <button className="assistant-back" onClick={() => setHistory(false)}>
            <ChevronLeft size={15} />
            Back to chat
          </button>
          <h3>Recent conversations</h3>
          <p className="assistant-caption">
            Only conversations for this account and role. Retained for 30 days.
          </p>
          {threads.length ? (
            threads.map((t) => (
              <div className="assistant-thread-row" key={t._id}>
                <button
                  className="assistant-thread"
                  onClick={() => restore(t._id)}
                >
                  {t.title}
                  <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                </button>
                <button
                  aria-label={`Remove conversation ${t.title}`}
                  onClick={() => setRemoving(t._id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="assistant-caption">No saved conversations yet.</p>
          )}
        </div>
      ) : (
        <div
          className="assistant-messages"
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {!messages.length && (
            <div className="assistant-welcome">
              <span className="assistant-welcome-mark">
                <MessageCircle size={27} />
              </span>
              <h3>How can I help?</h3>
              <p>
                Ask about your courses, study tools or a learning question.
                Continue naturally in your preferred language.
              </p>
              {configured === false && (
                <p className="assistant-notice">
                  Live AI is unavailable. You can still search help articles.
                </p>
              )}
              <div className="assistant-prompts">
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setDraft(p);
                      input.current?.focus();
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <article
              key={i}
              className={`assistant-message assistant-message-${m.role}`}
            >
              <p className="assistant-message-label">
                {m.role === 'user'
                  ? 'You'
                  : m.mode === 'live'
                    ? 'Gyanix assistant'
                    : 'Retrieved help'}
              </p>
              <div
                lang={m.language}
                dir="auto"
                className="assistant-message-text"
              >
                <Text value={m.content} />
              </div>
              {m.sources?.length ? (
                <div className="assistant-sources">
                  {m.sources.map((source) => (
                    <Link
                      key={source.id}
                      href={
                        source.url.startsWith('/') &&
                        !source.url.startsWith('//')
                          ? source.url
                          : '/help'
                      }
                      onClick={onClose}
                    >
                      <ExternalLink size={12} />
                      {source.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
          {sending && (
            <div className="assistant-thinking" role="status">
              <span className="ws-spinner" />
              Finding a helpful answer…
            </div>
          )}
          <div ref={bottom} />
        </div>
      )}
      {removing && (
        <div className="assistant-delete">
          <p>Remove this conversation? It will be deleted from your history.</p>
          <div>
            <button onClick={() => void removeThread(removing)}>Remove</button>
            <button onClick={() => setRemoving(undefined)}>
              Keep conversation
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="assistant-error">
          {error}
        </p>
      )}
      {!history && (
        <form onSubmit={send} className="assistant-composer">
          <label htmlFor="assistant-message" className="sr-only">
            Message Gyanix assistant
          </label>
          <textarea
            id="assistant-message"
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Ask in English, हिन्दी, ગુજરાતી…"
            rows={2}
            maxLength={4000}
            disabled={sending}
          />
          {sending ? (
            <button
              type="button"
              aria-label="Stop assistant reply"
              onClick={() => controller.current?.abort()}
            >
              <Square size={18} />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim()}
            >
              <Send size={19} />
            </button>
          )}
          <p>Check important answers. Never share passwords or API keys.</p>
        </form>
      )}
    </section>
  );
}
