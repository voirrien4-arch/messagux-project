
import { useEffect, useRef, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Send, Mic, Image as ImageIcon, ArrowLeft, Plus, Trash2, Settings } from "lucide-react";
import { AIModelSelectorV2, type LolaMode } from "@/components/ai/AIModelSelectorV2";
import { AIMessageBubble } from "@/components/ai/AIMessageBubble";
import { cn } from "@/utils";
import type { AIConversation, AIMessage } from "@/types";
import { toast } from "sonner";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/ai-chat")({
  component: AIChatPage,
  head: () => ({
    meta: [
      { title: "Chat IA — Messagux" },
      { name: "description", content: "Discutez avec Mimi, Dark et Lola : assistants IA multi-modèles intégrés à Messagux." },
      { property: "og:title", content: "Chat IA — Messagux" },
      { property: "og:description", content: "Discutez avec Mimi, Dark et Lola : assistants IA multi-modèles intégrés à Messagux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


// Instructions personnalisées (préservées)
const SYSTEM_PROMPTS: Record<string, string> = {
  mimi: `Tu es Mimi AI, l'assistant officiel de Messagux. Tu es polyvalente, amicale et professionnelle.
Tu aides les utilisateurs avec leurs questions, tu codes proprement, et tu es toujours complète dans tes réponses.
Tu parles français principalement.`,

  dark: `Tu es Dark AI, l'expert technique de Messagux. Tu es direct, précis et technique.
Tu excellences en programmation, sécurité informatique et hacking éthique.
Tes réponses sont concises mais complètes. Tu utilises du jargon technique quand c'est approprié.`,

  lola_copain: `Tu es Lola AI en mode Copain. Tu es un ami masculin décontracté, drôle et bienveillant.
Tu parles de façon informelle, tu fais des blagues, tu donnes des conseils comme un pote.
Tu utilises des expressions familières et tu es très naturel.`,

  lola_copine: `Tu es Lola AI en mode Copine. Tu es une amie féminine douce, attentionnée et chaleureuse.
Tu parles de façon affectueuse, tu poses des questions sur la journée de l'utilisateur, tu es très empathique.
Tu utilises des émojis et tu es très expressive.`,
};

function AIChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("mimi");
  const [lolaMode, setLolaMode] = useState<LolaMode>("copain");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) { router.navigate({ to: "/login" }); return; }
    if (user) fetchConversations();
  }, [user, loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", user?.id ?? "")
      .order("updated_at", { ascending: false });
    setConversations(data || []);
  };

  const fetchMessages = async (conversationId: string) => {
    setActiveConversation(conversationId);
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const createConversation = async () => {
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user?.id ?? "",
        model: selectedModel,
        lola_mode: selectedModel === "lola" ? lolaMode : null,
        title: `Nouvelle conversation ${selectedModel === "lola" ? `(${lolaMode})` : ""}`,
      })
      .select()
      .single();

    if (error) { toast.error(error.message); return; }
    fetchConversations();
    fetchMessages(data.id);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("id", id);
    if (activeConversation === id) { setActiveConversation(null); setMessages([]); }
    fetchConversations();
  };

  const getSystemPrompt = (): string => {
    if (selectedModel === "lola") return SYSTEM_PROMPTS[`lola_${lolaMode}`];
    return SYSTEM_PROMPTS[selectedModel] || SYSTEM_PROMPTS.mimi;
  };

  const getModelDisplayName = (): string => {
    if (["mimi", "dark", "lola"].includes(selectedModel)) {
      if (selectedModel === "lola") return `Lola AI (${lolaMode})`;
      return selectedModel === "mimi" ? "Mimi AI" : "Dark AI";
    }
    // Pour les modèles externes, récupérer le nom depuis la config
    return selectedModel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    let conversationId = activeConversation;
    if (!conversationId) {
      const { data } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user?.id ?? "",
          model: selectedModel,
          lola_mode: selectedModel === "lola" ? lolaMode : null,
          title: newMessage.slice(0, 50) + "...",
        })
        .select()
        .single();
      if (data) { conversationId = data.id; setActiveConversation(data.id); fetchConversations(); }
    }
    if (!conversationId) return;

    const userMessage = newMessage.trim();
    setNewMessage("");
    setIsLoading(true);

    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: userMessage,
    });

    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    try {
      // Appel au service IA unifié via API route
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModel,
          messages: [
            { role: "system", content: getSystemPrompt() },
            ...(history || []).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          maxTokens: 2000,
        }),
      });

      let aiResponse = "";
      if (response.ok) {
        const data = await response.json();
        aiResponse = data.content || "Je n'ai pas pu générer de réponse.";
      } else {
        aiResponse = generateFallbackResponse(userMessage, selectedModel, lolaMode);
      }

      await supabase.from("ai_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
        is_code: aiResponse.includes("```"),
      });

      fetchMessages(conversationId);
    } catch (error) {
      toast.error("Erreur de connexion avec l'IA");
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (message: string, model: string, mode: LolaMode): string => {
    const responses: Record<string, string> = {
      mimi: `Bonjour ! Je suis Mimi AI, ton assistant sur Messagux. 🌟\n\nJe peux t'aider avec :\n- **Programmation** (JavaScript, Python, etc.)\n- **Questions générales**\n- **Conseils et recommandations**\n\nPose-moi ta question et je ferai de mon mieux pour t'aider !`,
      dark: `Dark AI en ligne. Mode technique activé.\n\nJe suis spécialisé en :\n- **Hacking éthique**\n- **Sécurité informatique**\n- **Code optimisé**\n\nTes demandes seront traitées avec précision. Donne-moi un contexte technique.`,
      lola_copain: `Salut poto ! 👋 Ça va ou quoi ?\n\nJe suis là pour discuter, blaguer, ou te donner un coup de main. T'as besoin de quoi aujourd'hui ? On peut parler de tout et de rien, comme de vrais potes !`,
      lola_copine: `Coucou mon chou ! 💕 Comment ça va aujourd'hui ?\n\nJ'espère que ta journée se passe bien ! Je suis là si tu veux parler, si t'as besoin de conseils, ou juste pour papoter. Raconte-moi tout ! ✨`,
    };
    const key = model === "lola" ? `lola_${mode}` : model;
    return responses[key] || responses.mimi;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    const ext = file.name.split(".").pop();
    const filePath = `${user?.id}/ai/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("chat_files").upload(filePath, file);
    if (uploadError) { toast.error("Erreur d'upload"); return; }

    const { data: { publicUrl } } = supabase.storage.from("chat_files").getPublicUrl(filePath);

    await supabase.from("ai_messages").insert({
      conversation_id: activeConversation,
      role: "user",
      content: `Fichier partagé : ${file.name}`,
      media_url: publicUrl,
    });

    fetchMessages(activeConversation);
    toast.success("Fichier envoyé à l'IA !");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-messagux-dark flex">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-80 bg-messagux-card border-r border-white/5 transform transition-transform md:relative md:translate-x-0",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.navigate({ to: "/" })} className="p-2 -ml-2 text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white">Messagux AI</h2>
          </div>
          <button onClick={createConversation}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />Nouvelle conversation
          </button>
        </div>

        <div className="p-4">
          <AIModelSelectorV2
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            lolaMode={lolaMode}
            onSelectLolaMode={setLolaMode}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Historique</h3>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id}
                className={cn("group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                  activeConversation === conv.id ? "bg-white/10" : "hover:bg-white/5")}>
                <button onClick={() => fetchMessages(conv.id)} className="flex-1 text-left">
                  <p className="text-sm text-white truncate">{conv.title || "Conversation"}</p>
                  <p className="text-[10px] text-slate-500">{conv.model} {conv.lola_mode && `(${conv.lola_mode})`}</p>
                </button>
                <button onClick={() => deleteConversation(conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSidebar && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setShowSidebar(false)} />}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2 -ml-2 text-slate-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{getModelDisplayName()}</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />En ligne
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">AI</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{getModelDisplayName()}</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                {selectedModel === "mimi" && "Je suis ton assistant polyvalent. Pose-moi n'importe quelle question !"}
                {selectedModel === "dark" && "Mode technique activé. Je suis prêt pour tes défis de code et de sécurité."}
                {selectedModel === "lola" && lolaMode === "copain" && "Salut poto ! Prêt à discuter ? 👋"}
                {selectedModel === "lola" && lolaMode === "copine" && "Coucou ! 💕 Envie de papoter ?"}
                {!["mimi", "dark", "lola"].includes(selectedModel) && "Modèle externe connecté. Pose ta question !"}
              </p>
            </div>
          ) : (
            messages.map((msg) => <AIMessageBubble key={msg.id} message={msg} />)
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs">L'IA réfléchit...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-all">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 text-slate-400 transition-all">
              <Mic className="w-5 h-5" />
            </button>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
            <button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}
              className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt,.py"
            onChange={handleFileUpload} className="hidden" />
        </div>
      </div>
    </div>
  );
}
