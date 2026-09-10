
import { useState } from "react";
import { Bot, Sparkles, Moon, Heart, User } from "lucide-react";
import { cn } from "@/utils";

export type AIModel = "mimi" | "dark" | "lola";
export type LolaMode = "copain" | "copine";

interface AIModelSelectorProps {
  selectedModel: AIModel;
  onSelectModel: (model: AIModel) => void;
  lolaMode?: LolaMode;
  onSelectLolaMode?: (mode: LolaMode) => void;
}

const models = [
  { id: "mimi" as AIModel, name: "Mimi AI", icon: Sparkles, color: "from-pink-500 to-rose-500", desc: "Assistant polyvalent" },
  { id: "dark" as AIModel, name: "Dark AI", icon: Moon, color: "from-slate-600 to-slate-800", desc: "Expert technique" },
  { id: "lola" as AIModel, name: "Lola AI", icon: Heart, color: "from-purple-500 to-pink-500", desc: "Compagnon personnel" },
];

export function AIModelSelector({ selectedModel, onSelectModel, lolaMode, onSelectLolaMode }: AIModelSelectorProps) {
  const [showLolaChoice, setShowLolaChoice] = useState(false);

  const handleModelSelect = (model: AIModel) => {
    if (model === "lola") {
      setShowLolaChoice(true);
    } else {
      onSelectModel(model);
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
          <button
            onClick={() => handleLolaMode("copain")}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400 transition-all flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-semibold">Copain</span>
            <span className="text-xs text-slate-400">Personnalité masculine</span>
          </button>
          <button
            onClick={() => handleLolaMode("copine")}
            className="p-6 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 hover:border-pink-400 transition-all flex flex-col items-center gap-3"
          >
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
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Modèles IA</h3>
      <div className="space-y-2">
        {models.map((model) => {
          const Icon = model.icon;
          const isSelected = selectedModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className={cn(
                "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                isSelected
                  ? "bg-white/10 border border-white/20"
                  : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", model.color)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{model.name}</p>
                <p className="text-xs text-slate-500">{model.desc}</p>
              </div>
              {isSelected && (
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
