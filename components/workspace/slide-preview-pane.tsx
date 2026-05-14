import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSlideWarnings } from "@/lib/slide-warnings";
import type { Slide } from "@/lib/slide-types";
import { cn } from "@/lib/utils";

type SlidePreviewPaneProps = {
  slide: Slide;
  html: string;
  onOpenLargePreview: () => void;
};

export function SlidePreviewPane({ slide, html, onOpenLargePreview }: SlidePreviewPaneProps) {
  const warnings = getSlideWarnings(slide);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>対応スライド小プレビュー</CardTitle>
            <CardDescription>配置の地図として確認</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenLargePreview}>
            <Maximize2 className="h-3.5 w-3.5" />
            大プレビュー
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-[190px] overflow-hidden rounded-lg border bg-[#050714]">
          <iframe
            title={`slide-${slide.index}-preview`}
            srcDoc={html}
            className="origin-top-left border-0"
            style={{ width: 1920, height: 1080, transform: "scale(0.176)" }}
          />
        </div>
        <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
          小プレビューは完成確認ではありません。今編集しているコピーが、どの位置に出るかを見るための地図です。
        </div>
        <div className="space-y-2">
          {warnings.map((warning) => (
            <div
              key={warning.field}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-xs",
                warning.level === "warning"
                  ? "border-orange-300 bg-orange-50 text-orange-800"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              <span className="font-semibold">{warning.field}</span>
              <span>{warning.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
