import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { getSlideWarnings } from "@/lib/slide-warnings";
import type { Slide } from "@/lib/slide-types";

type LargePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: Slide;
  html: string;
};

export function LargePreviewDialog({ open, onOpenChange, slide, html }: LargePreviewDialogProps) {
  const warnings = getSlideWarnings(slide);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none">
        <DialogHeader>
          <DialogTitle>大プレビューモード</DialogTitle>
          <DialogDescription>
            本番サイズに近い比率で、可読性・余白・見切れリスクを確認します。
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[1fr_260px] gap-4 overflow-hidden">
          <div className="relative h-[520px] overflow-hidden rounded-lg border bg-[#050714]">
            <iframe
              title={`slide-${slide.index}-large-preview`}
              srcDoc={html}
              className="origin-top-left border-0"
              style={{ width: 1920, height: 1080, transform: "scale(0.48)" }}
            />
          </div>
          <aside className="space-y-3 rounded-lg border bg-muted/40 p-4">
            <div>
              <p className="text-xs text-muted-foreground">確認中</p>
              <p className="text-sm font-semibold">
                {String(slide.index).padStart(2, "0")} / {slide.type}
              </p>
            </div>
            <div className="space-y-2">
              {warnings.map((warning) => (
                <div key={warning.field} className="rounded-md border bg-background p-3 text-xs">
                  <p className="font-semibold">
                    {warning.field}: {warning.label}
                  </p>
                  <p className="mt-1 text-muted-foreground">{warning.message}</p>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              4ペインに戻る
            </Button>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
