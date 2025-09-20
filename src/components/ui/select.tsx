import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return <select className={cn("w-full tui-input !h-8 !py-0 !leading-8", className)} ref={ref} {...props} />;
  }
);
Select.displayName = "Select";

export { Select };
