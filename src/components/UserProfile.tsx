"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";

interface UserProfileProps {
  isCollapsed?: boolean;
}

export default function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          setUser(session.data.user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  const displayName = user.name || user.email.split("@")[0];

  return (
    <div className="relative">
      {isExpanded && (
        <div className={`absolute bottom-full left-0 ${isCollapsed ? 'w-48' : 'w-full'} border-t border-b border-tui-border bg-tui-background ${isCollapsed ? 'ml-2' : ''}`}>
          <div className="p-3 space-y-2">
            {!isCollapsed && <div className="text-xs text-tui-muted">{user.email}</div>}
            {isCollapsed && <div className="text-xs text-tui-muted mb-2">{user.email}</div>}
            <hr className="border-tui-border" />
            <ThemeToggle />
            <button
              className="block w-full text-left text-xs hover:text-tui-accent transition-colors text-tui-muted"
              disabled
            >
              settings [WIP]
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left text-xs hover:text-red-400 transition-colors text-tui-foreground"
            >
              sign out
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 hover:bg-tui-border/20 transition-colors text-left"
        title={isCollapsed ? displayName : undefined}
      >
        {!isCollapsed && <span className="text-xs text-tui-foreground truncate">{displayName}</span>}
        {isCollapsed && <span className="text-xs text-tui-foreground">●</span>}
        <span className="text-xs text-tui-muted">{isExpanded ? "−" : "+"}</span>
      </button>
    </div>
  );
}
