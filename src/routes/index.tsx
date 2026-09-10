
import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthProvider";
import { StoriesBar } from "@/components/feed/StoriesBar";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostCard } from "@/components/feed/PostCard";
import { supabase } from "@/integrations/supabase/client";
import type { Post, Story } from "@/types";
import { Search, Bell, Menu } from "lucide-react";
import { useAppStore } from "@/hooks/useStore";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Messagux — Fil d'actualité social & IA" },
      { name: "description", content: "Le fil Messagux : publications, stories et messages, avec l'IA intégrée. Créé par La Digital-Lab GN." },
      { property: "og:title", content: "Messagux — Fil d'actualité social & IA" },
      { property: "og:description", content: "Le fil Messagux : publications, stories et messages, avec l'IA intégrée. Créé par La Digital-Lab GN." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { unreadCount } = useAppStore();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({ to: "/login" });
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les posts avec les profils
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (*)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      // Vérifier les likes de l'utilisateur
      const { data: likesData } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user?.id ?? "");

      const likedPostIds = new Set(likesData?.map((l) => l.post_id) || []);

      const postsWithLikes = (postsData || []).map((post) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
      }));

      setPosts(postsWithLikes);

      // Récupérer les stories actives
      const { data: storiesData } = await supabase
        .from("stories")
        .select(`
          *,
          profiles:user_id (*)
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      setStories(storiesData || []);
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-messagux-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <h1 className="text-lg font-bold text-white">Messagux</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-white/5 transition-all">
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 transition-all">
              <Menu className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Barre de recherche */}
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Stories */}
      <StoriesBar stories={stories} currentUser={user} />

      {/* Créer un post */}
      <CreatePost onPostCreated={fetchData} />

      {/* Feed */}
      <div className="max-w-lg mx-auto px-4 pb-6 space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Aucune publication pour le moment</p>
            <p className="text-slate-600 text-sm mt-1">Soyez le premier à publier !</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchData} />
          ))
        )}
      </div>
    </div>
  );
}
