
import { useState, useEffect } from "react";
import { Bot, Sparkles, Moon, Heart, Zap, Brain, Flame, Globe, Layers, Diamond, Crown, Loader2 } from "lucide-react";
import { cn } from "@/utils";
import type { AIModelConfig } from "@/lib/ai-config";

export type AIModel = "mimi" | "dark" | "lola" | string;
export type LolaMode = "copain" | "copine";

interface AIModelSelectorV2Props {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  lolaMode?: LolaMode;
  onSelectLolaMode?: (mode: LolaMode) => void;
}

const FAMILY_ICONS: Record<string, React.ElementType> = {
  hcnsec: Zap,
  openai: Sparkles,
  claude: Brain,
  gemini: Diamond,
  deepseek: Flame,
  qwen: Globe,
  llama: Layers,
  glm: Crown,
  kimi: Bot,
};

const FAMILY_COLORS: Record<string, string> = {
  hcnsec: "from-yellow-500 to-orange-500",
  openai: "from-green-500 to-emerald-500",
  claude: "from-orange-500 to-amber-500",
  gemini: "from-blue-500 to-cyan-500",
  deepseek: "from-purple-500 to-violet-500",
  qwen: "from-rose-500 to-pink-500",
  llama: "from-indigo-500 to-blue-500",
  glm: "from-teal-500 to-emerald-500",
  kimi: "from-red-500 to-rose-500",
};

export function AIModelSelectorV2({
  selectedModel,
  onSelectModel,
  lolaMode,
  onSelectLolaMode,
}: AIModelSelectorV2Props) {
  const [showLolaChoice, setShowLolaChoice] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AIModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les modèles depuis l'API serveur (incluant HCNSEC dynamique)
  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const res = await fetch("/api/ai/models");
        const json = await res.json();
        if (json.success) {
          setAvailableModels(json.data.filter((m: AIModelConfig) => m.type === "llm"));
        } else {
          setError(json.error || "Erreur de chargement");
        }
      } catch (err) {
        setError("Impossible de contacter le serveur");
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  const messaguxPersonalities = [
    { id: "mimi", name: "Mimi AI", icon: Sparkles, color: "from-pink-500 to-rose-500", desc: "Assistant polyvalent", family: "messagux" },
    { id: "dark", name: "Dark AI", icon: Moon, color: "from-slate-600 to-slate-800", desc: "Expert technique", family: "messagux" },
    { id: "lola", name: "Lola AI", icon: Heart, color: "from-purple-500 to-pink-500", desc: "Compagnon personnel", family: "messagux" },
  ];

  const handleModelSelect = (modelId: string, isLola: boolean = false) => {
    if (isLola) {
      setShowLolaChoice(true);
    } else {
      onSelectModel(modelId);
    }
  };

  const handleLolaMode = (mode: LolaMode) => {
    onSelectModel("lola");
    onSelectLolaMode?.(mode);
    setShowLolaChoice(false);
  };

  if (showLolaChoice) {
    return (
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-bold text-white text-center">Choisir votre compagnon</h3>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleLolaMode("copain")}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400 transition-all flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-semibold">Copain</span>
            <span className="text-xs text-slate-400">Personnalité masculine</span>
          </button>
          <button onClick={() => handleLolaMode("copine")}
            className="p-6 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 hover:border-pink-400 transition-all flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-semibold">Copine</span>
            <span className="text-xs text-slate-400">Personnalité féminine</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Personnalités Messagux */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Personnalités Messagux</h3>
        <div className="space-y-1">
          {messaguxPersonalities.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedModel === p.id;
            return (
              <button key={p.id} onClick={() => handleModelSelect(p.id, p.id === "lola")}
                className={cn("w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                  isSelected ? "bg-white/10 border border-white/20" : "hover:bg-white/5 border border-transparent")}>
                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", p.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </div>
                {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Modèles externes */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modèles externes</h3>

        {loading ? (
          <div className="flex items-center justify-center py-4 gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Découverte des modèles...</span>
          </div>
        ) : error ? (
          <div className="text-center py-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Filtre par famille */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              <button onClick={() => setSelectedFamily(null)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  !selectedFamily ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}>
                Tous
              </button>
              {Array.from(new Set(availableModels.map((m) => m.family))).map((family) => {
                const Icon = FAMILY_ICONS[family] || Bot;
                return (
                  <button key={family} onClick={() => setSelectedFamily(family)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                      selectedFamily === family ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}>
                    <Icon className="w-3 h-3" />
                    {family.charAt(0).toUpperCase() + family.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Liste des modèles */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {availableModels
                .filter((m) => !selectedFamily || m.family === selectedFamily)
                .map((model) => {
                  const isSelected = selectedModel === model.id;
                  const Icon = FAMILY_ICONS[model.family] || Bot;
                  const colorClass = FAMILY_COLORS[model.family] || "from-slate-500 to-slate-600";

                  return (
                    <button key={model.id} onClick={() => onSelectModel(model.id)}
                      className={cn("w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left",
                        isSelected ? "bg-white/10 border border-white/20" : "hover:bg-white/5 border border-transparent")}>
                      <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0", colorClass)}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{model.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{model.provider}</span>
                          <span>•</span>
                          <span>{model.contextWindow ? `${(model.contextWindow / 1000).toFixed(0)}K ctx` : "N/A"}</span>
                          {model.supportsVision && <span className="text-blue-400">👁</span>}
                          {model.family === "hcnsec" && <span className="text-yellow-400">⚡</span>}
                        </div>
                      </div>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />}
                    </button>
                  );
                })}

              {availableModels.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-500">Aucun modèle externe configuré</p>
                  <p className="text-[10px] text-slate-600 mt-1">Ajoutez vos clés API dans .env.local</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
