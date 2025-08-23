"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserProfile from "./UserProfile";

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
  { type: "file", name: "accounts", href: "#", disabled: true },
  { type: "file", name: "categories", href: "#", disabled: true },
];

interface NavItemProps {
  item: NavItem;
  level: number;
  currentPath: string;
}

function NavItem({ item, level, currentPath }: NavItemProps) {
  const isActive = item.href === currentPath;

  const indent = "  ".repeat(level);

  if (item.type === "dir") {
    return (
      <div>
        <div className="flex items-center gap-1 text-tui-muted text-sm">
          <span>{indent}</span>
          <span>+</span>
          <span>{item.name}</span>
        </div>
        {item.children?.map((child, index) => (
          <NavItem
            key={`${child.name}-${index}`}
            item={child}
            level={level + 1}
            currentPath={currentPath}
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
        <span>{item.name}</span>
        <span className="text-xs ml-auto">[WIP]</span>
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={`flex items-center gap-1 text-sm hover:text-tui-accent transition-colors ${
        isActive ? "text-tui-accent" : "text-tui-foreground"
      }`}
    >
      <span>{indent}</span>
      <span>-</span>
      <span>{item.name}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen tui-border-r bg-tui-background sticky top-0 flex flex-col">
      <div className="p-4 tui-border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">arian</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item, index) => (
          <NavItem key={`${item.name}-${index}`} item={item} level={0} currentPath={pathname} />
        ))}
      </nav>

      <div className="tui-border-t">
        <UserProfile />
      </div>
    </aside>
  );
}
