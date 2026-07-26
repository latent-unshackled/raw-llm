import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Settings,
  Brain,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Cpu,
} from 'lucide-react';
import { Chat } from '../types';

export interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  activeView: 'chat' | 'settings' | 'memory';
  onChangeView: (view: 'chat' | 'settings' | 'memory') => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isMobileOpen: boolean;
  onToggleMobileOpen: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  activeView,
  onChangeView,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isMobileOpen,
  onToggleMobileOpen,
  isCollapsed,
  onToggleCollapse,
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between h-16">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onChangeView('chat')}
        >
          <img
            src="/favicon.svg"
            alt="Raw LLM"
            className="w-9 h-9 rounded-xl shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0"
          />
          {(!isCollapsed || isMobileOpen) && (
            <div className="overflow-hidden">
              <span className="font-extrabold text-base tracking-tight text-slate-100">
                Raw LLM
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Research tool
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleMobileOpen}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action - New Chat */}
      <div className="p-3">
        <button
          onClick={() => {
            onNewChat();
            onChangeView('chat');
            if (isMobileOpen) onToggleMobileOpen();
          }}
          className={`w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm flex items-center transition-all shadow-md shadow-cyan-500/10 cursor-pointer ${
            isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-center space-x-2'
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {(!isCollapsed || isMobileOpen) && <span>New Chat</span>}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="px-3 py-1 space-y-1">
        <button
          onClick={() => {
            onChangeView('chat');
            if (isMobileOpen) onToggleMobileOpen();
          }}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'chat'
              ? 'bg-slate-900 text-cyan-400 border border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
          title="Chats"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Chats</span>}
        </button>

        <button
          onClick={() => {
            onChangeView('memory');
            if (isMobileOpen) onToggleMobileOpen();
          }}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'memory'
              ? 'bg-slate-900 text-cyan-400 border border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
          title="Memory"
        >
          <Brain className="w-4 h-4 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Memory</span>}
        </button>

        <button
          onClick={() => {
            onChangeView('settings');
            if (isMobileOpen) onToggleMobileOpen();
          }}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
            activeView === 'settings'
              ? 'bg-slate-900 text-cyan-400 border border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
          title="Settings"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Settings</span>}
        </button>
      </div>

      <div className="mx-3 my-2 border-t border-slate-800/80" />

      {(!isCollapsed || isMobileOpen) && (
        <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Recent</span>
          <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
            {chats.length}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {chats.length === 0 ? (
          (!isCollapsed || isMobileOpen) && (
            <div className="p-4 text-center text-xs text-slate-500">
              No chats yet — start one above.
            </div>
          )
        ) : (
          chats.map((chat) => {
            const isActive = activeChatId === chat.id && activeView === 'chat';
            return (
              <div
                key={chat.id}
                className={`group relative flex items-center rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-slate-100 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                } ${isCollapsed && !isMobileOpen ? 'p-2.5 justify-center' : 'px-3 py-2.5'}`}
                onClick={() => {
                  onSelectChat(chat.id);
                  onChangeView('chat');
                  if (isMobileOpen) onToggleMobileOpen();
                }}
                title={chat.title}
              >
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />

                {(!isCollapsed || isMobileOpen) && (
                  <>
                    <span className="ml-2.5 truncate flex-1 text-xs font-medium">
                      {chat.title || 'Untitled chat'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer ml-1"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block h-screen transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggleMobileOpen}
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 h-full md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};