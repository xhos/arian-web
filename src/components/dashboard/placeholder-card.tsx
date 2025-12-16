import { Card } from "@/components/lib";
import { Muted } from "@/components/lib";

interface PlaceholderCardProps {
  title: string;
  description?: string;
}

export function PlaceholderCard({ title, description }: PlaceholderCardProps) {
  return (
    <Card className="h-full border-dashed" title={title.toLowerCase()}>
      <div className="flex-1 flex justify-center items-center py-8">
        <Muted>{description || "coming soon"}</Muted>
      </div>
    </Card>
  );
}
