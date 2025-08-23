import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-xs tui-muted mb-1 uppercase tracking-wider hover:tui-accent transition-colors cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
