import React, { useState } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sliders,
  Server,
  Zap,
  Save,
  X,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AppSettings, ProviderKeys, ProviderType, CustomSource, QuickTemplate } from '../types';

export interface SettingsPageProps {
  settings: AppSettings;
  providerKeys: ProviderKeys[];
  onSaveSettings: (nextSettings: AppSettings) => void;
  onSaveProviderKeys: (nextKeys: ProviderKeys[]) => void;
  onClose: () => void;
  onFactoryReset?: () => void;
  showNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

const PROVIDER_LABELS: Record<ProviderType, string> = {
  mistral: 'Mistral AI',
  openrouter: 'OpenRouter',
  together: 'Together AI',
  anthropic: 'Anthropic',
  custom: 'Custom Source',
};

const PREFILLED_TEMPLATES: QuickTemplate[] = [
  {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'deepseek-r1-distill-llama-70b'],
    description: 'Ultra-fast LPU inference',
  },
  {
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    models: ['llama3.1-8b', 'llama3.1-70b'],
    description: 'Wafer-scale high speed LLMs',
  },
  {
    name: 'Ollama / Local',
    baseUrl: 'http://localhost:11434/v1',
    models: ['llama3', 'mistral', 'deepseek-r1'],
    description: 'Local server (No key required)',
  },
  {
    name: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/v1',
    models: ['meta-llama/Llama-3.2-11B-Vision-Instruct'],
    description: 'HF Inference Endpoint API',
  },
  {
    name: 'OpenRouter Custom',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['deepseek/deepseek-r1', 'anthropic/claude-3.5-sonnet'],
    description: 'OpenAI-compatible OpenRouter route',
  },
  {
    name: 'Cloudflare AI',
    baseUrl: 'https://gateway.ai.cloudflare.com/v1',
    models: ['meta/llama-3-8b-instruct'],
    description: 'Edge AI proxy gateway',
  },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  providerKeys,
  onSaveSettings,
  onSaveProviderKeys,
  onClose,
  onFactoryReset,
  showNotification,
}) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [draftKeys, setDraftKeys] = useState<ProviderKeys[]>(providerKeys);
  const [showKeysMap, setShowKeysMap] = useState<Record<string, boolean>>({});
  const [showResetModal, setShowResetModal] = useState(false);

  const [customSources, setCustomSources] = useState<CustomSource[]>(
    settings.customSources || []
  );

  const toggleShowKey = (id: string) => {
    setShowKeysMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyChange = (provider: ProviderType, keyIndex: number, value: string) => {
    setDraftKeys((prev) =>
      prev.map((item) => {
        if (item.provider === provider) {
          const nextKeys = [...item.keys];
          nextKeys[keyIndex] = value;
          return { ...item, keys: nextKeys };
        }
        return item;
      })
    );
  };

  const addSecondaryKey = (provider: ProviderType) => {
    setDraftKeys((prev) =>
      prev.map((item) => (item.provider === provider ? { ...item, keys: [...item.keys, ''] } : item))
    );
  };

  const removeKeySlot = (provider: ProviderType, keyIndex: number) => {
    setDraftKeys((prev) =>
      prev.map((item) => {
        if (item.provider === provider) {
          const nextKeys = item.keys.filter((_, idx) => idx !== keyIndex);
          return { ...item, keys: nextKeys.length > 0 ? nextKeys : [''] };
        }
        return item;
      })
    );
  };

  const saveProviderKeys = (provider: ProviderType) => {
    onSaveProviderKeys(draftKeys);
    showNotification?.('Saved', `${PROVIDER_LABELS[provider] || provider} keys updated.`, 'success');
  };

  const handleToggleSetting = (key: keyof AppSettings) => {
    const nextVal = !currentSettings[key];
    const next = { ...currentSettings, [key]: nextVal };
    setCurrentSettings(next);
    onSaveSettings(next);
  };

  // Custom Sources Logic
  const handleAddCustomTemplate = (template: QuickTemplate) => {
    const newSource: CustomSource = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: template.name,
      baseUrl: template.baseUrl,
      models: [...template.models],
      keys: [''],
    };
    const updated = [...customSources, newSource];
    setCustomSources(updated);
    const next = { ...currentSettings, customSources: updated };
    setCurrentSettings(next);
    onSaveSettings(next);
    showNotification?.('Template Added', `Added ${template.name} custom source.`, 'success');
  };

  const handleAddBlankCustomSource = () => {
    const newSource: CustomSource = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: 'Custom Endpoint',
      baseUrl: 'https://api.example.com/v1',
      models: ['default-model'],
      keys: [''],
    };
    const updated = [...customSources, newSource];
    setCustomSources(updated);
    const next = { ...currentSettings, customSources: updated };
    setCurrentSettings(next);
    onSaveSettings(next);
    showNotification?.('Source Added', 'Created new blank custom source.', 'info');
  };

  const handleUpdateCustomSourceField = (id: string, field: keyof CustomSource, value: any) => {
    setCustomSources((prev) =>
      prev.map((cs) => (cs.id === id ? { ...cs, [field]: value } : cs))
    );
  };

  const addCustomSourceKey = (id: string) => {
    setCustomSources((prev) =>
      prev.map((cs) => {
        if (cs.id === id) {
          const currentKeys = cs.keys && cs.keys.length > 0 ? cs.keys : (cs.apiKey ? [cs.apiKey] : ['']);
          const updatedKeys = [...currentKeys, ''];
          return { ...cs, keys: updatedKeys, apiKey: updatedKeys[0] || '' };
        }
        return cs;
      })
    );
  };

  const updateCustomSourceKey = (id: string, keyIndex: number, val: string) => {
    setCustomSources((prev) =>
      prev.map((cs) => {
        if (cs.id === id) {
          const currentKeys = [...(cs.keys && cs.keys.length > 0 ? cs.keys : (cs.apiKey ? [cs.apiKey] : ['']))];
          currentKeys[keyIndex] = val;
          return { ...cs, keys: currentKeys, apiKey: currentKeys[0] || '' };
        }
        return cs;
      })
    );
  };

  const removeCustomSourceKey = (id: string, keyIndex: number) => {
    setCustomSources((prev) =>
      prev.map((cs) => {
        if (cs.id === id) {
          const currentKeys = (cs.keys && cs.keys.length > 0 ? cs.keys : (cs.apiKey ? [cs.apiKey] : [''])).filter((_, idx) => idx !== keyIndex);
          const updatedKeys = currentKeys.length > 0 ? currentKeys : [''];
          return { ...cs, keys: updatedKeys, apiKey: updatedKeys[0] || '' };
        }
        return cs;
      })
    );
  };

  const handleSaveCustomSources = () => {
    const next = { ...currentSettings, customSources };
    setCurrentSettings(next);
    onSaveSettings(next);
    showNotification?.('Saved', 'Custom sources saved.', 'success');
  };

  const handleDeleteCustomSource = (id: string) => {
    const updated = customSources.filter((cs) => cs.id !== id);
    setCustomSources(updated);
    const next = { ...currentSettings, customSources: updated };
    setCurrentSettings(next);
    onSaveSettings(next);
    showNotification?.('Deleted', 'Custom source removed.', 'info');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header Bar */}
      <div className="h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">Settings</h1>
            <p className="text-xs text-slate-400">API keys, custom sources, and preferences</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Main Provider Keys */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <Key className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Core Provider API Keys</h2>
            </div>

            {draftKeys.map((pKey) => {
              const activeCount = pKey.keys.filter((k) => k.trim().length > 0).length;
              const isShow = showKeysMap[pKey.provider];

              return (
                <div key={pKey.provider} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs sm:text-sm text-slate-200">
                      {PROVIDER_LABELS[pKey.provider] || pKey.provider}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {activeCount} active
                      </span>
                      <button
                        onClick={() => toggleShowKey(pKey.provider)}
                        className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        {isShow ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pKey.keys.map((kVal, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type={isShow ? 'text' : 'password'}
                          value={kVal}
                          onChange={(e) => handleKeyChange(pKey.provider, idx, e.target.value)}
                          placeholder={`Key #${idx + 1}...`}
                          className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
                        />
                        {pKey.keys.length > 1 && (
                          <button
                            onClick={() => removeKeySlot(pKey.provider, idx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => addSecondaryKey(pKey.provider)}
                      className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add backup key</span>
                    </button>
                    <button
                      onClick={() => saveProviderKeys(pKey.provider)}
                      className="text-[11px] font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg px-3 py-1.5 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Sources & Pre-filled Templates Section */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-100">Custom Sources & Endpoints</h2>
              </div>
              <button
                onClick={handleAddBlankCustomSource}
                className="text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg px-2.5 py-1 flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>New Custom Source</span>
              </button>
            </div>

            {/* Quick Templates Row */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-slate-300">Quick Pre-filled Templates:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PREFILLED_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => handleAddCustomTemplate(tmpl)}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-semibold text-xs text-slate-200 group-hover:text-cyan-400 transition-colors">
                      + {tmpl.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {tmpl.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Configured Custom Sources List */}
            <div className="space-y-4 pt-2">
              {customSources.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-1">
                  <div className="text-xs text-slate-400">No custom sources configured yet.</div>
                  <div className="text-[11px] text-slate-500">
                    Click a pre-filled template above or create a custom OpenAI-compatible endpoint.
                  </div>
                </div>
              ) : (
                customSources.map((cs) => {
                  const isShow = showKeysMap[cs.id];
                  const keysList = (cs.keys && cs.keys.length > 0) ? cs.keys : (cs.apiKey ? [cs.apiKey] : ['']);
                  const activeCount = keysList.filter((k) => k.trim().length > 0).length;

                  return (
                    <div
                      key={cs.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={cs.name}
                          onChange={(e) =>
                            handleUpdateCustomSourceField(cs.id, 'name', e.target.value)
                          }
                          placeholder="Source Name (e.g., Groq, Local Ollama)"
                          className="bg-transparent font-bold text-xs sm:text-sm text-slate-200 border-b border-transparent focus:border-cyan-500 focus:outline-none px-1 py-0.5"
                        />
                        <button
                          onClick={() => handleDeleteCustomSource(cs.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Base URL
                          </label>
                          <input
                            type="text"
                            value={cs.baseUrl}
                            onChange={(e) =>
                              handleUpdateCustomSourceField(cs.id, 'baseUrl', e.target.value)
                            }
                            placeholder="https://api.groq.com/openai/v1"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Models (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={Array.isArray(cs.models) ? cs.models.join(', ') : cs.models}
                            onChange={(e) =>
                              handleUpdateCustomSourceField(
                                cs.id,
                                'models',
                                e.target.value.split(',').map((m) => m.trim()).filter(Boolean)
                              )
                            }
                            placeholder="llama-3.3-70b-versatile, mixtral-8x7b"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              API Keys (Optional for local servers)
                            </label>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {activeCount} active
                            </span>
                          </div>
                          <button
                            onClick={() => toggleShowKey(cs.id)}
                            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center space-x-1 cursor-pointer"
                          >
                            {isShow ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{isShow ? 'Hide' : 'Show'}</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {keysList.map((kVal, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <input
                                type={isShow ? 'text' : 'password'}
                                value={kVal}
                                onChange={(e) => updateCustomSourceKey(cs.id, idx, e.target.value)}
                                placeholder={`Key #${idx + 1}...`}
                                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none"
                              />
                              {keysList.length > 1 && (
                                <button
                                  onClick={() => removeCustomSourceKey(cs.id, idx)}
                                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => addCustomSourceKey(cs.id)}
                            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add backup key</span>
                          </button>
                          <button
                            onClick={handleSaveCustomSources}
                            className="text-[11px] font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg px-3 py-1.5 flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save Source</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Behavior Toggles */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-100">Behavior</h2>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="space-y-0.5 pr-4">
                <div className="font-semibold text-xs text-slate-200">Remember things about me</div>
                <div className="text-[11px] text-slate-400">
                  Picks up useful facts from chats so future replies stay consistent.
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting('aiMemoryEnabled')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  currentSettings.aiMemoryEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    currentSettings.aiMemoryEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="space-y-0.5 pr-4">
                <div className="font-semibold text-xs text-slate-200">Retry on failure</div>
                <div className="text-[11px] text-slate-400">
                  Automatically tries a backup key if the first one fails.
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting('autoRotateKeys')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  currentSettings.autoRotateKeys ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    currentSettings.autoRotateKeys ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Danger Zone & Factory Reset */}
          <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-red-900/40 pb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-red-200">Danger Zone</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-950/80 border border-red-900/30">
              <div className="space-y-0.5">
                <div className="font-semibold text-xs text-red-300">Factory Reset Application</div>
                <div className="text-[11px] text-slate-400">
                  Wipes all API keys, custom sources, settings, memory logs, and chat histories completely.
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl px-4 py-2 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-lg shadow-red-950/50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Factory Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-900/60 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Confirm Factory Reset</h3>
                <p className="text-xs text-red-400 font-medium">This action is permanent and cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              Are you sure you want to perform a factory reset? This will immediately erase all saved API keys, custom endpoints, chat histories, memory logs, and settings from your local browser storage.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-1">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  onFactoryReset?.();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors cursor-pointer shadow-md shadow-red-950/50 flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Reset Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
