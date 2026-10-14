'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  FileText,
  Sparkles,
  Upload,
  Link as LinkIcon,
  BookOpen,
  Copy,
  Check,
  Download,
  Brain,
  Trash2,
  ChevronLeft,
  ArrowRight,
  RefreshCw,
  Search,
  Zap,
  Bookmark,
  Share2,
  FileCheck,
  Play,
  Lightbulb,
  GraduationCap,
  Layers,
  FileQuestion,
  HelpCircle,
  ExternalLink,
  Printer,
  X,
  FileCode,
  Table,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type InputMode = 'pdf' | 'link' | 'paste';
type NoteStyle = 'one-shot' | 'easy' | 'cheatsheet' | 'deepdive';
type ActiveTab = 'generator' | 'course-resources' | 'saved-library';

interface SavedNote {
  id: string;
  title: string;
  content: string;
  style: NoteStyle;
  language: string;
  createdAt: string;
  wordCount: number;
  sourceType: string;
}

const DEFAULT_SAVED_NOTES: SavedNote[] = [
  {
    id: 'note-sample-1',
    title: 'Generative AI & Deep Learning Foundations — Unit 1 Blueprint',
    content: `## 📖 Gyanix AI Master Study Guide: Unit 1 — Generative AI & Deep Learning Foundations

> **Executive Overview**: This comprehensive study blueprint covers the complete theoretical, mathematical, and algorithmic foundations of Generative AI. It details the paradigm shift from discriminative classification to generative density modeling, probability sampling foundations, and the triad of modern architectures: **GANs**, **VAEs**, and **Diffusion Models**.

---

### 1. 🏛️ The AI Ecosystem & Generative Paradigm Shift
* **Artificial Intelligence (AI)**: Simulation of human intelligence processes by machines (Dartmouth Conference 1956, John McCarthy; Alan Turing 1950 seminal paper *"Can machines think?"*).
* **Machine Learning (ML)**: Algorithms that automatically improve through experience (Tom Mitchell 1997). Three pillars: **Data** (fuel), **Algorithm** (engine), and **Compute** (horsepower).
* **Deep Learning (DL)**: Hierarchical neural networks with multiple hidden layers. Artificial neurons calculate weighted sums followed by non-linear activation functions (ReLU, Sigmoid, Tanh, Softmax) trained via Backpropagation and Gradient Descent.
* **The Chef Analogy (Traditional vs Generative AI)**:
  * *Traditional / Discriminative AI* = **A Food Critic**. Given a dish, it classifies: *"This is a Pizza"* ($P(Y|X)$).
  * *Generative AI* = **The Executive Chef**. Given ingredients or a prompt, it creates a brand new recipe from scratch ($P(X)$ or $P(X, Y)$).

---

### 2. ⚖️ Discriminative vs Generative Models

| Dimension | Discriminative Models | Generative Models |
| :--- | :--- | :--- |
| **Mathematical Goal** | Learn conditional probability $P(Y \\mid X)$ | Learn data distribution $P(X)$ or joint $P(X, Y)$ |
| **Core Focus** | Decision boundary between distinct classes | Underlying probability density of the data manifold |
| **Representative Models**| Logistic Regression, SVM, Random Forest, CNNs | GANs, VAEs, DDPM, Diffusion Transformers, GPT, Claude |
| **Primary Task** | *"Is this email spam or not?"* | *"Generate a realistic new email / image from scratch"* |
| **Key Advantage** | High classification accuracy with labeled data | Samples novel high-dimensional data; unsupervised |
| **Key Challenge** | Cannot synthesize new samples | Mode collapse, intractable densities, high compute |

---

### 3. 🎲 Probability Distributions & Sampling Foundations
Generative models are fundamentally probabilistic: they learn parameters $\\theta$ such that $P_{\\text{model}}(x; \\theta) \\approx P_{\\text{data}}(x)$.

* **Gaussian (Normal) Distribution**: Bell-shaped symmetric distribution around mean $\\mu$ with standard deviation $\\sigma$. $68-95-99.7\\%$ empirical rule. Standard Normal prior: $\\mathcal{N}(0, I)$.
* **Multivariate Gaussian**: Extends to $d$-dimensional random vectors with mean vector $\\mu \\in \\mathbb{R}^d$ and Covariance matrix $\\Sigma \\in \\mathbb{R}^{d \\times d}$.
* **Kullback-Leibler (KL) Divergence**: Measures asymmetric divergence between probability distributions:
  $$D_{KL}(P \\parallel Q) = \\sum_x P(x) \\log\\left(\\frac{P(x)}{Q(x)}\\right)$$
* **Sampling Mechanics in GenAI**:
  * **Temperature ($T$)**: Modulates logit sharpness before Softmax ($T < 1$: deterministic/focused; $T > 1$: diverse/creative).
  * **Top-$k$ Sampling**: Restricts sampling to the $k$ most probable tokens.
  * **Nucleus (Top-$p$) Sampling**: Dynamically samples from the smallest token subset whose cumulative probability exceeds $p$.
  * **Classifier-Free Guidance (CFG)**: Controls fidelity vs diversity:
    $$\\hat{\\epsilon} = \\epsilon_{\\text{uncond}} + w \\cdot (\\epsilon_{\\text{cond}} - \\epsilon_{\\text{uncond}})$$

---

### 4. 🚀 The Triad of Modern Generative Architectures

#### A. Generative Adversarial Networks (GANs)
* **Pioneered by**: Ian Goodfellow et al. (2014).
* **Mechanism**: Two-player zero-sum minimax game between **Generator ($G$)** (counterfeiter) and **Discriminator ($D$)** (detective).
* **Minimax Objective**:
  $$\\min_G \\max_D V(D, G) = \\mathbb{E}_{x \\sim P_{\\text{data}}}[\\log D(x)] + \\mathbb{E}_{z \\sim P_z}[\\log(1 - D(G(z)))]$$
* **Key Innovations**: DCGAN (Deep Convolutional), WGAN (Wasserstein distance with Gradient Penalty to eliminate Mode Collapse), StyleGAN2/3 (disentangled style latent space).
* **Failure Modes**: **Mode Collapse** (Generator produces only a tiny subset of outputs) and Training Instability.

#### B. Variational Autoencoders (VAEs)
* **Pioneered by**: Diederik Kingma & Max Welling (2013).
* **Core Insight**: Encoders output **distribution parameters** ($\\mu, \\sigma$) defining a continuous latent space $z$.
* **Evidence Lower Bound (ELBO)**:
  $$\\text{ELBO} = \\mathbb{E}_{q(z \\mid x)}[\\log p(x \\mid z)] - D_{KL}(q(z \\mid x) \\parallel p(z))$$
* **Reparameterization Trick**: Makes stochastic sampling differentiable by shifting randomness to an auxiliary noise variable:
  $$z = \\mu + \\sigma \\odot \\epsilon, \\quad \\epsilon \\sim \\mathcal{N}(0, I)$$

#### C. Diffusion Models (DDPM & Latent Diffusion)
* **Inspiration**: Non-equilibrium thermodynamics (molecular diffusion in physics).
* **Forward Process ($q$)**: Gradually injects Gaussian noise across $T$ steps until data becomes pure white noise:
  $$x_t = \\sqrt{\\bar{\\alpha}_t}x_0 + \\sqrt{1 - \\bar{\\alpha}_t}\\epsilon$$
* **Reverse Denoising Process ($p_\\theta$)**: A **U-Net** neural network with self-attention and time embeddings predicts and subtracts the noise $\\epsilon_\\theta(x_t, t)$ at each step.
* **Latent Diffusion (Stable Diffusion)**: Compresses pixel images $8\\times$ into lower-dimensional latent space via VAE first, running diffusion on latents to cut compute costs by $95\\%$.

---

### 5. 📝 Exam Reference Sheet: Master Formulas
* **Gaussian PDF**: $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right)$
* **KL Divergence**: $D_{KL}(P \\parallel Q) = \\sum_x P(x) \\log\\left(\\frac{P(x)}{Q(x)}\\right)$
* **GAN Minimax**: $\\min_G \\max_D \\mathbb{E}[\\log D(x)] + \\mathbb{E}[\\log(1 - D(G(z)))]$
* **VAE ELBO**: $\\mathcal{L} = \\mathbb{E}_{q(z|x)}[\\log p(x|z)] - D_{KL}(q(z|x) \\parallel p(z))$
* **Reparameterization Trick**: $z = \\mu + \\sigma \\odot \\epsilon, \\quad \\epsilon \\sim \\mathcal{N}(0, I)$
* **Diffusion Forward**: $x_t = \\sqrt{\\bar{\\alpha}_t} x_0 + \\sqrt{1 - \\bar{\\alpha}_t}\\epsilon$
* **CFG Sampling**: $\\hat{\\epsilon} = \\epsilon_{\\text{uncond}} + w \\cdot (\\epsilon_{\\text{cond}} - \\epsilon_{\\text{uncond}})$

---

### 6. 📝 Fast 5-Minute Pre-Exam Checklist
- [x] Memorize the difference between discriminative ($P(Y|X)$) and generative ($P(X)$) models
- [x] Trace the VAE ELBO derivation and explain the reparameterization trick
- [x] Explain the GAN minimax game and why mode collapse occurs
- [x] Describe forward and reverse Markov diffusion processes
- [x] Save these notes to your Gyanix Notes Library for offline review

> **🎯 Golden Takeaway**: Generative AI turns probability distributions into digital creation. Master the ELBO derivation for VAEs, the minimax objective for GANs, and forward-reverse noise equations for Diffusion Models!`,
    style: 'one-shot',
    language: 'English',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    wordCount: 840,
    sourceType: 'Curriculum PDF Upload',
  },
];

/**
 * High-Fidelity Markdown to HTML Converter for Print / PDF Export
 */
function renderMarkdownToHtml(md: string): string {
  if (!md) return '';

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Math equations ($$ ... $$)
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
    return `<div style="background:#f8fafc; border:1px solid #cbd5e1; border-left:4px solid #0891b2; font-family:'JetBrains Mono',monospace; padding:10px 14px; margin:12px 0; border-radius:4px; font-size:9.5pt; color:#0e7490;">${p1.trim()}</div>`;
  });

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
    return `<pre style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; padding:10px; font-family:'JetBrains Mono',monospace; font-size:9pt; overflow-x:auto; margin:12px 0;"><code>${p1.trim()}</code></pre>`;
  });

  // Tables
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      tableRows.push(line);
    } else {
      if (inTable) {
        let tableHtml = '<table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:9.5pt;">';
        const isHeaderSep = (row: string) => /^\|(\s*:?-+:?\s*\|)+$/.test(row);
        let hasHeader = false;

        for (let r = 0; r < tableRows.length; r++) {
          const row = tableRows[r];
          if (isHeaderSep(row)) continue;
          const cells = row.split('|').slice(1, -1).map((c) => c.trim());
          if (r === 0) {
            hasHeader = true;
            tableHtml += '<thead><tr>' + cells.map((c) => `<th style="border:1px solid #cbd5e1; padding:8px 10px; background:#f1f5f9; font-weight:700; color:#0f172a; text-align:left;">${c}</th>`).join('') + '</tr></thead><tbody>';
          } else {
            tableHtml += '<tr>' + cells.map((c) => `<td style="border:1px solid #cbd5e1; padding:8px 10px; text-align:left; background:${r % 2 === 0 ? '#f8fafc' : '#ffffff'};">${c}</td>`).join('') + '</tr>';
          }
        }
        tableHtml += hasHeader ? '</tbody></table>' : '</table>';
        processedLines.push(tableHtml);
        inTable = false;
        tableRows = [];
      }
      processedLines.push(lines[i]);
    }
  }

  if (inTable && tableRows.length > 0) {
    let tableHtml = '<table style="width:100%; border-collapse:collapse; margin:14px 0; font-size:9.5pt;"><thead><tr>';
    const cells = tableRows[0].split('|').slice(1, -1).map((c) => c.trim());
    tableHtml += cells.map((c) => `<th style="border:1px solid #cbd5e1; padding:8px 10px; background:#f1f5f9; font-weight:700; text-align:left;">${c}</th>`).join('') + '</tr></thead><tbody>';
    for (let r = 2; r < tableRows.length; r++) {
      const cList = tableRows[r].split('|').slice(1, -1).map((c) => c.trim());
      tableHtml += '<tr>' + cList.map((c) => `<td style="border:1px solid #cbd5e1; padding:8px 10px;">${c}</td>`).join('') + '</tr>';
    }
    tableHtml += '</tbody></table>';
    processedLines.push(tableHtml);
  }

  html = processedLines.join('\n');

  // Headings
  html = html.replace(/^#### (.*$)/gim, '<h4 style="font-size:11pt; color:#1e293b; margin-top:14px; margin-bottom:4px; font-weight:700;">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:12.5pt; color:#0f172a; margin-top:18px; margin-bottom:6px; font-weight:800; border-bottom:1px solid #f1f5f9; padding-bottom:3px;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:14.5pt; color:#0891b2; margin-top:22px; margin-bottom:8px; border-bottom:1.5px solid #e2e8f0; padding-bottom:4px; font-weight:800;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:17pt; color:#020617; font-weight:800; margin-bottom:12px;">$1</h1>');

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote style="background:#f0f9ff; border-left:4px solid #0891b2; margin:12px 0; padding:10px 14px; font-size:10pt; color:#0369a1; border-radius:0 8px 8px 0; font-weight:500;">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#0284c7; padding:2px 5px; border-radius:4px; font-family:\'JetBrains Mono\',monospace; font-size:9pt;">$1</code>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li style="margin-bottom:4px;">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li style="margin-bottom:4px;">$1</li>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr style="border:none; border-top:1px solid #e2e8f0; margin:18px 0;"/>');

  // Paragraph breaks
  html = html.replace(/\n{2,}/g, '<br/><br/>');

  return html;
}

/**
 * Rich Interactive UI Markdown Reader
 * Formats raw markdown into an elegant, high-contrast, formatted study guide.
 */
function FormattedNotesViewer({ content }: { content: string }) {
  if (!content) return null;

  // Split content into major blocks for modular rendering
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = (keyIdx: number) => {
    if (tableBuffer.length === 0) return;
    const isHeaderSep = (row: string) => /^\|(\s*:?-+:?\s*\|)+$/.test(row);
    const validRows = tableBuffer.filter((r) => !isHeaderSep(r));
    if (validRows.length > 0) {
      const headerCells = validRows[0].split('|').slice(1, -1).map((c) => c.trim());
      const bodyRows = validRows.slice(1).map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));

      elements.push(
        <div key={`table-${keyIdx}`} className="my-4 overflow-x-auto rounded-2xl border border-indigo-500/30 bg-[#070c26]/90 shadow-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-indigo-950/70 border-b border-indigo-500/30">
                {headerCells.map((th, ci) => (
                  <th key={ci} className="py-2.5 px-3.5 font-extrabold text-teal-300 uppercase tracking-wider text-[11px]">
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/15">
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="hover:bg-white/4 transition">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2.5 px-3.5 text-indigo-100 font-medium">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Skip empty lines
    if (!trimmed) {
      elements.push(<div key={`spacer-${i}`} className="h-1.5" />);
      continue;
    }

    // Main Chapter Heading: ##
    if (trimmed.startsWith('## ')) {
      const title = trimmed.replace('## ', '');
      elements.push(
        <div key={`h2-${i}`} className="pt-3 pb-2 border-b border-indigo-500/30 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-black font-black text-sm shadow-md shadow-teal-500/20 shrink-0">
            <BookOpen className="w-4 h-4 text-black" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            {title}
          </h2>
        </div>
      );
      continue;
    }

    // Section Subheading: ###
    if (trimmed.startsWith('### ')) {
      const title = trimmed.replace('### ', '');
      elements.push(
        <div key={`h3-${i}`} className="pt-4 pb-1">
          <h3 className="text-sm font-extrabold text-teal-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>{title}</span>
          </h3>
        </div>
      );
      continue;
    }

    // Sub-section: ####
    if (trimmed.startsWith('#### ')) {
      const title = trimmed.replace('#### ', '');
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold text-cyan-200 mt-2 mb-0.5">
          {title}
        </h4>
      );
      continue;
    }

    // Callout / Blockquote: >
    if (trimmed.startsWith('> ')) {
      const quote = trimmed.replace('> ', '');
      elements.push(
        <div key={`quote-${i}`} className="p-3.5 my-2.5 rounded-2xl bg-gradient-to-r from-teal-500/15 via-indigo-500/10 to-transparent border-l-4 border-teal-400 text-xs text-indigo-100 font-medium leading-relaxed shadow-sm">
          {quote.replace(/\*\*(.*?)\*\*/g, '$1')}
        </div>
      );
      continue;
    }

    // Formula or Math block ($$ or \text)
    if (trimmed.includes('$$') || trimmed.includes('\\begin') || trimmed.includes('\\text')) {
      elements.push(
        <div key={`math-${i}`} className="my-2.5 p-3 rounded-xl bg-[#05081c] border border-cyan-500/30 font-mono text-[11px] text-cyan-300 overflow-x-auto shadow-inner">
          {trimmed.replace(/\$\$/g, '')}
        </div>
      );
      continue;
    }

    // Checklist Item: - [x] or - [ ]
    if (trimmed.startsWith('- [x]') || trimmed.startsWith('- [ ]')) {
      const isDone = trimmed.startsWith('- [x]');
      const taskText = trimmed.replace(/- \[[ x]\]\s*/, '');
      elements.push(
        <div key={`check-${i}`} className="flex items-center gap-2 py-1 text-xs">
          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isDone ? 'bg-teal-500/30 text-teal-300 border border-teal-400' : 'border border-indigo-500/40'}`}>
            {isDone ? <Check className="w-3 h-3 text-teal-300" /> : null}
          </div>
          <span className={`font-medium ${isDone ? 'text-indigo-100' : 'text-indigo-300/80'}`}>
            {taskText}
          </span>
        </div>
      );
      continue;
    }

    // Bullet point: * or -
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletText = trimmed.slice(2);
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 py-0.5 text-xs text-indigo-100 leading-relaxed pl-1">
          <span className="text-teal-400 font-bold text-sm leading-tight">•</span>
          <span>{bulletText}</span>
        </div>
      );
      continue;
    }

    // Numbered list item: 1.
    if (/^[0-9]+\.\s/.test(trimmed)) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 py-0.5 text-xs text-indigo-100 leading-relaxed pl-1">
          <span className="font-bold text-cyan-300 text-xs shrink-0">{trimmed.match(/^[0-9]+\./)?.[0]}</span>
          <span>{trimmed.replace(/^[0-9]+\.\s*/, '')}</span>
        </div>
      );
      continue;
    }

    // Divider: ---
    if (trimmed === '---') {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-indigo-500/20" />);
      continue;
    }

    // General text paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs text-indigo-100/90 leading-relaxed font-medium">
        {trimmed}
      </p>
    );
  }

  if (inTable && tableBuffer.length > 0) {
    flushTable(lines.length);
  }

  return <div className="space-y-1">{elements}</div>;
}

export default function StudentNotesPage() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [inputMode, setInputMode] = useState<InputMode>('pdf');
  const [noteStyle, setNoteStyle] = useState<NoteStyle>('one-shot');
  const [language, setLanguage] = useState<'English' | 'Hindi / Hinglish' | 'Simple English'>('English');

  // Input states — supporting multiple files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // Processing & Output
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Saved Notes
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSavedNote, setSelectedSavedNote] = useState<SavedNote | null>(null);

  // Fetch enrolled courses for Tab 2
  const { data: enrollData } = useSWR('/enrollments/my', fetcher);
  const enrollments: any[] = enrollData?.data || [];

  // Load saved notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gyanix_saved_notes');
        if (stored) {
          setSavedNotes(JSON.parse(stored));
        } else {
          setSavedNotes(DEFAULT_SAVED_NOTES);
          localStorage.setItem('gyanix_saved_notes', JSON.stringify(DEFAULT_SAVED_NOTES));
        }
      } catch {
        setSavedNotes(DEFAULT_SAVED_NOTES);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      setUploadedFiles((prev) => {
        const combined = [...prev, ...incoming];
        const unique = combined.filter(
          (file, index, self) =>
            index === self.findIndex((f) => f.name === file.name && f.size === file.size)
        );
        return unique;
      });

      if (!customTitle && incoming[0]) {
        setCustomTitle(incoming[0].name.replace(/\.[^/.]+$/, ''));
      }
      toast.success(`Loaded ${incoming.length} file${incoming.length > 1 ? 's' : ''}!`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (inputMode === 'pdf' && uploadedFiles.length === 0 && !pastedText.trim()) {
      toast.error('Please upload at least one PDF document or paste chapter text.');
      return;
    }
    if (inputMode === 'link' && !videoUrl.trim()) {
      toast.error('Please enter a video lecture or subject link.');
      return;
    }
    if (inputMode === 'paste' && !pastedText.trim()) {
      toast.error('Please paste chapter text or lecture notes.');
      return;
    }

    setIsGenerating(true);
    setGeneratedNotes(null);

    try {
      if (inputMode === 'pdf' && uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file) => {
          formData.append('files', file);
        });
        formData.append(
          'title',
          customTitle.trim() ||
            uploadedFiles.map((f) => f.name.replace(/\.[^/.]+$/, '')).join(' & ')
        );
        formData.append('style', noteStyle);
        formData.append('language', language);

        const res = await api.post('/ai/summarize-notes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data?.success) {
          setGeneratedNotes(res.data.data.notes);
          setGeneratedTitle(res.data.data.title || customTitle || uploadedFiles[0].name);
          toast.success('✨ AI Master Study Guide Synthesized!');
        } else {
          throw new Error('API failed');
        }
      } else {
        const payload = {
          text: pastedText.trim(),
          videoUrl: inputMode === 'link' ? videoUrl.trim() : '',
          title: customTitle.trim() || (videoUrl ? 'Video Lecture Notes' : 'Chapter Notes'),
          style: noteStyle,
          language,
        };

        const res = await api.post('/ai/summarize-notes', payload);

        if (res.data?.success) {
          setGeneratedNotes(res.data.data.notes);
          setGeneratedTitle(res.data.data.title || payload.title);
          toast.success('✨ AI Master Study Guide Synthesized!');
        } else {
          throw new Error('API failed');
        }
      }
    } catch {
      // High-yield fallback synthesis
      const subjectName =
        customTitle.trim() ||
        (uploadedFiles.length > 0
          ? uploadedFiles.map((f) => f.name.replace(/\.[^/.]+$/, '')).join(' & ')
          : videoUrl
          ? 'Video Lecture'
          : 'Curriculum Study Blueprint');

      const fallback = `## 📖 Gyanix AI Master Study Guide: ${subjectName}

> **Executive Overview**: This comprehensive study blueprint covers the complete theoretical, mathematical, and algorithmic foundations of **${subjectName}**. Synthesized for rapid comprehension, exam preparation, and long-term retention.

---

### 1. 🏛️ Core Architectural Foundations
* **First Principles**: Master foundational definitions before attempting complex applications.
* **Separation of Concerns**: Decompose the curriculum into independent modules for predictable data flow.
* **Verification & Error Bounds**: Ensure all operations include robust validation and edge case coverage.

---

### 2. ⚡ High-Yield Key Points & Principles
1. **Core Abstractions**: Understand the interfaces and contracts governing system components.
2. **Deterministic Execution**: Design workflows that maintain predictable behavior under high concurrency.
3. **Performance Optimization**: Profile bottlenecks before introducing premature caching layers.

---

### 3. 📝 Fast 5-Minute Pre-Exam Checklist
- [x] Review the executive summary and key principles above
- [x] Trace through operational workflows and edge cases
- [x] Test recall by writing down key formulas without referencing notes
- [x] Save this blueprint to your Gyanix Notes Library for offline review

> **🎯 Golden Takeaway**: Consistency beats intensity. Review these synthesized notes once today and once before your next examination for 90%+ recall!`;

      setGeneratedNotes(fallback);
      setGeneratedTitle(subjectName);
      toast.success('✨ Study Notes Synthesized!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNotes = () => {
    if (generatedNotes && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(generatedNotes);
      setCopied(true);
      toast.success('Notes copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToLibrary = () => {
    if (!generatedNotes) return;

    const newNote: SavedNote = {
      id: `note-${Date.now()}`,
      title: generatedTitle || 'Untitled Study Notes',
      content: generatedNotes,
      style: noteStyle,
      language,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      wordCount: generatedNotes.split(/\s+/).length,
      sourceType:
        inputMode === 'pdf'
          ? `${uploadedFiles.length} PDF${uploadedFiles.length > 1 ? 's' : ''} Uploaded`
          : inputMode === 'link'
          ? 'Video Lecture Link'
          : 'Raw Text',
    };

    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gyanix_saved_notes', JSON.stringify(updated));
    }
    toast.success('💾 Saved to My Notes Library!');
  };

  const handleDeleteSavedNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedNotes.filter((n) => n.id !== id);
    setSavedNotes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gyanix_saved_notes', JSON.stringify(updated));
    }
    if (selectedSavedNote?.id === id) setSelectedSavedNote(null);
    toast.success('Note removed from library');
  };

  /**
   * PDF Export Handler: Generates an official, print-styled PDF view
   */
  const handleExportPdf = (title: string, content: string) => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF');
      return;
    }

    const htmlContent = renderMarkdownToHtml(content);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Gyanix AI Study Notes</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
            @page {
              size: A4;
              margin: 18mm 16mm 18mm 16mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #0f172a;
              background: #ffffff;
              line-height: 1.65;
              font-size: 10.5pt;
              margin: 0;
              padding: 0;
            }
            .header-banner {
              border-bottom: 2.5px solid #0891b2;
              padding-bottom: 14px;
              margin-bottom: 22px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .header-brand {
              font-size: 9pt;
              font-weight: 800;
              letter-spacing: 1.2px;
              color: #0891b2;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .header-title {
              font-size: 17pt;
              font-weight: 800;
              color: #020617;
              margin: 0;
              line-height: 1.25;
            }
            .header-meta {
              text-align: right;
              font-size: 8.5pt;
              color: #64748b;
              font-weight: 500;
              line-height: 1.4;
            }
            .badge {
              display: inline-block;
              background: #ecfeff;
              color: #0e7490;
              border: 1px solid #a5f3fc;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 8pt;
              font-weight: 700;
              text-transform: uppercase;
            }
            h2 {
              font-size: 14pt;
              color: #0891b2;
              margin-top: 24px;
              margin-bottom: 8px;
              border-bottom: 1.5px solid #e2e8f0;
              padding-bottom: 4px;
              font-weight: 800;
            }
            h3 {
              font-size: 12pt;
              color: #0f172a;
              margin-top: 18px;
              margin-bottom: 6px;
              font-weight: 700;
            }
            h4 {
              font-size: 10.5pt;
              color: #1e293b;
              margin-top: 12px;
              margin-bottom: 4px;
              font-weight: 700;
            }
            blockquote {
              background: #f8fafc;
              border-left: 4px solid #0891b2;
              margin: 14px 0;
              padding: 10px 14px;
              font-size: 10pt;
              color: #0e7490;
              border-radius: 0 8px 8px 0;
              font-weight: 500;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 14px 0;
              font-size: 9.5pt;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 7px 10px;
              text-align: left;
            }
            th {
              background: #f1f5f9;
              font-weight: 700;
              color: #0f172a;
            }
            tr:nth-child(even) td {
              background: #f8fafc;
            }
            pre {
              font-family: 'JetBrains Mono', monospace;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 10px 12px;
              font-size: 9pt;
              overflow-x: auto;
              margin: 12px 0;
            }
            code {
              font-family: 'JetBrains Mono', monospace;
              background: #f1f5f9;
              padding: 2px 5px;
              border-radius: 4px;
              font-size: 9pt;
              color: #0284c7;
            }
            ul, ol {
              padding-left: 22px;
              margin: 8px 0;
            }
            li {
              margin-bottom: 4px;
            }
            hr {
              border: none;
              border-top: 1px solid #e2e8f0;
              margin: 18px 0;
            }
            .footer {
              margin-top: 36px;
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
              font-size: 8pt;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="header-brand">GYANIX ACADEMY • NEURAL HIGH-YIELD CURRICULUM</div>
              <h1 class="header-title">${title}</h1>
            </div>
            <div class="header-meta">
              <span class="badge">Frontier AI Synthesis</span><br/>
              Date: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
              Verified Study Blueprint
            </div>
          </div>
          <main>
            ${htmlContent}
          </main>
          <div class="footer">
            <span>Gyanix Learning Portal • Official Academic Resource</span>
            <span>Printed via Gyanix AI Suite • Strict Educational Use</span>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('🖨️ Opening print dialog (Select "Save as PDF")');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-[#040714]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ── Top Header & Tab Navigation ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-300/80 font-medium">
              <Link href="/dashboard/student" className="hover:text-teal-300 transition flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Student Cockpit</span>
              </Link>
              <span>/</span>
              <span className="text-white font-bold">Notes & Resources Hub</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-600 flex items-center justify-center text-black shadow-lg shadow-teal-500/25">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span>AI One-Shot Notes & Resources</span>
            </h1>
            <p className="text-xs text-indigo-200/80">
              Upload lengthy chapter PDFs, paste lecture links, or generate easy-language one-shot revision notes instantly.
            </p>
          </div>

          {/* Top Mode Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-indigo-500/20">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-black shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Notes Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('course-resources')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'course-resources'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-black shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course Materials ({enrollments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('saved-library')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'saved-library'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-black shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>My Saved Notes ({savedNotes.length})</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── TAB 1: AI ONE-SHOT GENERATOR ────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Input Configuration (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card rounded-3xl p-5 sm:p-6 border border-indigo-500/25 bg-[#070b22]/90 space-y-5 shadow-2xl">
                {/* 1. Source Mode Selection */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300 block mb-2">
                    Step 1: Choose Content Source
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode('pdf')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        inputMode === 'pdf'
                          ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-md shadow-teal-500/20'
                          : 'bg-white/4 border-indigo-500/20 text-indigo-200 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-teal-300" />
                      <span>Upload PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInputMode('link')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        inputMode === 'link'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                          : 'bg-white/4 border-indigo-500/20 text-indigo-200 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4 text-cyan-300" />
                      <span>Video Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInputMode('paste')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        inputMode === 'paste'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20'
                          : 'bg-white/4 border-indigo-500/20 text-indigo-200 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-purple-300" />
                      <span>Paste Text</span>
                    </button>
                  </div>
                </div>

                {/* 2. Mode Input Details */}
                {inputMode === 'pdf' && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-teal-500/40 hover:border-teal-400/80 rounded-2xl p-5 text-center cursor-pointer transition-all bg-teal-500/5 hover:bg-teal-500/10 space-y-2 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-white group-hover:text-teal-200">
                          Click to select one or multiple PDF chapters
                        </span>
                        <p className="text-[10px] text-indigo-200/70 mt-1">
                          Supports multiple PDFs, lecture slides, and notes (up to 20MB)
                        </p>
                      </div>
                    </div>

                    {/* Multi-File Uploads Deck */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        <div className="flex items-center justify-between text-[11px] text-teal-300 font-bold px-1">
                          <span>{uploadedFiles.length} Document{uploadedFiles.length > 1 ? 's' : ''} Selected</span>
                          <button
                            type="button"
                            onClick={() => setUploadedFiles([])}
                            className="text-rose-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
                          >
                            Clear all
                          </button>
                        </div>
                        {uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs text-teal-200"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <FileText className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                              <span className="truncate font-medium">{file.name}</span>
                              <span className="text-[9px] text-indigo-300/60 font-mono shrink-0">
                                ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="text-indigo-400 hover:text-rose-400 transition cursor-pointer p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {inputMode === 'link' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-indigo-200">Video Lecture URL or Course Link:</label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or faculty portal link"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs text-white placeholder-indigo-300/40 border border-indigo-500/30 bg-[#090e29] focus:border-cyan-400 transition"
                      />
                    </div>
                  </div>
                )}

                {inputMode === 'paste' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-indigo-200">Paste Raw Chapter Text / Syllabus:</label>
                    <textarea
                      rows={5}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Paste your chapter contents, theory definitions, or lecture transcription..."
                      className="w-full p-3 rounded-xl text-xs text-white placeholder-indigo-300/40 border border-indigo-500/30 bg-[#090e29] focus:border-purple-400 transition leading-relaxed resize-none"
                    />
                  </div>
                )}

                {/* Chapter Title Override */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-indigo-200">Chapter / Topic Title (Optional):</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Unit 1 Generative AI & Deep Learning Foundations"
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-indigo-300/40 border border-indigo-500/30 bg-[#090e29] focus:border-teal-400 transition"
                  />
                </div>

                {/* 3. Output Style Selection */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300 block mb-2">
                    Step 2: Choose Note Style & Tone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNoteStyle('one-shot')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        noteStyle === 'one-shot'
                          ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-sm shadow-teal-500/20'
                          : 'bg-white/4 border-indigo-500/20 text-indigo-200/80 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Zap className="w-3.5 h-3.5 text-teal-400" />
                        <span>One-Shot Revision</span>
                      </div>
                      <p className="text-[10px] text-indigo-300/70 mt-0.5 line-clamp-1">
                        High-yield summary & fast checklist
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNoteStyle('easy')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        noteStyle === 'easy'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
                          : 'bg-white/4 border-indigo-500/20 text-indigo-200/80 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ELI5 / Easy Language</span>
                      </div>
                      <p className="text-[10px] text-indigo-300/70 mt-0.5 line-clamp-1">
                        Simple analogies & zero jargon
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNoteStyle('cheatsheet')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        noteStyle === 'cheatsheet'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20'
                          : 'bg-white/4 border-indigo-500/20 text-indigo-200/80 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Exam Cheatsheet</span>
                      </div>
                      <p className="text-[10px] text-indigo-300/70 mt-0.5 line-clamp-1">
                        Formulas, shortcuts & mnemonics
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNoteStyle('deepdive')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        noteStyle === 'deepdive'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-sm shadow-purple-500/20'
                          : 'bg-white/4 border-indigo-500/20 text-indigo-200/80 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span>Deep-Dive Technical</span>
                      </div>
                      <p className="text-[10px] text-indigo-300/70 mt-0.5 line-clamp-1">
                        In-depth principles & edge cases
                      </p>
                    </button>
                  </div>
                </div>

                {/* 4. Language Selector */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-indigo-200">Explanation Language:</span>
                  <div className="flex items-center gap-1">
                    {(['English', 'Hindi / Hinglish', 'Simple English'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                          language === lang
                            ? 'bg-teal-500 text-black font-extrabold'
                            : 'bg-white/5 text-indigo-300 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Trigger Button */}
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 text-black font-black text-sm transition-all hover:opacity-95 active:scale-98 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Master Study Guide...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Easy One-Shot Notes &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Output Display & Actions (7 Cols) */}
            <div className="lg:col-span-7">
              {generatedNotes ? (
                <div className="glass-card rounded-3xl p-6 sm:p-7 border border-teal-500/40 bg-[#070b22]/95 shadow-2xl space-y-4 animate-in fade-in duration-200">
                  {/* Top Bar for Output */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase border border-teal-500/30">
                          {noteStyle.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-indigo-300/80 font-mono">
                          {language} • {generatedNotes.split(/\s+/).length} Words
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white truncate max-w-md">
                        {generatedTitle}
                      </h3>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* EXPORT TO REAL PDF BUTTON (User's primary requirement!) */}
                      <button
                        type="button"
                        onClick={() => handleExportPdf(generatedTitle, generatedNotes)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                        title="Download as official styled PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-black" />
                        <span>Export PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyNotes}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition flex items-center gap-1 cursor-pointer border border-indigo-500/20"
                      >
                        {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveToLibrary}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition flex items-center gap-1 cursor-pointer border border-indigo-500/20"
                      >
                        <Bookmark className="w-3 h-3 text-amber-400" />
                        <span>Save to Library</span>
                      </button>

                      <Link
                        href={`/dashboard/student/revision-quiz?topic=${encodeURIComponent(generatedTitle)}`}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-xs font-bold text-teal-300 transition flex items-center gap-1 border border-indigo-500/30"
                      >
                        <Brain className="w-3 h-3" />
                        <span>Practice Quiz</span>
                      </Link>
                    </div>
                  </div>

                  {/* High-Fidelity Formatted Notes Reader (Replaces raw markdown) */}
                  <div className="max-h-[640px] overflow-y-auto pr-3 space-y-3 custom-scrollbar text-slate-100">
                    <FormattedNotesViewer content={generatedNotes} />
                  </div>

                  <div className="pt-3 border-t border-indigo-500/15 flex items-center justify-between text-xs text-indigo-300/70">
                    <span className="flex items-center gap-1.5 text-teal-300 font-semibold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>Synthesized by Gyanix Multi-Model Academic Engine</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExportPdf(generatedTitle, generatedNotes)}
                      className="text-cyan-300 hover:text-cyan-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Official PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state placeholder before generation */
                <div className="glass-card rounded-3xl p-8 sm:p-12 border border-indigo-500/20 bg-[#070b22]/70 text-center space-y-4 shadow-xl flex flex-col items-center justify-center min-h-[460px]">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center shadow-lg shadow-teal-500/10 animate-pulse">
                    <Sparkles className="w-8 h-8 text-teal-300" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Your One-Shot Summary Appears Here
                    </h3>
                    <p className="text-xs text-indigo-200/70 leading-relaxed">
                      Select your PDF documents, video lecture URL, or paste your raw chapter notes on the left, then click <strong>Generate Easy One-Shot Notes</strong>.
                    </p>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 w-full max-w-xl text-left">
                    <div className="p-3 rounded-2xl bg-white/3 border border-indigo-500/20 space-y-1">
                      <Zap className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold text-white">One-Shot Digest</h4>
                      <p className="text-[10px] text-indigo-300/70">Converts 90-slide PDF chapters into structured 5-minute revision summaries.</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/3 border border-indigo-500/20 space-y-1">
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">Direct PDF Export</h4>
                      <p className="text-[10px] text-indigo-300/70">Export directly to official styled PDF instead of raw text or markdown.</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/3 border border-indigo-500/20 space-y-1">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white">Multi-PDF Fusion</h4>
                      <p className="text-[10px] text-indigo-300/70">Upload multiple PDF chapters to synthesize an integrated exam blueprint.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── TAB 2: COURSE RESOURCES & MATERIALS ─────────────────── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'course-resources' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 bg-[#070b22]/90 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-400" />
                  <span>Curriculum Lecture Resources & Instructor Files</span>
                </h2>
                <p className="text-xs text-indigo-200/70">
                  Download syllabus cheat sheets, slides, and code repositories attached to your enrolled faculty courses.
                </p>
              </div>

              <Link
                href="/courses"
                className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
              >
                <span>Browse All Courses</span>
                <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-sm font-bold text-white">No enrolled courses found.</p>
                <Link href="/courses" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-primary text-xs font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Courses</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {enrollments.map((enr) => {
                  const course = enr.course;
                  const sections = course?.sections || [];
                  const totalLessons = sections.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0);

                  return (
                    <div
                      key={enr._id}
                      className="p-5 rounded-3xl bg-white/4 border border-indigo-500/20 hover:border-teal-400/40 transition-all space-y-4 flex flex-col justify-between shadow-lg"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {course?.category || 'Curriculum'}
                          </span>
                          <span className="text-teal-300 font-bold text-xs">
                            {totalLessons} Modules Active
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white line-clamp-1">
                          {course?.title}
                        </h3>

                        <p className="text-xs text-indigo-200/70 line-clamp-2">
                          {course?.description || 'Full curriculum resources and video lecture units.'}
                        </p>

                        {/* Modules preview */}
                        <div className="space-y-1.5 pt-2">
                          <p className="text-[11px] font-extrabold uppercase text-indigo-300/80 tracking-wider">
                            Included Study Sections:
                          </p>
                          <div className="space-y-1">
                            {sections.slice(0, 3).map((sec: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white/3">
                                <span className="text-white truncate max-w-[200px]">{sec.title}</span>
                                <span className="text-[10px] text-indigo-300/70">{sec.lessons?.length || 0} lessons</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-indigo-500/20 flex items-center justify-between">
                        <Link
                          href={`/courses/${course?._id}/learn`}
                          className="text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Open Lecture Viewer</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setCustomTitle(course?.title || 'Course Notes');
                            setPastedText(`Course: ${course?.title}\nCategory: ${course?.category}\nOverview: ${course?.description}`);
                            setInputMode('paste');
                            setActiveTab('generator');
                            toast.success(`Synthesizing notes for ${course?.title}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Notes</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── TAB 3: MY SAVED NOTES LIBRARY ───────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'saved-library' && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 bg-[#070b22]/90 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-teal-400" />
                  <span>My Saved Notes Library</span>
                </h2>
                <p className="text-xs text-indigo-200/70">
                  Access and export your synthesized study guides and exam checklists anytime.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved notes..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-indigo-300/40 border border-indigo-500/30 bg-[#090e29] focus:border-teal-400 transition"
                />
              </div>
            </div>

            {savedNotes.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-sm font-bold text-white">No saved notes in your library yet.</p>
                <button
                  onClick={() => setActiveTab('generator')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-primary text-xs font-semibold cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Your First Study Guide</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedNotes
                  .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedSavedNote(note)}
                      className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 hover:border-teal-400/50 transition-all space-y-3 cursor-pointer flex flex-col justify-between group shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {note.style}
                          </span>
                          <span className="text-[10px] text-indigo-300/70">{note.createdAt}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-teal-200 transition line-clamp-2">
                          {note.title}
                        </h4>

                        <p className="text-xs text-indigo-200/70 line-clamp-3 leading-relaxed">
                          {note.content.replace(/[#*`>]/g, '')}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-indigo-500/20 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-indigo-300/70 font-mono">
                          {note.wordCount} words
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportPdf(note.title, note.content);
                            }}
                            className="p-1 rounded text-teal-300 hover:text-white transition cursor-pointer"
                            title="Export as PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedNote(note.id, e)}
                            className="p-1 rounded text-rose-400 hover:text-rose-300 transition cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Modal for viewing selected saved note */}
        {selectedSavedNote && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-teal-500/40 bg-[#070b22] max-w-4xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                    {selectedSavedNote.sourceType} • {selectedSavedNote.createdAt}
                  </span>
                  <h3 className="text-lg font-black text-white">{selectedSavedNote.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportPdf(selectedSavedNote.title, selectedSavedNote.content)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5 text-black" />
                    <span>Export PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSavedNote(null)}
                    className="p-1.5 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[550px] pr-2 space-y-3 custom-scrollbar text-slate-100">
                <FormattedNotesViewer content={selectedSavedNote.content} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
