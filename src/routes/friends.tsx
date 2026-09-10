
import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, UserCheck, UserX, MessageCircle } from "lucide-react";
import { getInitials, cn } from "@/utils";
import type { Profile, Friendship } from "@/types";
import { toast } from "sonner";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/friends")({
  component: FriendsPage,
  head: () => ({
    meta: [
      { title: "Amis & suggestions — Messagux" },
      { name: "description", content: "Trouvez des amis, gérez vos demandes et démarrez des conversations sur Messagux." },
      { property: "og:title", content: "Amis & suggestions — Messagux" },
      { property: "og:description", content: "Trouvez des amis, gérez vos demandes et démarrez des conversations sur Messagux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function FriendsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"suggestions" | "friends" | "requests">("suggestions");
  const [friends, setFriends] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<(Friendship & { requester: Profile })[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.navigate({ to: "/login" }); return; }
    if (user) fetchData();
  }, [user, loading, activeTab]);

  const fetchData = async () => {
    if (activeTab === "friends") {
      const { data } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`)
        .eq("status", "accepted");
      const friendIds = (data || []).map((f) => f.requester_id === user?.id ? f.addressee_id : f.requester_id);
      if (friendIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("*").in("id", friendIds);
        setFriends(profiles || []);
      } else setFriends([]);
    } else if (activeTab === "requests") {
      const { data } = await supabase
        .from("friendships")
        .select("*, requester:requester_id(*)")
        .eq("addressee_id", user?.id ?? "")
        .eq("status", "pending");
      setRequests(data || []);
    } else {
      const { data: myFriends } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`)
        .eq("status", "accepted");
      const myFriendIds = (myFriends || []).map((f) => f.requester_id === user?.id ? f.addressee_id : f.requester_id);
      const { data: allProfiles } = await supabase.from("profiles").select("*").neq("id", user?.id ?? "").limit(20);
      const suggested = (allProfiles || []).filter((p) => !myFriendIds.includes(p.id)).slice(0, 10);
      setSuggestions(suggested);
    }
  };

  const handleAddFriend = async (targetId: string) => {
    try {
      const { error } = await supabase.from("friendships").insert({ requester_id: user?.id ?? "", addressee_id: targetId, status: "pending" });
      if (error) throw error;
      toast.success("Demande envoyée !");
      fetchData();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", requestId);
      toast.success("Demande acceptée !"); fetchData();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleReject = async (requestId: string) => {
    try { await supabase.from("friendships").delete().eq("id", requestId); fetchData(); }
    catch (error: any) { toast.error(error.message); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-messagux-dark">
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white mb-3">Amis</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Rechercher des amis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-3 flex gap-2">
        {(["suggestions", "friends", "requests"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", activeTab === tab ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}>
            {tab === "suggestions" ? "Suggestions" : tab === "friends" ? "Amis" : "Demandes"}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 pb-6 space-y-3">
        {activeTab === "suggestions" && suggestions.map((profile) => (
          <div key={profile.id} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm font-bold text-white">{getInitials(profile.display_name || "U")}</span>}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{profile.display_name || profile.username}</p>
                <p className="text-xs text-slate-500">@{profile.username}</p>
              </div>
            </div>
            <button onClick={() => handleAddFriend(profile.id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />Ajouter
            </button>
          </div>
        ))}

        {activeTab === "friends" && friends.map((profile) => (
          <div key={profile.id} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm font-bold text-white">{getInitials(profile.display_name || "U")}</span>}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{profile.display_name || profile.username}</p>
                <p className="text-xs text-slate-500">Ami</p>
              </div>
            </div>
            <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all"><MessageCircle className="w-5 h-5" /></button>
          </div>
        ))}

        {activeTab === "requests" && requests.map((req) => (
          <div key={req.id} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
                {req.requester?.avatar_url ? <img src={req.requester.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm font-bold text-white">{getInitials(req.requester?.display_name || "U")}</span>}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{req.requester?.display_name || req.requester?.username}</p>
                <p className="text-xs text-slate-500">Veut être votre ami</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAccept(req.id)} className="p-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-all"><UserCheck className="w-5 h-5" /></button>
              <button onClick={() => handleReject(req.id)} className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"><UserX className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
