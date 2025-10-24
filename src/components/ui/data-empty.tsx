import { LucideIcon } from "lucide-react";

interface DataEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function DataEmpty({ icon: Icon, title, description }: DataEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-16 w-16 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
