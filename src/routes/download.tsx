import { useAuth } from "@/components/layout/AuthProvider";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/download")({
  component: DownloadPage,
  head: () => ({
    meta: [
      { title: "Téléchargement vidéo — Messagux" },
      { name: "description", content: "Téléchargez des vidéos YouTube, TikTok et Snapchat depuis Messagux." },
      { property: "og:title", content: "Téléchargement vidéo — Messagux" },
      { property: "og:description", content: "Téléchargez des vidéos YouTube, TikTok et Snapchat depuis Messagux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function DownloadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [downloadsLeft, setDownloadsLeft] = useState(30);
  useEffect(() => { if (!loading && !user) router.navigate({ to: "/login" }); }, [user, loading, router]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;
  const handleDownload = () => {
    if (!url) { toast.error("Collez un lien d'abord"); return; }
    toast.success("Phase 6 - Téléchargement à venir");
  };
  return (
    <div className="min-h-screen bg-messagux-dark p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Téléchargeur</h1>
        </div>
        <div className="glass-card p-6">
          <p className="text-slate-400 text-sm mb-4">Collez le lien d'une vidéo YouTube, TikTok ou Snapchat pour la télécharger sans filigrane.</p>
          <p className="text-xs text-slate-500 mb-4">Téléchargements restants cette semaine : <span className="text-blue-400 font-bold">{downloadsLeft}/30</span></p>
          <div className="relative mb-4">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
          </div>
          <button onClick={handleDownload} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />Coller le lien & Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}
