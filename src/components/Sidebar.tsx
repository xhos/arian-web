"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import UserProfile from "./UserProfile";
import { Button } from "./ui/button";

interface NavItem {
  type: "file" | "dir";
  name: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  { type: "file", name: "transactions", href: "/" },
  { type: "file", name: "accounts", href: "/accounts" },
  { type: "file", name: "categories", href: "/categories" },
  { type: "file", name: "rules", href: "/rules" },
];

interface NavItemProps {
  item: NavItem;
  level: number;
  currentPath: string;
}

function NavItem({
  item,
  level,
  currentPath,
  isCollapsed,
}: NavItemProps & { isCollapsed: boolean }) {
  const isActive = item.href === currentPath;

  const indent = "  ".repeat(level);

  if (item.type === "dir") {
    return (
      <div>
        <div className="flex items-center gap-1 text-tui-muted text-sm">
          <span>{indent}</span>
          <span>+</span>
          {!isCollapsed && <span>{item.name}</span>}
        </div>
        {!isCollapsed &&
          item.children?.map((child, index) => (
            <NavItem
              key={`${child.name}-${index}`}
              item={child}
              level={level + 1}
              currentPath={currentPath}
              isCollapsed={isCollapsed}
            />
          ))}
      </div>
    );
  }

  if (item.disabled) {
    return (
      <div className="flex items-center gap-1 text-sm text-tui-muted cursor-not-allowed">
        <span>{indent}</span>
        <span>-</span>
        {!isCollapsed && (
          <>
            <span>{item.name}</span>
            <span className="text-xs ml-auto">[WIP]</span>
          </>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={`flex items-center gap-1 text-sm hover:text-tui-accent transition-colors ${
        isActive ? "text-tui-accent" : "text-tui-foreground"
      }`}
      title={isCollapsed ? item.name : undefined}
    >
      <span>{indent}</span>
      <span>-</span>
      {!isCollapsed && <span>{item.name}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`${isCollapsed ? "w-16" : "w-64"} h-screen tui-border-r bg-tui-background sticky top-0 flex flex-col transition-all duration-300 ease-in-out`}
    >
      <div className="p-4 tui-border-b">
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed && <span className="text-sm font-mono">arian</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="p-1 hover:bg-tui-border"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="text-xs font-mono">{isCollapsed ? "→" : "←"}</span>
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item, index) => (
          <NavItem
            key={`${item.name}-${index}`}
            item={item}
            level={0}
            currentPath={pathname}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      <div className="tui-border-t">
        <UserProfile isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
