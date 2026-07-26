import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Search,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { AppSettings, Chat, ResearchMemoryItem } from '../types';

export interface MemoryLogsPageProps {
  settings: AppSettings;
  chats: Chat[];
  onSaveSettings: (nextSettings: AppSettings) => void;
  onClose: () => void;
  showNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const MemoryLogsPage: React.FC<MemoryLogsPageProps> = ({
  onClose,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const [memories, setMemories] = useState<ResearchMemoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('raw_llm_research_memories');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('raw_llm_research_memories', JSON.stringify(memories));
  }, [memories]);

  const [showWipeModal, setShowWipeModal] = useState(false);

  const deleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
    showNotification?.('Deleted', 'Memory entry removed.', 'info');
  };

  const wipeAll = () => {
    setMemories([]);
    setShowWipeModal(false);
    showNotification?.('Cleared', 'All memory entries removed.', 'success');
  };

  const filtered = memories.filter(
    (m) =>
      m.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.responsePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <div className="h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Memory</h1>
            <p className="text-xs text-slate-400">What the assistant has picked up from your chats</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memory..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            </div>

            {memories.length > 0 && (
              <button
                onClick={() => setShowWipeModal(true)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/20 border border-slate-800/80 rounded-2xl space-y-3">
              <Brain className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500">
                {memories.length === 0 ? 'Nothing here yet — it fills in as you chat.' : 'No matches.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="text-xs font-medium text-slate-200">{m.query}</div>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                        {m.responsePreview}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                        <span>{m.model}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(m.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMemory(m.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-950 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showWipeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center space-x-3 text-red-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-slate-100">Clear memory</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This removes everything the assistant has picked up so far. Can't be undone.
              </p>
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowWipeModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={wipeAll}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-slate-950 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Clear everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};