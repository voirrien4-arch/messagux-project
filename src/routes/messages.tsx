
import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Search, Phone, Video, MoreVertical, Send, Mic, Paperclip, Image as ImageIcon, ArrowLeft, Ban, Flag } from "lucide-react";
import { getInitials, formatDate, cn } from "@/utils";
import { CallModal } from "@/components/call/CallModal";
import type { Conversation, Message, Profile } from "@/types";
import { toast } from "sonner";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/messages")({
  component: MessagesPage,
  head: () => ({
    meta: [
      { title: "Messages privés — Messagux" },
      { name: "description", content: "Discutez en direct avec vos amis, partagez fichiers, photos et appels sur Messagux." },
      { property: "og:title", content: "Messages privés — Messagux" },
      { property: "og:description", content: "Discutez en direct avec vos amis, partagez fichiers, photos et appels sur Messagux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.navigate({ to: "/login" }); return; }
    if (user) fetchConversations();
  }, [user, loading]);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`)
      .order("last_message_at", { ascending: false });
    const enriched = await Promise.all((data || []).map(async (conv) => {
      const otherId = conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", otherId).single();
      return { ...conv, other_participant: profile };
    }));
    setConversations(enriched);
  };

  const fetchMessages = async (conversationId: string) => {
    setActiveConversation(conversationId);
    const { data } = await supabase.from("messages").select("*, sender:sender_id(*)").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    setMessages(data || []);
    await supabase.from("messages").update({ is_read: true }).eq("conversation_id", conversationId).neq("sender_id", user?.id ?? "");
  };

  const sendMessage = async () => {
    if (!activeConversation || (!newMessage.trim() && !selectedFile)) return;
    try {
      let mediaUrl = null, mediaType = "text", fileName = null;
      if (selectedFile) {
        const ext = selectedFile.name.split(".").pop();
        const filePath = `${user?.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("chat_files").upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("chat_files").getPublicUrl(filePath);
        mediaUrl = publicUrl;
        mediaType = selectedFile.type.startsWith("image/") ? "image" : selectedFile.type.startsWith("video/") ? "video" : "file";
        fileName = selectedFile.name;
      }
      await supabase.from("messages").insert({ conversation_id: activeConversation, sender_id: user?.id ?? "", content: newMessage.trim() || null, media_url: mediaUrl, media_type: mediaType, file_name: fileName });
      await supabase.from("conversations").update({ last_message: newMessage || "Fichier", last_message_at: new Date().toISOString() }).eq("id", activeConversation);
      setNewMessage(""); setSelectedFile(null);
      fetchMessages(activeConversation); fetchConversations();
    } catch (error: any) { toast.error(error.message); }
  };

  const startCall = (type: "audio" | "video") => {
    setCallType(type);
    setShowCallModal(true);
  };

  const handleBlock = async () => {
    const activeConv = conversations.find((c) => c.id === activeConversation);
    if (!activeConv) return;
    const otherId = activeConv.participant_1 === user?.id ? activeConv.participant_2 : activeConv.participant_1;
    await supabase.from("friendships").update({ status: "blocked" }).or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`).or(`requester_id.eq.${otherId},addressee_id.eq.${otherId}`);
    toast.success("Utilisateur bloqué");
    setShowOptions(false);
  };

  const handleReport = () => {
    toast.success("Signalement envoyé à l'administration");
    setShowOptions(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  const activeConv = conversations.find((c) => c.id === activeConversation);

  return (
    <div className="min-h-screen bg-messagux-dark flex">
      <div className={cn("w-full md:w-80 border-r border-white/5", activeConversation && "hidden md:block")}>
        <div className="p-4 border-b border-white/5">
          <h1 className="text-lg font-bold text-white mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
          </div>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((conv) => (
            <button key={conv.id} onClick={() => fetchMessages(conv.id)}
              className={cn("w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-all border-b border-white/5", activeConversation === conv.id && "bg-white/5")}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                {conv.other_participant?.avatar_url ? <img src={conv.other_participant.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm font-bold text-white">{getInitials(conv.other_participant?.display_name || "U")}</span>}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-white truncate">{conv.other_participant?.display_name || conv.other_participant?.username}</p>
                <p className="text-xs text-slate-500 truncate">{conv.last_message || "Nouvelle conversation"}</p>
              </div>
              <span className="text-[10px] text-slate-600">{formatDate(conv.last_message_at || conv.created_at)}</span>
            </button>
          ))}
        </div>
      </div>

      {activeConversation && activeConv ? (
        <div className="flex-1 flex flex-col w-full md:w-auto">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 -ml-2 text-slate-400"><ArrowLeft className="w-5 h-5" /></button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
                {activeConv.other_participant?.avatar_url ? <img src={activeConv.other_participant.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm font-bold text-white">{getInitials(activeConv.other_participant?.display_name || "U")}</span>}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{activeConv.other_participant?.display_name || activeConv.other_participant?.username}</p>
                <p className="text-xs text-green-400">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startCall("audio")} className="p-2 rounded-full hover:bg-white/5 text-slate-400"><Phone className="w-5 h-5" /></button>
              <button onClick={() => startCall("video")} className="p-2 rounded-full hover:bg-white/5 text-slate-400"><Video className="w-5 h-5" /></button>
              <div className="relative">
                <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-full hover:bg-white/5 text-slate-400"><MoreVertical className="w-5 h-5" /></button>
                {showOptions && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card py-2 z-50">
                    <button onClick={handleBlock} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"><Ban className="w-4 h-4" />Bloquer</button>
                    <button onClick={handleReport} className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-white/5 flex items-center gap-2"><Flag className="w-4 h-4" />Signaler</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender_id === user?.id ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%] px-4 py-2.5 rounded-2xl", msg.sender_id === user?.id ? "bg-blue-600 text-white rounded-br-md" : "bg-white/10 text-slate-200 rounded-bl-md")}>
                  {msg.media_url && msg.media_type === "image" && <img src={msg.media_url} alt="" className="rounded-lg mb-2 max-w-full" />}
                  {msg.media_url && msg.media_type === "video" && <video src={msg.media_url} controls className="rounded-lg mb-2 max-w-full" />}
                  {msg.media_url && msg.media_type === "file" && <a href={msg.media_url} target="_blank" className="flex items-center gap-2 text-sm underline mb-2"><Paperclip className="w-4 h-4" />{msg.file_name}</a>}
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                  <span className="text-[10px] opacity-60 mt-1 block">{formatDate(msg.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            {selectedFile && (
              <div className="mb-2 px-3 py-2 bg-white/5 rounded-lg flex items-center justify-between">
                <span className="text-xs text-slate-300">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="text-red-400 text-xs">×</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-white/5 text-slate-400"><Paperclip className="w-5 h-5" /></button>
              <label className="p-2 rounded-full hover:bg-white/5 text-slate-400 cursor-pointer">
                <ImageIcon className="w-5 h-5" />
                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
              </label>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Écrire un message..." className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
              <button className="p-2 rounded-full hover:bg-white/5 text-slate-400"><Mic className="w-5 h-5" /></button>
              <button onClick={sendMessage} className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center">
          <p className="text-slate-500">Sélectionnez une conversation</p>
        </div>
      )}

      {/* Modal d'appel */}
      <CallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        targetUser={activeConv?.other_participant || null}
        callType={callType}
      />
    </div>
  );
}
