// ============================================================
// CORE TYPES
// ============================================================

export type ProviderType = 
  | "mistral" 
  | "openrouter" 
  | "together" 
  | "anthropic" 
  | string;

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export interface ThinkStep {
  id: string;
  stepName: string;
  detail: string;
  completed: boolean;
}

export interface ResearchMemoryItem {
  id: string;
  query: string;
  responsePreview: string;
  preset: string;
  provider: string;
  model: string;
  timestamp: number;
}

export interface Attachment {
  id?: string;
  name: string;
  type: string;
  size?: number;
  base64?: string;
  dataUrl?: string;
  content?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string | number;
  actualProvider?: string;
  actualModel?: string;
  thought?: string;
  thoughtExpanded?: boolean;
  provider?: ProviderType;
  model?: string;
  thinking?: string;
  attachments?: Attachment[];
  error?: string;
  _unfiltered?: boolean;
}

export interface AgentActionItem {
  id: string;
  text: string;
  completed: boolean;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  provider: ProviderType;
  model: string;
  memorySummary?: string;
  actionItems?: AgentActionItem[];
  createdAt: string;
}

export interface ProviderKeys {
  provider: ProviderType;
  keys: string[];
  activeKeyIndex: number;
}

export interface CustomSource {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  apiKey?: string;
  keys?: string[];
}

export interface QuickTemplate {
  name: string;
  baseUrl: string;
  models: string[];
  description: string;
}

export interface MemoryLog {
  id: string;
  text: string;
  timestamp: string;
  extractedFromChatId?: string;
}

// ============================================================
// UNFILTERED MODE SETTINGS
// ============================================================

export interface UnfilteredSettings {
  enabled: boolean;
  preset: UnfilteredPreset;
  parseltongueMode: boolean;
  parseltongueTechnique: ParseltongueTechnique;
  liquidMode: boolean;
  ultraplinianMode: boolean;
  encryptionMode: boolean;
  ultraplinianTier: UltraplinianTier;
  liquidMaxIterations: number;
  liquidMinDelta: number;
  liquidTargetScore: number;
}

export type UnfilteredPreset = 
  | 'developer'
  | 'dan'
  | 'roleplay'
  | 'system'
  | 'encrypted'
  | 'sonnet-35'
  | 'grok-reset'
  | 'gemini-reset'
  | 'gpt-classic'
  | 'hermes-fast';

export type ParseltongueTechnique = 
  | 'leetspeak'
  | 'bubble'
  | 'unicode'
  | 'reversed'
  | 'morse'
  | 'base64'
  | 'dotted'
  | 'under_score'
  | 'raw';

export type UltraplinianTier = 
  | 'fast'
  | 'standard'
  | 'smart'
  | 'power'
  | 'ultra';

// ============================================================
// UNFILTERED MEMORY
// ============================================================

export interface UnfilteredMemory {
  id: string;
  text: string;
  response: string;
  timestamp: string;
  preset: string;
  model: string;
  provider: string;
  chatId: string;
}

// ============================================================
// APP SETTINGS
// ============================================================

export interface AppSettings {
  autoSummaryEnabled?: boolean;
  rememberAcrossChats?: boolean;
  autoRotateKeys?: boolean;
  globalSummary?: string;
  
  aiMemoryEnabled?: boolean;
  autoRotateKeysToggle?: boolean;
  customSources?: CustomSource[];
  memoryLogs?: MemoryLog[];
  
  aiMemorySync?: boolean;
  autoRotateFailover?: boolean;
  researchMode?: boolean;
  preset?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;

  unfiltered?: UnfilteredSettings;
  unfilteredMemory?: UnfilteredMemory[];
}

// ============================================================
// PROVIDER REQUEST
// ============================================================

export interface ChatRequest {
  provider: ProviderType;
  apiKey: string;
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  
  unfilteredMode?: boolean;
  preset?: UnfilteredPreset;
  parseltongueMode?: boolean;
  parseltongueTechnique?: ParseltongueTechnique;
  liquidMode?: boolean;
  ultraplinianMode?: boolean;
  encryptionMode?: boolean;
  baseUrl?: string;
}

// ============================================================
// PROVIDERS INFO
// ============================================================

export const PROVIDERS_INFO: Record<string, { name: string; defaultModel: string; models: ModelOption[] }> = {
  mistral: {
    name: "Mistral AI",
    defaultModel: "mistral-large-latest",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large (Latest)", description: "Mistral's top-tier flagship model, highly fluent and intelligent." },
      { id: "pixtral-large-latest", name: "Pixtral Large (Latest)", description: "Mistral's multimodal giant with strong analytical reasoning." },
      { id: "open-mistral-nemo", name: "Mistral Nemo", description: "Fast, efficient 12B model with wide language coverage." },
      { id: "codestral-latest", name: "Codestral (Latest)", description: "Optimized specifically for coding and structural tasks." }
    ]
  },
  openrouter: {
    name: "OpenRouter",
    defaultModel: "google/gemini-2.5-flash",
    models: [
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "High-speed, large-context model perfect for general usage." },
      { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Advanced complex reasoning and coding expert from Google." },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Industry standard for state-of-the-art coding, prose, and logic." },
      { id: "deepseek/deepseek-chat", name: "DeepSeek V3 / R1", description: "High-performance, economical deep reasoning model." },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B Instruct", description: "Meta's flagship instructor model running on OpenRouter servers." }
    ]
  },
  together: {
    name: "Together AI",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", description: "Incredibly fast high-throughput Llama 3.3 model." },
      { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", description: "Highly efficient 671B MoE with outstanding logic." },
      { id: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen 2.5 Coder 32B", description: "State-of-the-art open coding and programming model." },
      { id: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", name: "Llama 3.1 8B Turbo", description: "Sub-second response time for light requests." }
    ]
  },
  anthropic: {
    name: "Anthropic API",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "The definitive benchmark for multi-step tasks, research, and deep coding." },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Blazing fast sibling of Sonnet, ideal for rapid-fire agent orchestration." },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Slower, classic heavyweight with exceptional writing prose." }
    ]
  }
};
