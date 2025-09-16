import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "accent" | "destructive";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-mono transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "tui-button hover:bg-tui-border active:bg-tui-muted",
      outline: "border border-tui-border bg-transparent hover:bg-tui-border",
      ghost: "hover:bg-tui-border/50",
      accent: "tui-accent bg-accent/10 border border-accent/30 hover:bg-accent/20",
      destructive: "bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600",
    };

    const sizes = {
      default: "px-4 py-2 text-sm",
      sm: "px-3 py-1 text-xs",
      lg: "px-6 py-3 text-base",
    };

    const classes = cn(baseClasses, variants[variant], sizes[size], className);

    if (asChild) {
      return <div className={classes} />;
    }

    return <button className={classes} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, type ButtonProps };
