
import { useEffect } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthProvider";
import { Users, BookOpen, Shield, BarChart3 } from "lucide-react";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Administration — Messagux" },
      { name: "description", content: "Espace d'administration Messagux : gestion des membres, contenus et livres." },
      { property: "og:title", content: "Administration — Messagux" },
      { property: "og:description", content: "Espace d'administration Messagux : gestion des membres, contenus et livres." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/login" });
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-messagux-dark p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Panel Admin</h1>
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <div className="glass-card p-4 flex flex-col items-center gap-2">
          <Users className="w-8 h-8 text-blue-400" />
          <span className="text-white font-semibold">Utilisateurs</span>
          <span className="text-slate-500 text-sm">Gestion des comptes</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center gap-2">
          <BookOpen className="w-8 h-8 text-green-400" />
          <span className="text-white font-semibold">Livres</span>
          <span className="text-slate-500 text-sm">Ajouter des livres</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center gap-2">
          <Shield className="w-8 h-8 text-purple-400" />
          <span className="text-white font-semibold">Badges</span>
          <span className="text-slate-500 text-sm">Attribution</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center gap-2">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <span className="text-white font-semibold">Stats</span>
          <span className="text-slate-500 text-sm">Analytics</span>
        </div>
      </div>
    </div>
  );
}
