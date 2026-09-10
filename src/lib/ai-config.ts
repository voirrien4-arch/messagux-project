// ============================================
// MESSAGUX - Configuration IA Centralisée
// Toutes les familles de modèles supportées
// STRICTEMENT ADDITIVE - Ne supprime rien
// ============================================

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  family: string;
  type: "llm" | "image" | "audio" | "video" | "embedding" | "rerank" | "realtime";
  capabilities: string[];
  protocol: "openai_chat" | "openai_responses" | "anthropic_messages" | "google_gemini" | "openai_compatible";
  baseUrl: string;
  defaultModel: string;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  temperature?: number;
  contextWindow?: number;
}

export interface AIProviderConfig {
  name: string;
  envKey: string;
  protocols: string[];
  models: AIModelConfig[];
  enabled: boolean;
  baseUrl: string;
  isDynamic?: boolean; // true = modèles découverts dynamiquement
}

// ============================================
// LOVABLE AI GATEWAY — actif par défaut (aucune clé à fournir)
// ============================================

const lovableModel = (
  id: string,
  name: string,
  vision = true,
): AIModelConfig => ({
  id,
  name,
  provider: "Lovable AI",
  family: "lovable",
  type: "llm",
  capabilities: ["chat", "reasoning", "coding", "text_generation", "multilingual"],
  protocol: "openai_compatible",
  baseUrl: "https://ai.gateway.lovable.dev/v1",
  defaultModel: id,
  maxTokens: 4096,
  supportsStreaming: true,
  supportsVision: vision,
  supportsFunctionCalling: true,
  contextWindow: 128000,
});

const LOVABLE_PROVIDER: AIProviderConfig = {
  name: "Lovable AI",
  envKey: "LOVABLE_API_KEY",
  protocols: ["openai_compatible"],
  enabled: true,
  baseUrl: "https://ai.gateway.lovable.dev/v1",
  models: [
    lovableModel("google/gemini-3.8-flash", "Gemini 3.8 Flash"),
    lovableModel("google/gemini-3.1-pro-preview", "Gemini 3.1 Pro"),
    lovableModel("openai/gpt-5.6-terra", "GPT-5.6 Terra"),
    lovableModel("openai/gpt-5.6-luna", "GPT-5.6 Luna"),
  ],
};

// ============================================
// FAMILLES EXISTANTES (préservées intégralement)
// ============================================


// HCNSEC — MODÈLES DÉCOUVERTS DYNAMIQUEMENT
// La clé API est HCNSEC_API_KEY (côté serveur uniquement)
// Les modèles sont récupérés via GET https://api.hcnsec.cn/v1/models
const HCNSEC_PROVIDER: AIProviderConfig = {
  name: "HCNSEC",
  envKey: "HCNSEC_API_KEY",
  protocols: ["openai_compatible"],
  enabled: false, // Activé dynamiquement si la clé est configurée
  baseUrl: "https://api.hcnsec.cn/v1",
  isDynamic: true,
  models: [], // Rempli dynamiquement par discoverHCNSECModels()
};

// ============================================
// NOUVELLES FAMILLES (préservées intégralement)
// ============================================

// 1. OPENAI
const OPENAI_PROVIDER: AIProviderConfig = {
  name: "OpenAI",
  envKey: "OPENAI_API_KEY",
  protocols: ["openai_chat", "openai_responses"],
  enabled: false,
  baseUrl: "https://api.openai.com/v1",
  models: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      family: "openai",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "multimodal", "vision"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      family: "openai",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "multimodal", "vision"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o-mini",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      family: "openai",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "vision"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4-turbo",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "o1-preview",
      name: "o1 Preview",
      provider: "OpenAI",
      family: "openai",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "o1-preview",
      maxTokens: 32768,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
      contextWindow: 128000,
    },
    {
      id: "o1-mini",
      name: "o1 Mini",
      provider: "OpenAI",
      family: "openai",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "o1-mini",
      maxTokens: 65536,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
      contextWindow: 128000,
    },
    {
      id: "dall-e-3",
      name: "DALL-E 3",
      provider: "OpenAI",
      family: "openai",
      type: "image",
      capabilities: ["image_generation"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "dall-e-3",
      maxTokens: 0,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
    },
    {
      id: "text-embedding-3-large",
      name: "Text Embedding 3 Large",
      provider: "OpenAI",
      family: "openai",
      type: "embedding",
      capabilities: ["embeddings"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "text-embedding-3-large",
      maxTokens: 0,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
    },
    {
      id: "gpt-4o-realtime",
      name: "GPT-4o Realtime",
      provider: "OpenAI",
      family: "openai",
      type: "realtime",
      capabilities: ["realtime", "audio", "chat"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o-realtime-preview",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
    },
    {
      id: "whisper-1",
      name: "Whisper",
      provider: "OpenAI",
      family: "openai",
      type: "audio",
      capabilities: ["audio_transcription", "audio_translation"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "whisper-1",
      maxTokens: 0,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
    },
    {
      id: "tts-1",
      name: "TTS",
      provider: "OpenAI",
      family: "openai",
      type: "audio",
      capabilities: ["text_to_speech"],
      protocol: "openai_chat",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "tts-1",
      maxTokens: 0,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
    },
  ],
};

// 2. CLAUDE (Anthropic)
const CLAUDE_PROVIDER: AIProviderConfig = {
  name: "Claude",
  envKey: "ANTHROPIC_API_KEY",
  protocols: ["anthropic_messages", "openai_compatible"],
  enabled: false,
  baseUrl: "https://api.anthropic.com/v1",
  models: [
    {
      id: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Claude",
      family: "claude",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "vision", "multimodal"],
      protocol: "anthropic_messages",
      baseUrl: "https://api.anthropic.com/v1",
      defaultModel: "claude-3-5-sonnet-20241022",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 200000,
    },
    {
      id: "claude-3-5-haiku",
      name: "Claude 3.5 Haiku",
      provider: "Claude",
      family: "claude",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "vision"],
      protocol: "anthropic_messages",
      baseUrl: "https://api.anthropic.com/v1",
      defaultModel: "claude-3-5-haiku-20241022",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 200000,
    },
    {
      id: "claude-3-opus",
      name: "Claude 3 Opus",
      provider: "Claude",
      family: "claude",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "vision", "multimodal"],
      protocol: "anthropic_messages",
      baseUrl: "https://api.anthropic.com/v1",
      defaultModel: "claude-3-opus-20240229",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 200000,
    },
  ],
};

// 3. GEMINI (Google)
const GEMINI_PROVIDER: AIProviderConfig = {
  name: "Gemini",
  envKey: "GEMINI_API_KEY",
  protocols: ["google_gemini", "openai_compatible"],
  enabled: false,
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  models: [
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "Gemini",
      family: "gemini",
      type: "llm",
      capabilities: ["chat", "reasoning", "multimodal", "text_generation", "coding", "vision"],
      protocol: "google_gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: "gemini-1.5-pro",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 2000000,
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      provider: "Gemini",
      family: "gemini",
      type: "llm",
      capabilities: ["chat", "reasoning", "multimodal", "text_generation", "coding", "vision"],
      protocol: "google_gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: "gemini-1.5-flash",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 1000000,
    },
    {
      id: "gemini-1.5-flash-8b",
      name: "Gemini 1.5 Flash 8B",
      provider: "Gemini",
      family: "gemini",
      type: "llm",
      capabilities: ["chat", "reasoning", "multimodal", "text_generation", "coding"],
      protocol: "google_gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: "gemini-1.5-flash-8b",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 1000000,
    },
    {
      id: "text-embedding-004",
      name: "Gemini Embedding",
      provider: "Gemini",
      family: "gemini",
      type: "embedding",
      capabilities: ["embeddings"],
      protocol: "google_gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      defaultModel: "text-embedding-004",
      maxTokens: 0,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
    },
  ],
};

// 4. DEEPSEEK
const DEEPSEEK_PROVIDER: AIProviderConfig = {
  name: "DeepSeek",
  envKey: "DEEPSEEK_API_KEY",
  protocols: ["openai_compatible"],
  enabled: false,
  baseUrl: "https://api.deepseek.com/v1",
  models: [
    {
      id: "deepseek-chat",
      name: "DeepSeek Chat",
      provider: "DeepSeek",
      family: "deepseek",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation"],
      protocol: "openai_compatible",
      baseUrl: "https://api.deepseek.com/v1",
      defaultModel: "deepseek-chat",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
      contextWindow: 64000,
    },
    {
      id: "deepseek-reasoner",
      name: "DeepSeek Reasoner",
      provider: "DeepSeek",
      family: "deepseek",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation"],
      protocol: "openai_compatible",
      baseUrl: "https://api.deepseek.com/v1",
      defaultModel: "deepseek-reasoner",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
      contextWindow: 64000,
    },
  ],
};

// 5. QWEN (Alibaba)
const QWEN_PROVIDER: AIProviderConfig = {
  name: "Qwen",
  envKey: "QWEN_API_KEY",
  protocols: ["openai_compatible"],
  enabled: false,
  baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  models: [
    {
      id: "qwen-max",
      name: "Qwen Max",
      provider: "Qwen",
      family: "qwen",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "multilingual"],
      protocol: "openai_compatible",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      defaultModel: "qwen-max",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 32000,
    },
    {
      id: "qwen-plus",
      name: "Qwen Plus",
      provider: "Qwen",
      family: "qwen",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "multilingual"],
      protocol: "openai_compatible",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      defaultModel: "qwen-plus",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 32000,
    },
    {
      id: "qwen-turbo",
      name: "Qwen Turbo",
      provider: "Qwen",
      family: "qwen",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "multilingual"],
      protocol: "openai_compatible",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      defaultModel: "qwen-turbo",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 32000,
    },
    {
      id: "qwen-vl-max",
      name: "Qwen VL Max",
      provider: "Qwen",
      family: "qwen",
      type: "llm",
      capabilities: ["chat", "reasoning", "multimodal", "vision", "text_generation"],
      protocol: "openai_compatible",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      defaultModel: "qwen-vl-max",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 32000,
    },
    {
      id: "text-embedding-v3",
      name: "Qwen Embedding",
      provider: "Qwen",
      family: "qwen",
      type: "embedding",
      capabilities: ["embeddings"],
      protocol: "openai_compatible",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      defaultModel: "text-embedding-v3",
      maxTokens: 0,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
    },
  ],
};

// 6. LLAMA (Meta)
const LLAMA_PROVIDER: AIProviderConfig = {
  name: "Llama",
  envKey: "LLAMA_API_KEY",
  protocols: ["openai_compatible"],
  enabled: false,
  baseUrl: "https://api.together.xyz/v1",
  models: [
    {
      id: "llama-3.1-405b",
      name: "Llama 3.1 405B",
      provider: "Llama",
      family: "llama",
      type: "llm",
      capabilities: ["chat", "coding", "text_generation", "reasoning"],
      protocol: "openai_compatible",
      baseUrl: "https://api.together.xyz/v1",
      defaultModel: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "llama-3.1-70b",
      name: "Llama 3.1 70B",
      provider: "Llama",
      family: "llama",
      type: "llm",
      capabilities: ["chat", "coding", "text_generation", "reasoning"],
      protocol: "openai_compatible",
      baseUrl: "https://api.together.xyz/v1",
      defaultModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "llama-3.1-8b",
      name: "Llama 3.1 8B",
      provider: "Llama",
      family: "llama",
      type: "llm",
      capabilities: ["chat", "coding", "text_generation"],
      protocol: "openai_compatible",
      baseUrl: "https://api.together.xyz/v1",
      defaultModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "llama-3.2-90b-vision",
      name: "Llama 3.2 90B Vision",
      provider: "Llama",
      family: "llama",
      type: "llm",
      capabilities: ["chat", "coding", "text_generation", "vision", "multimodal"],
      protocol: "openai_compatible",
      baseUrl: "https://api.together.xyz/v1",
      defaultModel: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
  ],
};

// 7. GLM (Zhipu AI)
const GLM_PROVIDER: AIProviderConfig = {
  name: "GLM",
  envKey: "GLM_API_KEY",
  protocols: ["openai_compatible"],
  enabled: false,
  baseUrl: "https://open.bigmodel.cn/api/paas/v4",
  models: [
    {
      id: "glm-4-plus",
      name: "GLM-4 Plus",
      provider: "GLM",
      family: "glm",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "multimodal"],
      protocol: "openai_compatible",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      defaultModel: "glm-4-plus",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "glm-4",
      name: "GLM-4",
      provider: "GLM",
      family: "glm",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation", "multimodal"],
      protocol: "openai_compatible",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      defaultModel: "glm-4",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "glm-4-flash",
      name: "GLM-4 Flash",
      provider: "GLM",
      family: "glm",
      type: "llm",
      capabilities: ["chat", "reasoning", "coding", "text_generation"],
      protocol: "openai_compatible",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      defaultModel: "glm-4-flash",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
    {
      id: "embedding-3",
      name: "GLM Embedding",
      provider: "GLM",
      family: "glm",
      type: "embedding",
      capabilities: ["embeddings"],
      protocol: "openai_compatible",
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      defaultModel: "embedding-3",
      maxTokens: 0,
      supportsStreaming: false,
      supportsVision: false,
      supportsFunctionCalling: false,
    },
  ],
};

// 8. KIMI (Moonshot AI)
const KIMI_PROVIDER: AIProviderConfig = {
  name: "Kimi",
  envKey: "KIMI_API_KEY",
  protocols: ["openai_compatible"],
  enabled: false,
  baseUrl: "https://api.moonshot.cn/v1",
  models: [
    {
      id: "kimi-k1.5",
      name: "Kimi K1.5",
      provider: "Kimi",
      family: "kimi",
      type: "llm",
      capabilities: ["chat", "reasoning", "long_context", "text_generation", "coding"],
      protocol: "openai_compatible",
      baseUrl: "https://api.moonshot.cn/v1",
      defaultModel: "kimi-k1.5",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 200000,
    },
    {
      id: "kimi-latest",
      name: "Kimi Latest",
      provider: "Kimi",
      family: "kimi",
      type: "llm",
      capabilities: ["chat", "reasoning", "long_context", "text_generation", "coding"],
      protocol: "openai_compatible",
      baseUrl: "https://api.moonshot.cn/v1",
      defaultModel: "kimi-latest",
      maxTokens: 8192,
      supportsStreaming: true,
      supportsVision: true,
      supportsFunctionCalling: true,
      contextWindow: 200000,
    },
    {
      id: "moonshot-v1-128k",
      name: "Moonshot 128K",
      provider: "Kimi",
      family: "kimi",
      type: "llm",
      capabilities: ["chat", "reasoning", "long_context", "text_generation", "coding"],
      protocol: "openai_compatible",
      baseUrl: "https://api.moonshot.cn/v1",
      defaultModel: "moonshot-v1-128k",
      maxTokens: 4096,
      supportsStreaming: true,
      supportsVision: false,
      supportsFunctionCalling: true,
      contextWindow: 128000,
    },
  ],
};

// ============================================
// REGISTRE CENTRAL (HCNSEC en première position, puis les autres)
// ============================================

export const AI_PROVIDERS: AIProviderConfig[] = [
  LOVABLE_PROVIDER,   // Actif par défaut via Lovable AI
  HCNSEC_PROVIDER,    // CORRIGÉ - clé serveur, modèles dynamiques
  OPENAI_PROVIDER,    // PRÉSERVÉ
  CLAUDE_PROVIDER,    // PRÉSERVÉ
  GEMINI_PROVIDER,    // PRÉSERVÉ
  DEEPSEEK_PROVIDER,  // PRÉSERVÉ
  QWEN_PROVIDER,      // PRÉSERVÉ
  LLAMA_PROVIDER,     // PRÉSERVÉ
  GLM_PROVIDER,       // PRÉSERVÉ
  KIMI_PROVIDER,      // PRÉSERVÉ
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

export function getEnabledProviders(): AIProviderConfig[] {
  return AI_PROVIDERS.filter((p) => {
    const key = process.env[p.envKey];
    return key && key.length > 0;
  });
}

export function getAllModels(): AIModelConfig[] {
  return AI_PROVIDERS.flatMap((p) => p.models);
}

export function getModelsByType(type: AIModelConfig["type"]): AIModelConfig[] {
  return getAllModels().filter((m) => m.type === type);
}

export function getModelsByFamily(family: string): AIModelConfig[] {
  return getAllModels().filter((m) => m.family === family);
}

export function getModelById(id: string): AIModelConfig | undefined {
  return getAllModels().find((m) => m.id === id);
}

export function getProviderByName(name: string): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((p) => p.name === name);
}

// Vérification de doublons
export function validateNoDuplicates(): { hasDuplicates: boolean; duplicates: string[] } {
  const ids = getAllModels().map((m) => m.id);
  const seen = new Set<string>();
  const duplicates: string[] = [];
  ids.forEach((id) => {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  });
  return { hasDuplicates: duplicates.length > 0, duplicates };
}

export const AI_FAMILIES = [
  "lovable", "hcnsec", "openai", "claude", "gemini", "deepseek",
  "qwen", "llama", "glm", "kimi",
] as const;

export const AI_CAPABILITIES = [
  "chat", "reasoning", "coding", "text_generation", "multimodal",
  "vision", "multilingual", "long_context", "image_generation",
  "audio", "video", "embeddings", "rerank", "realtime",
  "audio_transcription", "audio_translation", "text_to_speech",
] as const;
