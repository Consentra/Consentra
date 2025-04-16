
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = "Loading...", className }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Loader2Icon className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
