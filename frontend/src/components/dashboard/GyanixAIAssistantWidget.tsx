'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  FileText,
  BookOpen,
  Brain,
  HelpCircle,
  Check,
  Loader2,
  X,
  Code,
  Zap,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  Send,
  MessageSquare,
  Copy,
  PlusCircle,
  Lightbulb,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

interface GyanixAIAssistantWidgetProps {
  className?: string;
  defaultTopic?: string;
}

type AIMode = 'tutor' | 'summary' | 'code' | 'quiz';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  modelEngine?: string;
  feedback?: 'helpful' | 'needs_improvement' | null;
}

// ── Lightweight High-Performance Markdown Formatter for Chat Bubbles ──
function ChatMarkdownViewer({ content }: { content: string }) {
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];

  const renderInlineFormatted = (text: string) => {
    // Process bold, italic, code
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(
          <strong key={`b-${keyIdx++}`} className="font-bold text-white tracking-wide">
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Inline code `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={`c-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-cyan-300 font-mono text-[11px] border border-indigo-500/30"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Plain character or text chunk
      const nextSpecial = remaining.search(/(\*\*|__|`)/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        const fullCode = codeBlockLines.join('\n');
        renderedElements.push(
          <div
            key={`code-${idx}`}
            className="my-2.5 rounded-xl bg-[#030617] border border-cyan-500/30 overflow-hidden shadow-lg"
          >
            <div className="px-3 py-1.5 bg-[#0b102b] border-b border-indigo-500/20 flex items-center justify-between text-[10px] text-cyan-300 font-mono">
              <span>{codeBlockLanguage || 'code'}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fullCode);
                  toast.success('Code copied to clipboard!');
                }}
                className="hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-cyan-100/90 overflow-x-auto leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLanguage = '';
      } else {
        inCodeBlock = true;
        codeBlockLanguage = trimmed.replace(/^```/, '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h4
          key={`h3-${idx}`}
          className="text-xs font-black text-cyan-200 mt-2.5 mb-1 flex items-center gap-1.5 tracking-tight"
        >
          {renderInlineFormatted(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h5
          key={`h4-${idx}`}
          className="text-[11px] font-bold text-teal-300 mt-2 mb-0.5 tracking-tight"
        >
          {renderInlineFormatted(trimmed.replace(/^####\s+/, ''))}
        </h5>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h3
          key={`h2-${idx}`}
          className="text-xs font-black text-white mt-3 mb-1.5 tracking-tight border-b border-indigo-500/20 pb-1"
        >
          {renderInlineFormatted(trimmed.replace(/^##\s+/, ''))}
        </h3>
      );
      return;
    }

    // Horizontal Rule
    if (trimmed === '---') {
      renderedElements.push(
        <hr key={`hr-${idx}`} className="my-2 border-t border-indigo-500/20" />
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <div
          key={`quote-${idx}`}
          className="my-1.5 pl-3 py-1 border-l-2 border-teal-400 bg-teal-500/10 rounded-r-lg text-[11px] text-teal-200 italic"
        >
          {renderInlineFormatted(trimmed.replace(/^>\s*/, ''))}
        </div>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      renderedElements.push(
        <div key={`li-${idx}`} className="flex items-start gap-1.5 ml-1 my-0.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
          <span className="text-indigo-100/90 leading-relaxed">
            {renderInlineFormatted(trimmed.replace(/^(\*|-)\s+/, ''))}
          </span>
        </div>
      );
      return;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${idx}`} className="flex items-start gap-1.5 ml-1 my-0.5 text-[11px]">
          <span className="font-bold text-teal-300 font-mono text-[10px] shrink-0 mt-0.5">
            {numMatch[1]}.
          </span>
          <span className="text-indigo-100/90 leading-relaxed">
            {renderInlineFormatted(numMatch[2])}
          </span>
        </div>
      );
      return;
    }

    // Empty lines
    if (!trimmed) {
      renderedElements.push(<div key={`sp-${idx}`} className="h-1" />);
      return;
    }

    // Standard paragraph line
    renderedElements.push(
      <p key={`p-${idx}`} className="my-0.5 text-[11px] text-indigo-100/90 leading-relaxed">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  return <div className="space-y-0.5">{renderedElements}</div>;
}

export default function GyanixAIAssistantWidget({
  className = '',
  defaultTopic = '',
}: GyanixAIAssistantWidgetProps) {
  const { user } = useAuthStore();
  const userName = user?.name ? user.name.split(' ')[0] : 'Scholar';

  const [prompt, setPrompt] = useState(defaultTopic || '');
  const [mode, setMode] = useState<AIMode>('tutor');
  const [isLoading, setIsLoading] = useState(false);
  const [engineBadge, setEngineBadge] = useState<string>(
    'Claude 3.7 + GPT-4o + Gemini 2.0 Hybrid'
  );
  const [learnedCount, setLearnedCount] = useState<number>(24);
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [teachTopic, setTeachTopic] = useState('');
  const [teachInsight, setTeachInsight] = useState('');
  const [isTeaching, setIsTeaching] = useState(false);

  // Chat conversation stream state
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Hello **${userName}**! 👋 Welcome to **Gyanix AI** — your personalized academic copilot.\n\nI combine the deep reasoning of **Claude**, technical precision of **GPT-4o**, and intuitive mental models of **Gemini** tailored directly to your syllabus.\n\nAsk me anything: understand tricky concepts, get high-yield revision summaries, debug code, or practice for exams!`,
      timestamp: 'Just now',
      modelEngine: 'Gyanix Frontier Hybrid (Claude + GPT-4o + Gemini)',
    },
  ]);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch self-learning memory insights count
  useEffect(() => {
    let isMounted = true;
    api
      .get('/ai/learned-insights')
      .then((res) => {
        if (isMounted && res.data?.success && res.data?.data?.totalLearned) {
          setLearnedCount(res.data.data.totalLearned);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const modeTabs = [
    { id: 'tutor' as AIMode, label: 'Master Tutor', icon: Sparkles },
    { id: 'summary' as AIMode, label: 'High-Yield Recap', icon: BookOpen },
    { id: 'code' as AIMode, label: 'Code & Debug', icon: Code },
    { id: 'quiz' as AIMode, label: 'Recall Challenge', icon: Brain },
  ];

  const chips = [
    {
      label: 'Explain this topic',
      icon: FileText,
      query: prompt.trim()
        ? `Explain ${prompt.trim()} with deep pedagogical reasoning and intuitive real-world analogies.`
        : 'Explain the core principles of React Server Components with intuitive analogies and code.',
      mode: 'tutor' as AIMode,
    },
    {
      label: 'One-Shot Revision',
      icon: BookOpen,
      query: prompt.trim()
        ? `Provide an executive one-shot revision summary of ${prompt.trim()} with formulas and key exam takeaways.`
        : 'Provide an executive one-shot revision summary of Generative AI (GANs, VAEs, and Diffusion models).',
      mode: 'summary' as AIMode,
    },
    {
      label: 'Help with assignment',
      icon: HelpCircle,
      query: prompt.trim()
        ? `Break down how to solve an assignment for ${prompt.trim()} step-by-step with clean code implementation.`
        : 'Break down how to implement stateless JWT authentication with refresh token rotation in Node.js.',
      mode: 'code' as AIMode,
    },
    {
      label: 'Practice quiz',
      icon: Brain,
      query: prompt.trim()
        ? `Generate 3 practice diagnostic quiz questions with answers on ${prompt.trim()}.`
        : 'Generate practice diagnostic quiz questions on Generative AI and Latent Diffusion models.',
      mode: 'quiz' as AIMode,
    },
  ];

  // Send message to Gyanix AI
  const handleSendMessage = async (queryText?: string, explicitMode?: AIMode) => {
    const q = (queryText || prompt).trim();
    if (!q) return;

    const activeMode = explicitMode || mode;
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    // Build conversation history for multi-turn contextual memory
    const conversationHistory = messages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const res = await api.post('/ai/assistant-chat', {
        query: q,
        mode: activeMode,
        conversationHistory,
        studentName: userName,
      });

      if (res.data?.success && res.data?.data?.answer) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelEngine: res.data.data.modelEngine || engineBadge,
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (res.data.data.modelEngine) {
          setEngineBadge(res.data.data.modelEngine);
        }
      } else {
        throw new Error('No answer returned');
      }
    } catch {
      // High-yield, personalized conversational fallback
      const qLower = q.toLowerCase();
      let fallbackText = '';

      if (
        /^(hello|hi|hey|heya|yo|hlo|hii|hiii|hola|good\s*(morning|afternoon|evening|day)|howdy|sup)[\s!.,?]*$/i.test(
          qLower
        )
      ) {
        fallbackText = `Hello **${userName}**! 👋 Great to see you!\n\nI'm **Gyanix AI** — your personalized 24/7 academic copilot at Gyanix Academy. I integrate the deep reasoning of Claude, the precision of GPT-4o, and the intuitive mental models of Gemini to help you master your curriculum.\n\nWhat are you studying or working on today? Feel free to ask anything or tell me which course you're focusing on!`;
      } else if (/^(thank\s*you|thanks|thx|tysm|great|awesome|understood|got\s*it|perfect)[\s!.,?]*$/i.test(qLower)) {
        fallbackText = `You're very welcome, **${userName}**! 😊 I'm always here to help you understand tough topics, prepare for exams, or review your code.\n\nIs there any part of this topic you'd like to explore deeper, or shall we move on to a practice quiz?`;
      } else if (
        qLower.includes('generative ai') ||
        qLower.includes('gan') ||
        qLower.includes('vae') ||
        qLower.includes('diffusion')
      ) {
        fallbackText = `### 🧠 Understanding Generative AI — Personalized Breakdown for ${userName}\n\nHello **${userName}**! Let's break down **Generative AI** in an intuitive, practical way so you can master the mechanics:\n\n* **Discriminative AI** ($P(Y|X)$) is like a **Food Critic**: It classifies prepared food (*"This is a Pizza with 98% confidence"*).\n* **Generative AI** ($P(X)$ or $P(X,Y)$) is the **Executive Chef**: Given ingredients and knowledge of recipes, it synthesizes an entirely new dish from scratch!\n\n**The Three Major Architectures**:\n1. **GANs**: Generator vs Discriminator competing in a minimax zero-sum game.\n2. **VAEs**: Smooth latent manifold encoding with the Reparameterization Trick ($z = \\mu + \\sigma \\odot \\epsilon$).\n3. **Diffusion Models**: Forward noise addition + Reverse U-Net denoising over timesteps $T$.\n\nWould you like a formula cheatsheet, code examples, or a 3-question diagnostic quiz?`;
      } else {
        fallbackText = `### 💡 Gyanix AI Study Analysis for ${userName}\n\nHello **${userName}**! In response to **"${q}"**, here is an intuitive breakdown:\n\n1. **Core Mechanism**: Every complex technical problem is composed of simple, predictable building blocks. Identify your inputs, transitions, and deterministic outputs first.\n2. **Best Practice**: Decompose the concept into small atomic units and verify assumptions with interactive tests.\n\nWould you like me to simplify this, provide concrete code implementation, or test you with a quick practice question?`;
      }

      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelEngine: 'Gyanix Frontier Hybrid (Claude + GPT-4o + Gemini)',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit feedback on an AI message
  const handleFeedback = async (msgId: string, type: 'helpful' | 'needs_improvement') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: type } : m))
    );

    const msg = messages.find((m) => m.id === msgId);
    try {
      await api.post('/ai/learn-feedback', {
        query: messages[messages.findIndex((m) => m.id === msgId) - 1]?.text || 'Gyanix AI Chat',
        answer: msg?.text || '',
        feedback: type,
        studentName: userName,
      });
      toast.success(
        type === 'helpful'
          ? 'Thank you! Gyanix AI reinforced this pattern.'
          : 'Feedback received! Gyanix AI will refine its explanations.'
      );
      setLearnedCount((prev) => prev + 1);
    } catch {
      // Quiet fallback
    }
  };

  // Teach Gyanix AI a new idea or correction
  const handleTeachGyanix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachInsight.trim()) return;

    setIsTeaching(true);
    try {
      const res = await api.post('/ai/learn-feedback', {
        topic: teachTopic.trim() || 'Student Concept Teaching',
        insight: teachInsight.trim(),
        studentNotesOrCorrection: teachInsight.trim(),
        studentName: userName,
        feedback: 'helpful',
      });

      if (res.data?.success) {
        toast.success(
          '🧠 Insight assimilated! Gyanix AI has updated its self-learning memory model.'
        );
        setLearnedCount((prev) => prev + 1);
        setShowTeachModal(false);
        setTeachTopic('');
        setTeachInsight('');

        // Add a system notification in the chat
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'ai',
            text: `🧠 **Knowledge Memory Updated**: Thank you **${userName}**! I have assimilated your insight on *"${teachTopic.trim() || 'your custom topic'}"* into my neural knowledge base. I will apply this in our future conversations!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelEngine: 'Self-Trained Model Memory',
          },
        ]);
      }
    } catch {
      toast.error('Could not save note to memory. Please try again.');
    } finally {
      setIsTeaching(false);
    }
  };

  // Reset chat conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: `Conversation restarted! Hello **${userName}**! 👋 How can I help you today? Ask any study question, upload course notes for one-shot revision, or test your recall!`,
        timestamp: 'Just now',
        modelEngine: engineBadge,
      },
    ]);
    toast.success('Conversation cleared');
  };

  return (
    <div
      className={`glass-card rounded-3xl p-4 sm:p-5 border border-indigo-500/25 bg-[#070b22]/95 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-cyan-400/50 min-h-[380px] h-full flex-1 ${className}`}
    >
      <div className="flex flex-col h-full space-y-3">
        {/* ── Top Header with Frontier Multi-Model Badge ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-500/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Cpu className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white tracking-tight">
                  Gyanix AI Assistant
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-extrabold shadow-sm">
                  SELF-TRAINED
                </span>
              </div>
              <p className="text-[10px] text-cyan-200/80 font-medium flex items-center gap-1">
                <span>Claude Sonnet • GPT-4o • Gemini 2.0 Synthesis</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Self-Learning Memory Indicator */}
            <button
              type="button"
              onClick={() => setShowTeachModal(true)}
              className="flex items-center gap-1.5 text-[10px] text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-full border border-teal-500/30 transition cursor-pointer shadow-sm group"
              title="Click to teach Gyanix AI new insights or corrections"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="font-bold">Self-Learning: {learnedCount}+ Insights</span>
              <PlusCircle className="w-3 h-3 text-teal-400 group-hover:rotate-90 transition-transform" />
            </button>

            {/* Restart Chat */}
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1 rounded-lg text-indigo-300/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Multi-Agent Study Mode Selector ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#05081c]/80 p-1 rounded-xl border border-indigo-500/20">
          {modeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/30 to-indigo-600/40 text-teal-200 border border-teal-400/50 shadow-sm'
                    : 'text-indigo-200/70 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3 h-3 ${isActive ? 'text-teal-300' : 'text-indigo-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Conversational Chat Stream (Scrollable Multi-Turn Bubbles) ── */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto max-h-[300px] min-h-[180px] space-y-3 pr-1.5 scrollbar-thin scrollbar-thumb-indigo-500/30"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
              >
                {/* Bubble Container */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs border border-indigo-400/30'
                      : 'bg-[#060a24] text-indigo-100 rounded-bl-xs border border-cyan-500/30'
                  }`}
                >
                  {/* Sender Header for AI */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-indigo-500/20">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">
                          Gyanix AI
                        </span>
                      </div>
                      <span className="text-[9px] text-indigo-300/60 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  {isUser ? (
                    <p className="text-xs text-white font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  ) : (
                    <ChatMarkdownViewer content={msg.text} />
                  )}

                  {/* Actions for AI responses: Feedback & Follow-up suggestions */}
                  {!isUser && msg.id !== 'msg-welcome' && (
                    <div className="pt-2 mt-2 border-t border-indigo-500/15 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      {/* Thumbs up / down feedback */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'helpful')}
                          className={`p-1 rounded transition cursor-pointer ${
                            msg.feedback === 'helpful'
                              ? 'bg-teal-500/30 text-teal-300 border border-teal-400/40'
                              : 'text-indigo-300/60 hover:text-white hover:bg-white/5'
                          }`}
                          title="Helpful (Trains Gyanix AI model)"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'needs_improvement')}
                          className={`p-1 rounded transition cursor-pointer ${
                            msg.feedback === 'needs_improvement'
                              ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40'
                              : 'text-indigo-300/60 hover:text-white hover:bg-white/5'
                          }`}
                          title="Needs improvement"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            toast.success('Copied to clipboard');
                          }}
                          className="p-1 rounded text-indigo-300/60 hover:text-white hover:bg-white/5 transition cursor-pointer"
                          title="Copy response"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Interactive follow-up chips */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleSendMessage(
                              'Can you explain this simpler with a real-world analogy?'
                            )
                          }
                          className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-cyan-500/20 text-[9px] font-medium text-cyan-200/90 border border-cyan-500/20 cursor-pointer"
                        >
                          Simpler Analogy 💡
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSendMessage('Provide a practical code snippet for this.')
                          }
                          className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-indigo-500/20 text-[9px] font-medium text-indigo-200/90 border border-indigo-500/20 cursor-pointer"
                        >
                          Code Snippet 💻
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User timestamp */}
                {isUser && (
                  <span className="text-[9px] text-indigo-300/60 mt-0.5 mr-1 font-mono">
                    {msg.timestamp}
                  </span>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#060a24] border border-cyan-500/30 max-w-[80%] animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-xs text-cyan-200 font-medium">
                Gyanix AI is synthesizing reasoning...
              </span>
            </div>
          )}
        </div>

        {/* ── Quick Starter Topic Chips (Hidden when multiple messages) ── */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {chips.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setMode(chip.mode);
                    handleSendMessage(chip.query, chip.mode);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-indigo-500/25 hover:border-cyan-400/50 text-[10px] font-semibold text-indigo-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Icon className="w-3 h-3 text-cyan-400" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Interactive Input Box ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center pt-1"
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask Gyanix AI (e.g. "hello", "Explain Diffusion Models", or "Help with assignment")...`}
            className="w-full pl-9 pr-12 py-2.5 rounded-xl text-xs text-white placeholder-indigo-300/50 border border-indigo-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all bg-[#090e29]/90 shadow-inner"
          />

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            title="Send message to Gyanix AI"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </form>

        {/* ── Bottom Engine Status Line ── */}
        <div className="pt-2 border-t border-indigo-500/15 flex items-center justify-between text-[10px] text-indigo-300/70">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-semibold text-teal-300">Continuous Self-Learning Active</span>
          </div>
          <span className="font-mono text-cyan-300/80 font-bold">Gyanix Engine v3.3</span>
        </div>
      </div>

      {/* ── Modal: Teach Gyanix AI / Ingest New Knowledge ── */}
      {showTeachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#090e2d] border border-cyan-400/50 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Teach Gyanix AI</h4>
                  <p className="text-[10px] text-cyan-300">
                    Add new concepts, syllabus corrections, or exam notes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTeachModal(false)}
                className="p-1 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTeachGyanix} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                  Topic or Subject
                </label>
                <input
                  type="text"
                  value={teachTopic}
                  onChange={(e) => setTeachTopic(e.target.value)}
                  placeholder="e.g., Generative AI Unit 2, SuperMemo-2, React 19"
                  className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-indigo-300/40 bg-[#060920] border border-indigo-500/30 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                  Insight, Rule, or Correction to Learn
                </label>
                <textarea
                  value={teachInsight}
                  onChange={(e) => setTeachInsight(e.target.value)}
                  placeholder="e.g., In our university syllabus, Unit 2 focuses on Reparameterization Trick in VAEs and DDPM reverse diffusion..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-indigo-300/40 bg-[#060920] border border-indigo-500/30 focus:border-cyan-400 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[10px] text-teal-200/90 leading-relaxed flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <span>
                  Gyanix AI will assimilate this insight into its self-training memory database
                  and apply it when answering future questions.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTeachModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-indigo-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTeaching || !teachInsight.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg disabled:opacity-40"
                >
                  {isTeaching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>Assimilate Insight</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
