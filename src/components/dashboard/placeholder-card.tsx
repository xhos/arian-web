import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaText } from "@/components/ui/typography";

interface PlaceholderCardProps {
  title: string;
  description?: string;
}

export function PlaceholderCard({ title, description }: PlaceholderCardProps) {
  return (
    <Card className="h-full flex flex-col border-dashed">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex justify-center items-center">
        <MetaText>{description || "coming soon"}</MetaText>
      </CardContent>
    </Card>
  );
}
