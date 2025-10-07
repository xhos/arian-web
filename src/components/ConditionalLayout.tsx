"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return children;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
