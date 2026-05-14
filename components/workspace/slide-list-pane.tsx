import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasBlockingWarning } from "@/lib/slide-warnings";
import type { Slide } from "@/lib/slide-types";
import { cn } from "@/lib/utils";

type SlideListPaneProps = {
  slides: Slide[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function SlideListPane({ slides, selectedIndex, onSelect }: SlideListPaneProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>構成・スライド一覧</CardTitle>
        <CardDescription>全体の流れと警告を確認</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 overflow-y-auto pr-2">
        {slides.map((slide, index) => {
          const selected = index === selectedIndex;
          const warning = hasBlockingWarning(slide);

          return (
            <Button
              key={slide.index}
              variant="ghost"
              className={cn(
                "h-auto w-full justify-start rounded-lg border p-3 text-left",
                selected ? "border-primary bg-primary/5" : "border-border bg-background"
              )}
              onClick={() => onSelect(index)}
            >
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {String(slide.index).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    {warning ? <AlertTriangle className="h-3.5 w-3.5 text-orange-600" /> : null}
                    <Badge variant={warning ? "warning" : "secondary"}>{slide.type}</Badge>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm font-semibold leading-5">{slide.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {slide.eyebrow ?? slide.subtitle ?? "役割未設定"}
                </p>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
