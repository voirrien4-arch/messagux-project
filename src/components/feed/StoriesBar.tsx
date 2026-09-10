
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn, getInitials } from "@/utils";
import type { Story, Profile } from "@/types";

interface StoriesBarProps {
  stories: Story[];
  currentUser: Profile;
}

export function StoriesBar({ stories, currentUser }: StoriesBarProps) {
  const [showCreate, setShowCreate] = useState(false);

  // Grouper les stories par utilisateur
  const storiesByUser = stories.reduce((acc, story) => {
    const userId = story.user_id;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  const uniqueUsers = Object.keys(storiesByUser);

  return (
    <div className="max-w-lg mx-auto px-4 py-3">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {/* Ma story */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div className="relative w-16 h-16">
            <div className="w-full h-full rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center bg-white/5">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt="Ma story"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-slate-300">
                  {getInitials(currentUser?.display_name || "M")}
                </span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-messagux-dark">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Votre story</span>
        </button>

        {/* Stories des amis */}
        {uniqueUsers.map((userId) => {
          const userStories = storiesByUser[userId];
          const profile = userStories[0]?.profiles;
          const hasUnviewed = true; // TODO: implémenter le système de vue

          return (
            <button
              key={userId}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full p-[2px]",
                  hasUnviewed
                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400"
                    : "bg-slate-700"
                )}
              >
                <div className="w-full h-full rounded-full border-2 border-messagux-dark overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-slate-300">
                        {getInitials(profile?.display_name || "U")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 truncate max-w-[64px]">
                {profile?.display_name || profile?.username || "Utilisateur"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
