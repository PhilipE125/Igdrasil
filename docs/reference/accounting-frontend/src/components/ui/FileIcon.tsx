import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
  name: string;
  className?: string;
}

export function FileIcon({ name, className }: FileIconProps) {
  const isPdf = /\.pdf$/i.test(name);
  return (
    <FileText
      className={cn(isPdf ? "text-pdf" : "text-muted-foreground", className)}
    />
  );
}
