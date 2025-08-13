import * as React from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("block text-xs tui-muted mb-1 uppercase tracking-wider hover:tui-accent transition-colors cursor-pointer", className)}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label, type LabelProps };