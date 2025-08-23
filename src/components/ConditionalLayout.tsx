"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import dynamic from "next/dynamic";
import { authClient } from "@/lib/auth-client";

const AsciiStars = dynamic(() => import("./AsciiStars"), { ssr: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const authenticated = !!session.data?.user;
        setIsAuthenticated(authenticated);

        if (!authenticated && !isLoginPage) {
          router.push("/login");
        }
      } catch {
        setIsAuthenticated(false);
        if (!isLoginPage) router.push("/login");
      }
    };

    checkAuth();
  }, [pathname, router, isLoginPage]);

  if (isLoginPage) {
    return (
      <div className="flex min-h-screen relative">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <div className="hidden lg:block lg:w-1/2 relative tui-border-l overflow-hidden">
          <AsciiStars className="w-full h-full" />
        </div>
        <ThemeToggle variant="login" />
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm tui-muted">loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
