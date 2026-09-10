

import {
  AI_PROVIDERS,
  getEnabledProviders,
  getModelById,
  type AIModelConfig,
  type AIProviderConfig,
} from "@/lib/ai-config";

// ============================================
// MESSAGUX - Service IA Unifié
// Support multi-protocoles : OpenAI, Anthropic, Gemini
// HCNSEC intégré via protocole openai_compatible
// ============================================

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  modelId: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finish_reason?: string;
}

// ============================================
// PROTOCOLE : OpenAI Chat Completions
// Compatible avec : OpenAI, DeepSeek, Qwen, Llama, GLM, Kimi, HCNSEC
// ============================================
async function callOpenAIChat(
  provider: AIProviderConfig,
  model: AIModelConfig,
  options: ChatOptions
): Promise<ChatResponse> {
  const apiKey = process.env[provider.envKey];
  if (!apiKey) throw new Error(`Clé API manquante pour ${provider.name}`);

  const response = await fetch(`${model.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.defaultModel,
      messages: options.messages,
      temperature: options.temperature ?? model.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? model.maxTokens,
      stream: options.stream ?? false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur ${provider.name}: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.choices?.[0]?.message?.content || "",
    usage: data.usage,
    model: data.model || model.defaultModel,
    finish_reason: data.choices?.[0]?.finish_reason,
  };
}

// ============================================
// PROTOCOLE : OpenAI Responses (nouveau)
// Compatible avec : OpenAI (o1, etc.)
// ============================================
async function callOpenAIResponses(
  provider: AIProviderConfig,
  model: AIModelConfig,
  options: ChatOptions
): Promise<ChatResponse> {
  const apiKey = process.env[provider.envKey];
  if (!apiKey) throw new Error(`Clé API manquante pour ${provider.name}`);

  const response = await fetch(`${model.baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.defaultModel,
      input: options.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: options.maxTokens ?? model.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur ${provider.name} Responses: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.output?.[0]?.content?.[0]?.text || "",
    model: data.model || model.defaultModel,
  };
}

// ============================================
// PROTOCOLE : Anthropic Messages
// Compatible avec : Claude
// ============================================
async function callAnthropicMessages(
  provider: AIProviderConfig,
  model: AIModelConfig,
  options: ChatOptions
): Promise<ChatResponse> {
  const apiKey = process.env[provider.envKey];
  if (!apiKey) throw new Error(`Clé API manquante pour ${provider.name}`);

  const systemMessage = options.messages.find((m) => m.role === "system");
  const conversationMessages = options.messages.filter((m) => m.role !== "system");

  const response = await fetch(`${model.baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model.defaultModel,
      max_tokens: options.maxTokens ?? model.maxTokens,
      temperature: options.temperature ?? model.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: conversationMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      stream: options.stream ?? false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur ${provider.name}: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.content?.[0]?.text || "",
    usage: data.usage,
    model: data.model || model.defaultModel,
    finish_reason: data.stop_reason,
  };
}

// ============================================
// PROTOCOLE : Google Gemini
// Compatible avec : Gemini
// ============================================
async function callGoogleGemini(
  provider: AIProviderConfig,
  model: AIModelConfig,
  options: ChatOptions
): Promise<ChatResponse> {
  const apiKey = process.env[provider.envKey];
  if (!apiKey) throw new Error(`Clé API manquante pour ${provider.name}`);

  const systemMessage = options.messages.find((m) => m.role === "system");
  const conversationMessages = options.messages.filter((m) => m.role !== "system");

  const contents = conversationMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `${model.baseUrl}/models/${model.defaultModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemMessage
          ? { parts: [{ text: systemMessage.content }] }
          : undefined,
        generationConfig: {
          temperature: options.temperature ?? model.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? model.maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur ${provider.name}: ${error}`);
  }

  const data = await response.json();

  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
    usage: data.usageMetadata,
    model: model.defaultModel,
    finish_reason: data.candidates?.[0]?.finishReason,
  };
}

// ============================================
// ROUTEUR UNIFIÉ
// ============================================

export async function sendChatMessage(options: ChatOptions): Promise<ChatResponse> {
  const model = getModelById(options.modelId);
  if (!model) throw new Error(`Modèle ${options.modelId} non trouvé`);

  const provider = AI_PROVIDERS.find((p) =>
    p.models.some((m) => m.id === options.modelId)
  );
  if (!provider) throw new Error(`Fournisseur pour ${options.modelId} non trouvé`);

  const apiKey = process.env[provider.envKey];
  if (!apiKey) {
    throw new Error(
      `Clé API ${provider.envKey} non configurée. Ajoutez-la dans votre fichier .env.local`
    );
  }

  switch (model.protocol) {
    case "openai_chat":
      return callOpenAIChat(provider, model, options);
    case "openai_responses":
      return callOpenAIResponses(provider, model, options);
    case "anthropic_messages":
      return callAnthropicMessages(provider, model, options);
    case "google_gemini":
      return callGoogleGemini(provider, model, options);
    case "openai_compatible":
      return callOpenAIChat(provider, model, options);
    default:
      throw new Error(`Protocole ${model.protocol} non supporté`);
  }
}

// ============================================
// STREAMING SSE (Server-Sent Events)
// ============================================

export async function* streamChatMessage(
  options: ChatOptions
): AsyncGenerator<string, ChatResponse, unknown> {
  const model = getModelById(options.modelId);
  if (!model) throw new Error(`Modèle ${options.modelId} non trouvé`);

  const provider = AI_PROVIDERS.find((p) =>
    p.models.some((m) => m.id === options.modelId)
  );
  if (!provider) throw new Error(`Fournisseur pour ${options.modelId} non trouvé`);

  const apiKey = process.env[provider.envKey];
  if (!apiKey) throw new Error(`Clé API ${provider.envKey} non configurée`);

  if (!model.supportsStreaming) {
    const response = await sendChatMessage(options);
    yield response.content;
    return response;
  }

  const response = await fetch(`${model.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.defaultModel,
      messages: options.messages,
      temperature: options.temperature ?? model.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? model.maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur streaming ${provider.name}: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Impossible de lire le stream");

  const decoder = new TextDecoder();
  let fullContent = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              fullContent += content;
              yield content;
            }
          } catch {
            // Ignorer les lignes malformées
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content: fullContent,
    model: model.defaultModel,
  };
}

// ============================================
// DÉCOUVERTE DES MODÈLES DISPONIBLES
// ============================================

export async function discoverAvailableModels(): Promise<AIModelConfig[]> {
  const available: AIModelConfig[] = [];

  for (const provider of AI_PROVIDERS) {
    const apiKey = process.env[provider.envKey];
    if (!apiKey) continue;

    // Fournisseurs statiques (liste prédéfinie)
    if (!provider.isDynamic) {
      for (const model of provider.models) {
        try {
          const testUrl =
            model.protocol === "google_gemini"
              ? `${model.baseUrl}/models?key=${apiKey}`
              : `${model.baseUrl}/models`;

          const headers: Record<string, string> = {
            Authorization: `Bearer ${apiKey}`,
          };

          if (model.protocol === "anthropic_messages") {
            headers["x-api-key"] = apiKey;
            headers["anthropic-version"] = "2023-06-01";
          }

          const response = await fetch(testUrl, { method: "GET", headers });
          if (response.ok) available.push(model);
        } catch {
          // Modèle non disponible
        }
      }
      continue;
    }

    // Fournisseurs dynamiques (ex: HCNSEC)
    if (provider.isDynamic) {
      const dynamicModels = await discoverDynamicModels(provider);
      available.push(...dynamicModels);
    }
  }

  return available;
}

// ============================================
// DÉCOUVERTE DYNAMIQUE DES MODÈLES HCNSEC
// GET https://api.hcnsec.cn/v1/models
// ============================================

export async function discoverDynamicModels(
  provider: AIProviderConfig
): Promise<AIModelConfig[]> {
  const apiKey = process.env[provider.envKey];
  if (!apiKey) return [];

  try {
    const response = await fetch(`${provider.baseUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[HCNSEC] Erreur découverte modèles (${response.status}):`, errorText);
      return [];
    }

    const data = await response.json();

    // Format OpenAI-compatible : { data: [{ id: "model-name", ... }] }
    const modelsData = data.data || data.models || [];

    if (!Array.isArray(modelsData) || modelsData.length === 0) {
      console.warn("[HCNSEC] Aucun modèle retourné par l'API");
      return [];
    }

    const discovered: AIModelConfig[] = modelsData
      .filter((m: any) => m.id) // S'assurer que l'ID existe
      .map((m: any, index: number) => ({
        id: `hcnsec-${m.id}`, // Préfixe unique pour éviter les conflits
        name: m.id, // Nom affiché = ID réel du modèle
        provider: provider.name,
        family: "hcnsec",
        type: inferModelType(m.id),
        capabilities: inferCapabilities(m.id),
        protocol: "openai_compatible" as const,
        baseUrl: provider.baseUrl,
        defaultModel: m.id, // ID réel envoyé à l'API
        maxTokens: m.context_window || 4096,
        supportsStreaming: true,
        supportsVision: m.id.toLowerCase().includes("vision") || m.id.toLowerCase().includes("vl"),
        supportsFunctionCalling: m.id.toLowerCase().includes("function") || false,
        contextWindow: m.context_window || 4096,
      }));

    console.log(`[HCNSEC] ${discovered.length} modèles découverts:`, discovered.map((d) => d.name));
    return discovered;
  } catch (error) {
    console.error("[HCNSEC] Erreur lors de la découverte des modèles:", error);
    return [];
  }
}

// ============================================
// INFÉRENCE DES CAPACITÉS DEPUIS L'ID DU MODÈLE
// ============================================

function inferModelType(modelId: string): AIModelConfig["type"] {
  const id = modelId.toLowerCase();
  if (id.includes("embedding")) return "embedding";
  if (id.includes("image") || id.includes("dall")) return "image";
  if (id.includes("audio") || id.includes("whisper") || id.includes("tts")) return "audio";
  if (id.includes("realtime")) return "realtime";
  return "llm";
}

function inferCapabilities(modelId: string): string[] {
  const id = modelId.toLowerCase();
  const caps: string[] = ["chat", "text_generation"];

  if (id.includes("reason") || id.includes("o1") || id.includes("k1")) caps.push("reasoning");
  if (id.includes("code") || id.includes("coder")) caps.push("coding");
  if (id.includes("vision") || id.includes("vl") || id.includes("multimodal")) {
    caps.push("vision", "multimodal");
  }
  if (id.includes("embedding")) return ["embeddings"];
  if (id.includes("image")) return ["image_generation"];

  return caps;
}

// ============================================
// TRACKING USAGE & COSTS
// ============================================

interface UsageRecord {
  userId: string;
  modelId: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  timestamp: string;
}

const COST_RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.005, output: 0.015 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "o1-preview": { input: 0.015, output: 0.06 },
  "o1-mini": { input: 0.003, output: 0.012 },
  "claude-3-5-sonnet": { input: 0.003, output: 0.015 },
  "claude-3-5-haiku": { input: 0.0008, output: 0.004 },
  "claude-3-opus": { input: 0.015, output: 0.075 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
  "gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
  "deepseek-chat": { input: 0.00014, output: 0.00028 },
  "deepseek-reasoner": { input: 0.00055, output: 0.00219 },
  "qwen-max": { input: 0.002, output: 0.006 },
  "qwen-plus": { input: 0.0008, output: 0.002 },
  "qwen-turbo": { input: 0.0003, output: 0.0006 },
  "llama-3.1-405b": { input: 0.0035, output: 0.0035 },
  "llama-3.1-70b": { input: 0.00088, output: 0.00088 },
  "llama-3.1-8b": { input: 0.00018, output: 0.00018 },
  "glm-4-plus": { input: 0.001, output: 0.002 },
  "glm-4": { input: 0.0005, output: 0.001 },
  "kimi-k1.5": { input: 0.003, output: 0.012 },
  "kimi-latest": { input: 0.002, output: 0.008 },
};

export function calculateCost(modelId: string, promptTokens: number, completionTokens: number): number {
  const rates = COST_RATES[modelId] || { input: 0.001, output: 0.002 };
  return (promptTokens / 1000) * rates.input + (completionTokens / 1000) * rates.output;
}

export async function logUsage(record: UsageRecord): Promise<void> {
  console.log("[AI Usage]", record);
}
