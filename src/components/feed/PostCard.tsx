
import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/layout/AuthProvider";
import { formatDate, formatNumber, cn, getInitials } from "@/utils";
import type { Post } from "@/types";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const { user } = useAuth();

  const handleLike = async () => {
    if (!user) return;
    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
        setLikesCount((prev) => prev - 1);
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch {
      toast.error("Erreur lors du like");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const profile = post.profiles;

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">{getInitials(profile?.display_name || "U")}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{profile?.display_name || profile?.username}</p>
            <p className="text-xs text-slate-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 text-slate-400">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {post.media_urls && post.media_urls.length > 0 && (
        <div className={`grid gap-1 ${post.media_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media_urls.map((url, index) => (
            <div key={index} className="relative aspect-video bg-slate-800">
              {url.match(/\.(mp4|webm|mov)$/i) ? (
                <video src={url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn("flex items-center gap-1.5 transition-all", isLiked ? "text-red-500" : "text-slate-400 hover:text-red-400")}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              <span className="text-xs font-medium">{formatNumber(likesCount)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-all">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-medium">{formatNumber(post.comments_count)}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-slate-400 hover:text-green-400 transition-all">
              <Share2 className="w-5 h-5" />
              <span className="text-xs font-medium">{formatNumber(post.shares_count)}</span>
            </button>
          </div>
          <button className="text-slate-400 hover:text-yellow-400 transition-all">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
