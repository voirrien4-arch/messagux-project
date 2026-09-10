
import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Edit3, MapPin, Link as LinkIcon, Calendar, Shield, Star, Award } from "lucide-react";
import { getInitials, formatNumber, cn } from "@/utils";
import type { Post } from "@/types";
import { PostCard } from "@/components/feed/PostCard";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Mon profil — Messagux" },
      { name: "description", content: "Consultez et personnalisez votre profil Messagux : bio, badges et publications." },
      { property: "og:title", content: "Mon profil — Messagux" },
      { property: "og:description", content: "Consultez et personnalisez votre profil Messagux : bio, badges et publications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">("posts");

  useEffect(() => {
    if (!loading && !user) { router.navigate({ to: "/login" }); return; }
    if (user) fetchPosts();
  }, [user, loading, activeTab]);

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*, profiles:user_id(*)").eq("user_id", user?.id ?? "").order("created_at", { ascending: false });
    setPosts(data || []);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-messagux-dark pb-20">
      <div className="h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 relative">
        {user.banner_url && <img src={user.banner_url} alt="" className="object-cover opacity-50" />}
      </div>
      <div className="max-w-lg mx-auto px-4 -mt-16 relative">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-28 h-28 rounded-full border-4 border-messagux-dark bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
            {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-3xl font-bold text-white">{getInitials(user.display_name || "M")}</span>}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{user.display_name || user.username}</h1>
              {user.is_verified && <Shield className="w-5 h-5 text-blue-400" />}
              {user.is_premium && <Star className="w-5 h-5 text-purple-400 fill-purple-400" />}
              {user.badge_hacker && <Award className="w-5 h-5 text-cyan-400" />}
            </div>
            <p className="text-slate-400 text-sm">@{user.username}</p>
          </div>
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><Edit3 className="w-5 h-5" /></button>
        </div>
        <p className="text-slate-300 text-sm mb-3">{user.bio || "Aucune bio"}</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4">
          {user.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.location}</span>}
          {user.website && <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" />{user.website}</span>}
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />A rejoint {new Date(user.created_at).toLocaleDateString("fr-FR")}</span>
        </div>
        <div className="flex gap-6 mb-6 py-3 border-y border-white/5">
          <div className="text-center"><span className="text-white font-bold">{formatNumber(posts.length)}</span><p className="text-xs text-slate-500">Publications</p></div>
          <div className="text-center"><span className="text-white font-bold">0</span><p className="text-xs text-slate-500">Amis</p></div>
          <div className="text-center"><span className="text-white font-bold">0</span><p className="text-xs text-slate-500">Abonnés</p></div>
        </div>
        <div className="flex border-b border-white/5 mb-4">
          {(["posts", "media", "likes"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("flex-1 py-3 text-sm font-medium border-b-2 transition-all", activeTab === tab ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300")}>
              {tab === "posts" ? "Publications" : tab === "media" ? "Médias" : "J'aime"}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {posts.map((post) => <PostCard key={post.id} post={post} onUpdate={fetchPosts} />)}
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-xs text-slate-600 mb-1">Créé par La Digital-Lab GN</p>
        <div className="flex justify-center gap-4 text-xs text-slate-700">
          <span>Play-Stars</span><span>•</span><span>Guinee-FO</span>
        </div>
      </div>
    </div>
  );
}
