
import { useEffect, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/components/layout/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Search, Heart, BookOpen, Share2, Bookmark } from "lucide-react";
import { cn } from "@/utils";
import type { Book } from "@/types";
import { toast } from "sonner";

import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/books")({
  component: BooksPage,
  head: () => ({
    meta: [
      { title: "Bibliothèque de livres — Messagux" },
      { name: "description", content: "Livres gratuits et premium : éducation, informatique, médecine, finance et plus sur Messagux." },
      { property: "og:title", content: "Bibliothèque de livres — Messagux" },
      { property: "og:description", content: "Livres gratuits et premium : éducation, informatique, médecine, finance et plus sur Messagux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


const categories = [
  { id: "education", label: "Éducation" },
  { id: "formation", label: "Formation" },
  { id: "medecine", label: "Médecine" },
  { id: "francais", label: "Français" },
  { id: "informatique", label: "Informatique" },
  { id: "hacking", label: "Hacking" },
  { id: "psychologie", label: "Psychologie" },
  { id: "finance", label: "Finance" },
];

function BooksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) { router.navigate({ to: "/login" }); return; }
    if (user) fetchBooks();
  }, [user, loading, activeCategory]);

  const fetchBooks = async () => {
    let query = supabase.from("books").select("*").order("views_count", { ascending: false });
    if (activeCategory) query = query.eq("category", activeCategory);
    const { data } = await query;
    setBooks(data || []);
    if (user) {
      const { data: favs } = await supabase.from("book_favorites").select("book_id").eq("user_id", user.id);
      setFavorites(new Set(favs?.map((f) => f.book_id) || []));
    }
  };

  const toggleFavorite = async (bookId: string) => {
    if (!user) return;
    if (favorites.has(bookId)) {
      await supabase.from("book_favorites").delete().eq("book_id", bookId).eq("user_id", user.id);
      setFavorites((prev) => { const next = new Set(prev); next.delete(bookId); return next; });
    } else {
      await supabase.from("book_favorites").insert({ book_id: bookId, user_id: user.id });
      setFavorites((prev) => new Set(prev).add(bookId));
      toast.success("Ajouté aux favoris !");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-messagux-dark">
      <header className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-white mb-3">Livres</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Rechercher un livre..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
          </div>
        </div>
      </header>
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveCategory(null)}
            className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all", !activeCategory ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}>Tous</button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all", activeCategory === cat.id ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10")}>{cat.label}</button>
          ))}
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 pb-6 grid grid-cols-2 gap-4">
        {books.map((book) => (
          <div key={book.id} className="glass-card overflow-hidden group">
            <div className="aspect-[3/4] bg-slate-800 relative">
              {book.cover_url ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900"><BookOpen className="w-12 h-12 text-white/20" /></div>
              )}
              {book.is_paid && <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/90 text-yellow-950 text-xs font-bold rounded-md">PAYANT</span>}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-white truncate">{book.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{book.author}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{book.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{book.likes_count}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleFavorite(book.id)} className={cn("p-1.5 rounded-lg transition-all", favorites.has(book.id) ? "text-red-400 bg-red-400/10" : "text-slate-500 hover:text-red-400")}>
                    <Bookmark className={cn("w-4 h-4", favorites.has(book.id) && "fill-current")} />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 transition-all"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
