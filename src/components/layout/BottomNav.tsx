import { useRouter, useRouterState } from "@tanstack/react-router";
import { Home, Users, MessageCircle, BookOpen, User } from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/components/layout/AuthProvider";

const navItems = [
  { icon: Home, label: "Accueil", href: "/" },
  { icon: Users, label: "Amis", href: "/friends" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: BookOpen, label: "Livres", href: "/books" },
  { icon: User, label: "Profil", href: "/profile" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const { user } = useAuth();

  if (!user || pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.navigate({ to: item.href })}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200",
                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200",
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
