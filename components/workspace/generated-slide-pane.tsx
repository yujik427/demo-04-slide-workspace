import { Maximize2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyEditorPane } from "@/components/workspace/copy-editor-pane";
import { getSlideWarnings } from "@/lib/slide-warnings";
import type {
  EditableSlideField,
  ExtractedPart,
  Slide,
  SlidePlanItem
} from "@/lib/slide-types";
import { cn } from "@/lib/utils";

type GeneratedSlidePaneProps = {
  slides: Slide[];
  selectedIndex: number;
  selectedPartId: string | null;
  slidePlan: SlidePlanItem[];
  parts: ExtractedPart[];
  html: string;
  onSelectSlide: (index: number) => void;
  onChangeSlide: (field: EditableSlideField, value: string | string[]) => void;
  onOpenLargePreview: () => void;
};

export function GeneratedSlidePane({
  slides,
  selectedIndex,
  selectedPartId,
  slidePlan,
  parts,
  html,
  onSelectSlide,
  onChangeSlide,
  onOpenLargePreview
}: GeneratedSlidePaneProps) {
  const selectedSlide = slides[selectedIndex];
  const selectedPlan = slidePlan.find((plan) => plan.slideIndex === selectedSlide.index);
  const relatedParts = parts.filter((part) => selectedPlan?.partIds.includes(part.id));
  const warnings = getSlideWarnings(selectedSlide);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>生成スライド</CardTitle>
            <CardDescription>確認・最小編集・再生成の入口</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenLargePreview}>
            <Maximize2 className="h-3.5 w-3.5" />
            大プレビュー
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid h-[calc(100%-84px)] grid-cols-[0.75fr_1.25fr_1.25fr] gap-3 overflow-hidden">
        <div className="space-y-2 overflow-y-auto pr-1">
          {slides.map((slide, index) => {
            const selected = index === selectedIndex;
            const highlightedByPart =
              selectedPartId !== null &&
              slidePlan
                .find((plan) => plan.slideIndex === slide.index)
                ?.partIds.includes(selectedPartId);

            return (
              <Button
                key={slide.index}
                variant="ghost"
                className={cn(
                  "h-auto w-full justify-start rounded-lg border p-2 text-left",
                  selected ? "border-primary bg-primary/5" : "border-border bg-background",
                  highlightedByPart ? "ring-2 ring-orange-300" : ""
                )}
                onClick={() => onSelectSlide(index)}
              >
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {String(slide.index).padStart(2, "0")}
                    </span>
                    <Badge variant="secondary">{slide.type}</Badge>
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold leading-5">{slide.title}</p>
                </div>
              </Button>
            );
          })}
        </div>

        <div className="space-y-3 overflow-y-auto pr-1">
          <div className="relative h-[180px] overflow-hidden rounded-lg border bg-[#050714]">
            <iframe
              title={`slide-${selectedSlide.index}-preview`}
              srcDoc={html}
              className="origin-top-left border-0"
              style={{ width: 1920, height: 1080, transform: "scale(0.166)" }}
            />
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">このスライドの役割</p>
              <Button variant="secondary" size="sm">
                <RefreshCw className="h-3.5 w-3.5" />
                再生成
              </Button>
            </div>
            <p className="text-sm font-semibold leading-6">{selectedPlan?.role ?? "未設定"}</p>
            <div className="flex flex-wrap gap-1">
              {relatedParts.map((part) => (
                <Badge
                  key={part.id}
                  variant={part.id === selectedPartId ? "warning" : "outline"}
                  className="max-w-full"
                >
                  {part.label}
                </Badge>
              ))}
            </div>
            {selectedPlan?.visualPrompt ? (
              <p className="rounded-md border bg-background p-2 text-xs leading-5 text-muted-foreground">
                イラスト指示: {selectedPlan.visualPrompt}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {warnings.map((warning) => (
              <div
                key={warning.field}
                className={cn(
                  "rounded-md border px-2 py-2 text-xs",
                  warning.level === "warning"
                    ? "border-orange-300 bg-orange-50 text-orange-800"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                <p className="font-semibold">{warning.field}</p>
                <p>{warning.label}</p>
              </div>
            ))}
          </div>
        </div>

        <CopyEditorPane slide={selectedSlide} onChange={onChangeSlide} compact />
      </CardContent>
    </Card>
  );
}
