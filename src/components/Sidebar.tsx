"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';


interface NavItem {
  type: 'file' | 'dir';
  name: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    type: 'dir',
    name: 'arian/',
    children: [
      { type: 'file', name: 'transactions', href: '/' },
      { type: 'file', name: 'accounts', href: '#', disabled: true },
      { type: 'file', name: 'categories', href: '#', disabled: true },
      { type: 'file', name: 'dashboard', href: '#', disabled: true },
      { type: 'file', name: 'receipts', href: '#', disabled: true },
      { type: 'file', name: 'settings', href: '#', disabled: true },
      { type: 'file', name: 'login', href: '/login' }
    ]
  }
];

interface NavItemProps {
  item: NavItem;
  level: number;
  currentPath: string;
}

function NavItem({ item, level, currentPath }: NavItemProps) {
  const isActive = item.href === currentPath;
  
  const indent = '  '.repeat(level);
  
  if (item.type === 'dir') {
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
      href={item.href || '#'}
      className={`flex items-center gap-1 text-sm hover:text-tui-accent transition-colors ${
        isActive ? 'text-tui-accent' : 'text-tui-foreground'
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
      {/* Header */}
      <div className="p-4 tui-border-b">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-tui-accent">$</span>
          <span className="text-sm font-mono">arian-web</span>
        </div>
        <div className="text-xs text-tui-muted">financial tracker v0.1.0</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-sm text-tui-muted mb-3 uppercase tracking-wider">filesystem</div>
        {navigationItems.map((item, index) => (
          <NavItem
            key={`${item.name}-${index}`}
            item={item}
            level={0}
            currentPath={pathname}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 tui-border-t space-y-2">
        <div className="text-sm text-tui-muted mb-2 uppercase tracking-wider">settings</div>
        <ThemeToggle />
      </div>
    </aside>
  );
}