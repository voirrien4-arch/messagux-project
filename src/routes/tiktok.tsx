import { useAuth } from "@/components/layout/AuthProvider";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/tiktok")({
  component: TikTokPage,
  head: () => ({
    meta: [
      { title: "Top TikTok — Messagux" },
      { name: "description", content: "Découvrez les créateurs TikTok les plus suivis directement dans Messagux." },
      { property: "og:title", content: "Top TikTok — Messagux" },
      { property: "og:description", content: "Découvrez les créateurs TikTok les plus suivis directement dans Messagux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function TikTokPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.navigate({ to: "/login" }); }, [user, loading, router]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;
  return (
    <div className="min-h-screen bg-messagux-dark p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-white mb-6">Classement TikTok</h1>
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400">Phase 4 - Intégration API TikTok à venir</p>
        </div>
      </div>
    </div>
  );
}
