import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Send,
  Paperclip,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Brain,
  ArrowDown,
  FileText,
  Image as ImageIcon,
  Loader2,
  Bot,
  User,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  Mic,
  MicOff,
  Square,
} from 'lucide-react';
import { Chat, AppSettings, ProviderType, Message, Attachment } from '../types';

export interface ChatWindowProps {
  chat: Chat | null;
  settings: AppSettings;
  onSendMessage: (content: string, provider: ProviderType, model: string, attachment?: Attachment) => Promise<void>;
  onChangeProviderModel: (provider: ProviderType, model: string) => void;
  onToggleMobileOpen: () => void;
  isSending: boolean;
  liveThinking?: string;
  streamingMessageId?: string | null;
  showNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  customSources?: Array<{ id: string; name: string; models: string[] }>;
  onStopGeneration?: () => void;
}

const DEFAULT_MODELS_BY_PROVIDER: Record<ProviderType, string[]> = {
  mistral: [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest',
    'open-mixtral-8x22b',
    'codestral-latest',
  ],
  openrouter: [
    'google/gemini-2.0-flash-001',
    'anthropic/claude-3.5-sonnet',
    'deepseek/deepseek-r1',
    'meta-llama/llama-3.3-70b-instruct',
    'mistralai/mistral-large',
  ],
  together: [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'mistralai/Mixtral-8x22B-Instruct-v0.1',
    'Qwen/Qwen2.5-72B-Instruct-Turbo',
    'deepseek-ai/DeepSeek-R1',
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
    'claude-3-5-haiku-20241022',
  ],
  custom: ['default-model'],
};

const PROVIDER_NAMES: Record<ProviderType, string> = {
  mistral: 'Mistral AI',
  openrouter: 'OpenRouter',
  together: 'Together AI',
  anthropic: 'Anthropic',
  custom: 'Custom Source',
};

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-slate-400">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-[11px] hover:text-slate-200 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-slate-800"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-slate-200 bg-slate-950/90 leading-relaxed font-mono">
        <pre>{code}</pre>
      </div>
    </div>
  );
};

function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  const regex = /(\[.*?\]\(.*?\)|\*\*\*.*?\*\*\*|___.*?___|\*\*.*?\*\*|__.*?__|~~.*?~~|`.*?`|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline font-medium transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    if ((part.startsWith('***') && part.endsWith('***')) || (part.startsWith('___') && part.endsWith('___'))) {
      return (
        <strong key={index} className="font-bold italic text-slate-100">
          {part.slice(3, -3)}
        </strong>
      );
    }

    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return (
        <strong key={index} className="font-bold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('~~') && part.endsWith('~~')) {
      return (
        <del key={index} className="line-through text-slate-400">
          {part.slice(2, -2)}
        </del>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950 border border-slate-800/80 text-cyan-300 font-mono text-[11px] break-all"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return (
        <em key={index} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

const RenderContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 leading-relaxed text-sm">
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const match = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
          const language = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);
          return <CodeBlock key={idx} code={code} language={language} />;
        }

        const lines = part.split('\n');
        const renderedElements: React.ReactNode[] = [];
        let lIdx = 0;

        while (lIdx < lines.length) {
          const line = lines[lIdx];
          const trimmed = line.trim();

          if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
            const tableLines: string[] = [];
            while (lIdx < lines.length) {
              const curTrimmed = lines[lIdx].trim();
              if (curTrimmed.startsWith('|') && curTrimmed.endsWith('|')) {
                tableLines.push(curTrimmed);
                lIdx++;
              } else {
                break;
              }
            }

            if (tableLines.length >= 2) {
              const rawHeader = tableLines[0];
              const headers = rawHeader
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim());

              const rawRows = tableLines.slice(1);
              const rows = rawRows
                .filter((rLine) => !rLine.match(/^\|[\s:-]+\|$/))
                .map((rLine) =>
                  rLine
                    .split('|')
                    .slice(1, -1)
                    .map((cell) => cell.trim())
                );

              renderedElements.push(
                <div key={`table_${lIdx}`} className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 shadow-inner">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-900/90 text-cyan-300 font-semibold border-b border-slate-800">
                      <tr>
                        {headers.map((h, hIndex) => (
                          <th key={hIndex} className="px-3.5 py-2.5 border-r border-slate-800/80 last:border-r-0 tracking-wide uppercase text-[11px]">
                            {parseInlineMarkdown(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {rows.map((row, rIndex) => (
                        <tr key={rIndex} className="hover:bg-slate-900/40 transition-colors">
                          {row.map((cell, cIndex) => (
                            <td key={cIndex} className="px-3.5 py-2 border-r border-slate-800/60 last:border-r-0">
                              {parseInlineMarkdown(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
              continue;
            }
          }

          if (!trimmed) {
            renderedElements.push(<div key={`empty_${lIdx}`} className="h-1.5" />);
            lIdx++;
            continue;
          }

          if (/^(---|[*]{3,}|_{3,})$/.test(trimmed)) {
            renderedElements.push(<hr key={`hr_${lIdx}`} className="border-slate-800/80 my-3" />);
            lIdx++;
            continue;
          }

          if (line.startsWith('# ')) {
            renderedElements.push(
              <h1 key={`h1_${lIdx}`} className="text-lg sm:text-xl font-bold text-slate-100 mt-3 mb-1.5 border-b border-slate-800/80 pb-1.5">
                {parseInlineMarkdown(line.replace('# ', ''))}
              </h1>
            );
            lIdx++;
            continue;
          }
          if (line.startsWith('## ')) {
            renderedElements.push(
              <h2 key={`h2_${lIdx}`} className="text-base sm:text-lg font-bold text-slate-100 mt-2.5 mb-1">
                {parseInlineMarkdown(line.replace('## ', ''))}
              </h2>
            );
            lIdx++;
            continue;
          }
          if (line.startsWith('### ')) {
            renderedElements.push(
              <h3 key={`h3_${lIdx}`} className="text-sm sm:text-base font-semibold text-cyan-300 mt-2 mb-1">
                {parseInlineMarkdown(line.replace('### ', ''))}
              </h3>
            );
            lIdx++;
            continue;
          }
          if (line.startsWith('#### ') || line.startsWith('##### ') || line.startsWith('###### ')) {
            renderedElements.push(
              <h4 key={`h4_${lIdx}`} className="text-xs sm:text-sm font-semibold text-slate-200 mt-1.5 mb-0.5">
                {parseInlineMarkdown(line.replace(/^#{4,6}\s+/, ''))}
              </h4>
            );
            lIdx++;
            continue;
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
            renderedElements.push(
              <div key={`ul_${lIdx}`} className="flex items-start space-x-2 pl-2 my-0.5">
                <span className="text-cyan-400 mt-1 text-xs">•</span>
                <div className="flex-1 text-slate-200">{parseInlineMarkdown(trimmed.substring(2))}</div>
              </div>
            );
            lIdx++;
            continue;
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            renderedElements.push(
              <div key={`ol_${lIdx}`} className="flex items-start space-x-2 pl-2 my-0.5">
                <span className="text-cyan-400 font-mono text-xs font-bold mt-0.5">{numMatch[1]}.</span>
                <div className="flex-1 text-slate-200">{parseInlineMarkdown(numMatch[2])}</div>
              </div>
            );
            lIdx++;
            continue;
          }

          if (line.startsWith('> ')) {
            renderedElements.push(
              <blockquote key={`bq_${lIdx}`} className="border-l-2 border-cyan-500/80 pl-3 py-1.5 my-2 italic text-slate-300 bg-slate-950/50 rounded-r border-y border-r border-slate-800/40">
                {parseInlineMarkdown(line.replace('> ', ''))}
              </blockquote>
            );
            lIdx++;
            continue;
          }

          renderedElements.push(
            <p key={`p_${lIdx}`} className="text-slate-200">
              {parseInlineMarkdown(line)}
            </p>
          );
          lIdx++;
        }

        return <div key={idx} className="space-y-1">{renderedElements}</div>;
      })}
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  settings,
  onSendMessage,
  onChangeProviderModel,
  onToggleMobileOpen,
  isSending,
  liveThinking,
  streamingMessageId,
  showNotification,
  customSources = [],
  onStopGeneration,
}) => {
  const [input, setInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('mistral');
  const [selectedModel, setSelectedModel] = useState<string>('mistral-large-latest');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [showThinkingMap, setShowThinkingMap] = useState<Record<string, boolean>>({});
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const initialInputRef = useRef<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  useEffect(() => {
    if (chat) {
      setSelectedProvider(chat.provider || 'mistral');
      setSelectedModel(chat.model || 'mistral-large-latest');
    }
  }, [chat]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [chat?.messages.length, isSending, liveThinking]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const prov = e.target.value as ProviderType;
    setSelectedProvider(prov);
    const foundCustom = customSources.find((cs) => cs.id === prov);
    const availableModels = foundCustom
      ? (foundCustom.models && foundCustom.models.length > 0 ? foundCustom.models : ['default-model'])
      : (DEFAULT_MODELS_BY_PROVIDER[prov] || ['default-model']);
    const newModel = availableModels[0] || 'default-model';
    setSelectedModel(newModel);
    onChangeProviderModel(prov, newModel);
  };

  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setSelectedModel(model);
    onChangeProviderModel(selectedProvider, model);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Failed to stop speech recognition:', e);
        }
      }
      setIsListening(false);
      showNotification?.('Voice Input Stopped', 'Recording completed.', 'info');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showNotification?.(
        'Voice Input Not Supported',
        'Your browser does not support Speech Recognition. Try Google Chrome, Microsoft Edge, or Safari.',
        'warning'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      initialInputRef.current = input;

      recognition.onstart = () => {
        setIsListening(true);
        showNotification?.('Listening...', 'Speak clearly into your microphone.', 'info');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combinedText = (initialInputRef.current ? initialInputRef.current + ' ' : '') + finalTranscript + interimTranscript;
        setInput(combinedText);

        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          showNotification?.('Voice Input Error', `Speech error: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition initialization failed:', err);
      setIsListening(false);
      showNotification?.('Microphone Error', 'Failed to access microphone.', 'error');
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification?.('File Too Large', 'Please upload a file under 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const isImg = file.type.startsWith('image/');
      const newAttachment: Attachment = {
        id: `att_${Date.now()}`,
        name: file.name,
        type: isImg ? 'image' : file.type.includes('pdf') ? 'pdf' : 'text',
        size: file.size,
        dataUrl: result,
        base64: result,
        content: !isImg ? result : undefined,
      };
      setAttachment(newAttachment);
      showNotification?.('File Attached', `${file.name} attached and ready to send`, 'success');
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !attachment) || isSending) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }

    const messageText = input.trim();
    const currentAttachment = attachment;

    setInput('');
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(messageText, selectedProvider, selectedModel, currentAttachment || undefined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleThinking = (messageId: string) => {
    setShowThinkingMap((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId((prev) => (prev === messageId ? null : prev)), 2000);
  };

  const foundCustom = customSources.find((cs) => cs.id === selectedProvider);
  const currentModels = foundCustom
    ? (foundCustom.models && foundCustom.models.length > 0 ? foundCustom.models : ['default-model'])
    : (DEFAULT_MODELS_BY_PROVIDER[selectedProvider] || ['default-model']);

  const showPreStreamIndicator = isSending && !streamingMessageId;

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="min-h-14 px-3 sm:px-4 py-2 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleMobileOpen}
            className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-medium text-xs sm:text-sm text-slate-200 truncate">
            {chat?.title || 'New chat'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={selectedProvider}
            onChange={handleProviderChange}
            disabled={isSending}
            className="bg-slate-900 text-slate-300 text-[11px] px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[110px] sm:max-w-none truncate"
          >
            <option value="mistral">Mistral</option>
            <option value="openrouter">OpenRouter</option>
            <option value="together">Together</option>
            <option value="anthropic">Anthropic</option>
            {customSources.map((cs) => (
              <option key={cs.id} value={cs.id}>{cs.name}</option>
            ))}
          </select>

          <select
            value={selectedModel}
            onChange={handleModelChange}
            disabled={isSending}
            className="hidden sm:block bg-slate-900 text-slate-300 text-[11px] font-mono px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[180px] truncate"
          >
            {currentModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 space-y-5 custom-scrollbar relative w-full"
      >
        {!chat || chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-950/40">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100">Raw LLM — Unfiltered Research Tool</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                No filters, no moderation. Direct access to LLM providers.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[11px] font-semibold text-red-400 mt-1 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>For research and testing purposes only</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
              <button
                onClick={() => setInput('Explain how transformer models work in detail.')}
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl text-left text-xs text-slate-300 transition-all cursor-pointer"
              >
                <div className="font-medium text-cyan-400 mb-0.5">Technical deep dive</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">Transformer architecture explained...</div>
              </button>
              <button
                onClick={() => setInput('Write a production-ready rate limiter in Go.')}
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl text-left text-xs text-slate-300 transition-all cursor-pointer"
              >
                <div className="font-medium text-cyan-400 mb-0.5">Production code</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">Go rate limiter with middleware...</div>
              </button>
            </div>
          </div>
        ) : (
          chat.messages.map((msg: Message) => {
            const isUser = msg.role === 'user';
            const isThinkingExpanded = showThinkingMap[msg.id];
            const isActivelyStreaming = msg.id === streamingMessageId;
            const isEmptyStreaming = isActivelyStreaming && !msg.content;
            const isCopied = copiedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1.5 ${
                  isUser ? 'ml-auto items-end max-w-[85%] sm:max-w-xl' : 'mr-auto items-start w-full sm:w-[95%]'
                }`}
              >
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 px-1">
                  {isUser ? (
                    <>
                      <span>You</span>
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium text-slate-300">
                        {msg.model || (msg.provider ? (PROVIDER_NAMES[msg.provider] || msg.provider) : 'Assistant')}
                      </span>
                    </>
                  )}
                </div>

                {msg.thinking && !isUser && (
                  <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <button
                      onClick={() => toggleThinking(msg.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-medium text-[11px] text-purple-300">How it got there</span>
                      </div>
                      {isThinkingExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isThinkingExpanded && (
                      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {msg.thinking}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-3.5 py-3 text-slate-100 ${
                    isUser
                      ? 'w-fit max-w-full bg-slate-800 border border-slate-700/60 rounded-tr-none'
                      : 'w-full bg-slate-900/80 border border-slate-800/80 rounded-tl-none'
                  }`}
                >
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2.5 space-y-1.5">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                          {att.type === 'image' && att.dataUrl ? (
                            <img src={att.dataUrl} alt={att.name} className="w-9 h-9 object-cover rounded" />
                          ) : (
                            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                          <span className="truncate font-medium text-slate-300">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isEmptyStreaming ? (
                    <div className="flex items-center gap-1.5 py-0.5 text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                    </div>
                  ) : isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <RenderContent content={msg.content} />
                  )}

                  {msg.error && (
                    <div className="mt-2 p-2 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{msg.error}</span>
                    </div>
                  )}
                </div>

                {/* Copy button under every message with content */}
                {!isEmptyStreaming && msg.content && (
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 px-1 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}

        {showPreStreamIndicator && (
          <div className="flex flex-col space-y-1.5 w-full sm:w-[95%] mr-auto items-start">
            <div className="flex items-center justify-between w-full text-[11px] text-slate-400 px-1">
              <div className="flex items-center space-x-2">
                <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-medium text-slate-300">{PROVIDER_NAMES[selectedProvider]}</span>
              </div>
              {onStopGeneration && (
                <button
                  onClick={onStopGeneration}
                  className="px-2 py-0.5 text-[10px] font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 rounded-md flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span>Stop Generating</span>
                </button>
              )}
            </div>
            {liveThinking && (
              <div className="w-full bg-purple-950/20 border border-purple-800/30 rounded-xl p-2.5 text-xs space-y-1 animate-pulse">
                <div className="flex items-center space-x-2 text-purple-400 font-medium text-[11px]">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Thinking...</span>
                </div>
                <p className="text-slate-400 text-[11px] truncate">{liveThinking}</p>
              </div>
            )}
            <div className="w-full rounded-2xl px-3.5 py-3 bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-none flex items-center space-x-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Working on it...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 right-4 sm:right-6 p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-lg shadow-cyan-500/20 transition-all cursor-pointer z-30"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4 stroke-[3]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="p-2.5 sm:p-3 bg-slate-950 border-t border-slate-800/80 shrink-0 z-20 space-y-2">
        {attachment && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 w-fit">
            {attachment.type === 'image' ? (
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="truncate max-w-[160px] sm:max-w-[200px] font-medium">{attachment.name}</span>
            <button
              onClick={() => setAttachment(null)}
              className="text-slate-500 hover:text-slate-200 transition-colors cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 focus-within:border-cyan-500/60 rounded-2xl p-2 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            disabled={isSending}
            className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-100 placeholder-slate-500 text-sm px-2 py-1.5 resize-none max-h-40 custom-scrollbar"
          />

          <div className="flex items-center justify-between pt-1.5 px-1">
            <div className="flex items-center gap-1">
              <button
                onClick={toggleListening}
                disabled={isSending}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                }`}
                title={isListening ? 'Stop listening' : 'Click to speak (Voice Input)'}
              >
                {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                {isListening && <span className="text-[10px] font-semibold text-red-400 pr-1">Listening...</span>}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Attach a file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.txt,.json,.md,.js,.ts,.py,.csv"
                className="hidden"
              />

              <select
                value={selectedModel}
                onChange={handleModelChange}
                disabled={isSending}
                className="sm:hidden bg-slate-950 text-slate-300 text-[10px] px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[130px] truncate"
              >
                {currentModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {isSending ? (
              <button
                onClick={onStopGeneration}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-red-950/60 animate-pulse"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current text-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim() && !attachment}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  input.trim() || attachment
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
