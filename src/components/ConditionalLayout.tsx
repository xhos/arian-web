"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import dynamic from "next/dynamic";

const AsciiStars = dynamic(() => import("./AsciiStars"), { ssr: false });

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <div className="flex min-h-screen relative">
        {/* Left half - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
        
        {/* Right half - ASCII Stars animation (hidden on narrow screens) */}
        <div className="hidden lg:block lg:w-1/2 relative tui-border-l overflow-hidden">
          <AsciiStars />
        </div>

        {/* Theme toggle - bottom left */}
        <ThemeToggle variant="login" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}