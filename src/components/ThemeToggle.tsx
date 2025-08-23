"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  variant?: "sidebar" | "login";
  className?: string;
}

export default function ThemeToggle({ variant = "sidebar", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  if (variant === "login") {
    return (
      <button
        onClick={toggle}
        className={`absolute bottom-4 left-4 flex items-center gap-2 text-sm hover:text-tui-accent transition-colors z-10 ${className}`}
        title={`switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        <span>{theme === "dark" ? "light" : "dark"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`block w-full text-left text-xs hover:text-tui-accent transition-colors text-tui-muted ${className}`}
      title={`switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      theme: {theme === "dark" ? "light" : "dark"}
    </button>
  );
}
