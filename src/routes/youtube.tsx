import { useAuth } from "@/components/layout/AuthProvider";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Youtube } from "lucide-react";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/youtube")({
  component: YouTubePage,
  head: () => ({
    meta: [
      { title: "Top YouTube — Messagux" },
      { name: "description", content: "Découvrez les chaînes YouTube les plus populaires directement dans Messagux." },
      { property: "og:title", content: "Top YouTube — Messagux" },
      { property: "og:description", content: "Découvrez les chaînes YouTube les plus populaires directement dans Messagux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function YouTubePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.navigate({ to: "/login" }); }, [user, loading, router]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;
  return (
    <div className="min-h-screen bg-messagux-dark p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Youtube className="w-8 h-8 text-red-500" />
          <h1 className="text-xl font-bold text-white">Classement YouTube</h1>
        </div>
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400">Phase 4 - Intégration API YouTube à venir</p>
          <p className="text-slate-600 text-sm mt-2">Classement par pays des YouTubers les plus suivis</p>
        </div>
      </div>
    </div>
  );
}
