import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractedPart } from "@/lib/slide-types";
import { cn } from "@/lib/utils";

type ExtractedPartsPaneProps = {
  parts: ExtractedPart[];
  selectedPartId: string | null;
  onSelectPart: (partId: string) => void;
};

const kindLabel: Record<ExtractedPart["kind"], string> = {
  appeal: "訴求",
  proof: "根拠",
  number: "数字",
  objection: "不安解消",
  cta: "CTA",
  visual: "イラスト"
};

const statusLabel: Record<ExtractedPart["status"], string> = {
  auto: "自動抽出",
  edited: "編集済み",
  needs_review: "確認待ち"
};

export function ExtractedPartsPane({ parts, selectedPartId, onSelectPart }: ExtractedPartsPaneProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>抽出パーツ</CardTitle>
        <CardDescription>スライドに入れる材料を確認</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 overflow-y-auto pr-2">
        {parts.map((part) => {
          const selected = part.id === selectedPartId;

          return (
            <Button
              key={part.id}
              variant="ghost"
              className={cn(
                "h-auto w-full justify-start rounded-lg border p-3 text-left",
                selected ? "border-primary bg-primary/5" : "border-border bg-background"
              )}
              onClick={() => onSelectPart(part.id)}
            >
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={part.status === "needs_review" ? "warning" : "secondary"}>
                    {kindLabel[part.kind]}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{statusLabel[part.status]}</span>
                </div>
                <p className="text-sm font-semibold leading-5">{part.label}</p>
                <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{part.slideText}</p>
                <p className="text-[11px] text-muted-foreground">
                  使用候補: {part.targetSlideIndexes.map((index) => `#${index}`).join(" / ")}
                </p>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
