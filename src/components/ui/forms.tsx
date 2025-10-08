import { cn } from "@/lib/utils";
import { Label } from "./label";

export const FormField = ({
  label,
  required,
  children,
  className,
  ...props
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props}>
    <Label>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export const Select = ({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input",
      "bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-1 focus:ring-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);
