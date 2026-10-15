'use client';
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ArrowRight, MessageCircle, Search } from 'lucide-react';
import {
  PageHeading,
  Panel,
  LoadingState,
  ErrorState,
} from '@/components/workspace/ui';
import { openAssistant } from '@/components/assistant/AssistantLauncher';
import { useAuthStore } from '@/store/useAuthStore';
interface Article {
  id: string;
  title: string;
  url: string;
  text: string;
  translations: { hi?: string; gu?: string };
}
export default function HelpPage() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Article[] }>(
    '/ai/chat/knowledge',
  );
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState(''),
    [language, setLanguage] = useState('en');
  return (
    <div className="help-page">
      <PageHeading
        eyebrow="Gyanix help centre"
        title="Clear answers. Useful next steps."
        description="Guides for the features and workflows available to your account."
        actions={
          <button className="ws-button" onClick={() => openAssistant()}>
            <MessageCircle size={16} />
            Ask the assistant
          </button>
        }
      />
      <div className="ws-toolbar">
        <label className="ws-field">
          <span className="sr-only">Search help articles</span>
          <span className="flex items-center gap-2">
            <Search size={17} />
            <input
              className="ws-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles"
            />
          </span>
        </label>
        <label className="ws-field">
          <span className="sr-only">Help article language</span>
          <select
            className="ws-input"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </label>
      </div>
      <p className="ws-note mb-6">
        These articles are filtered by your signed-in role. Chat conversations
        are private to your account and role and expire after 30 days.
      </p>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState retry={() => void mutate()} />
      ) : (
        <div className="ws-stack">
          {data?.data
            .filter((a) =>
              (a.title + a.text + Object.values(a.translations).join(' '))
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((article) => (
              <div id={article.id} className="scroll-mt-24" key={article.id}>
                <Panel title={article.title}>
                  <p className="ws-description" lang={language}>
                    {(article.translations as Record<string, string>)[
                      language
                    ] || article.text}
                  </p>
                  <div className="ws-actions mt-5">
                    {!article.url.startsWith('/help') && (
                      <Link className="ws-link" href={article.url}>
                        Open feature
                        <ArrowRight size={14} />
                      </Link>
                    )}
                    <button
                      className="ws-link"
                      onClick={() => openAssistant(article.title)}
                    >
                      Ask about this
                      <MessageCircle size={14} />
                    </button>
                  </div>
                </Panel>
              </div>
            ))}
        </div>
      )}
      <Link
        className="ws-link mt-8"
        href={`/dashboard/${user?.role || 'student'}`}
      >
        Return to dashboard
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
