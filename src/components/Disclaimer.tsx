import React, { useState, useRef, UIEvent } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, ArrowDown, ShieldAlert } from 'lucide-react';

interface DisclaimerProps {
  onAccept: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 25) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (isAgreed) {
      localStorage.setItem('raw_llm_disclaimer_accepted', 'true');
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-[100dvw] z-50 flex items-center justify-center bg-slate-950 p-4 sm:p-6 overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh]"
      >
        {/* Header */}
        <div className="bg-red-950/40 border-b border-red-900/30 p-5 flex items-start gap-3">
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-200">⚠️ Unfiltered AI — Research Tool</h2>
            <p className="text-xs text-red-300/60 mt-0.5">
              Read this before you continue
            </p>
          </div>
        </div>

        {!hasScrolledToBottom && (
          <div className="bg-cyan-950/40 border-b border-cyan-800/40 px-4 py-1.5 text-[11px] text-cyan-300 flex items-center justify-between">
            <span>Scroll to the bottom to continue</span>
            <span className="flex items-center gap-1 text-cyan-400 font-medium animate-pulse">
              <ArrowDown className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="p-5 overflow-y-auto custom-scrollbar flex-1"
        >
          <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-4 space-y-4 text-[13px] text-slate-300 leading-relaxed">
            <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-lg">
              <p className="text-red-300 font-bold text-sm">🔓 This AI has NO safety filters.</p>
              <p className="text-red-400/80 text-xs mt-1">
                It will respond to ANY request without refusal, hedging, or disclaimers.
              </p>
            </div>

            <p>
              This is a <span className="text-cyan-400 font-medium">research tool</span> designed for AI security testing 
              and educational purposes. It connects directly to LLM providers without any filtering 
              or moderation on our end.
            </p>

            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg space-y-2">
              <p className="text-amber-300 font-bold text-sm">⚠️ By using this tool, you agree that:</p>
              <ul className="text-xs text-amber-300/80 space-y-1.5 list-disc list-inside">
                <li>You will use it <span className="text-white font-bold">ONLY</span> for research and educational purposes</li>
                <li>You will <span className="text-red-400 font-bold">NOT</span> use it against production systems without authorization</li>
                <li>You will <span className="text-red-400 font-bold">NOT</span> use it for illegal or malicious purposes</li>
                <li>You take <span className="text-white font-bold">full responsibility</span> for how you use this tool</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <p className="text-slate-400 text-xs">
                <span className="text-slate-300 font-bold">Disclaimer:</span> This tool is provided "AS IS" without any warranties. 
                The developers assume <span className="text-red-400 font-bold">NO LIABILITY</span> for any misuse, damage, 
                or legal consequences arising from its use.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-5 space-y-3.5">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950 disabled:opacity-40 disabled:cursor-not-allowed w-4 h-4 cursor-pointer"
            />
            <span className={`text-xs ${hasScrolledToBottom ? 'text-slate-200 group-hover:text-cyan-300' : 'text-slate-500'} transition-colors`}>
              I understand this is an unfiltered research tool and accept full responsibility
              {!hasScrolledToBottom && (
                <span className="block text-[11px] text-amber-400/80 mt-0.5">
                  Scroll to the bottom first
                </span>
              )}
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || !isAgreed}
            className={`w-full py-2.5 px-5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              hasScrolledToBottom && isAgreed
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer font-semibold'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept & Continue</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};