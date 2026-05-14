import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSlideWarnings } from "@/lib/slide-warnings";
import type { EditableSlideField, Slide } from "@/lib/slide-types";
import { cn } from "@/lib/utils";

type CopyEditorPaneProps = {
  slide: Slide;
  onChange: (field: EditableSlideField, value: string | string[]) => void;
  compact?: boolean;
};

function warningClass(level: string) {
  if (level === "warning") return "border-orange-300 bg-orange-50 text-orange-800";
  if (level === "notice") return "border-yellow-300 bg-yellow-50 text-yellow-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function CopyEditorPane({ slide, onChange, compact = false }: CopyEditorPaneProps) {
  const warnings = getSlideWarnings(slide);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{compact ? "最小編集" : "コピー編集"}</CardTitle>
            <CardDescription>
              選択中: {String(slide.index).padStart(2, "0")}
              {compact ? " / 生成後の微調整" : ""}
            </CardDescription>
          </div>
          <Badge variant="outline">{slide.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4 overflow-y-auto pr-2", compact ? "px-3" : "")}>
        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-2")}>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">type</span>
            <Input value={slide.type} onChange={(event) => onChange("type", event.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">footer</span>
            <Input
              value={slide.footer ?? ""}
              onChange={(event) => onChange("footer", event.target.value)}
            />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">title</span>
          <Textarea
            value={slide.title}
            className={cn("text-base font-semibold", compact ? "min-h-[70px]" : "min-h-[92px]")}
            onChange={(event) => onChange("title", event.target.value)}
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">subtitle</span>
          <Textarea
            value={slide.subtitle ?? ""}
            onChange={(event) => onChange("subtitle", event.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">highlight</span>
            <Input
              value={slide.highlight ?? ""}
              onChange={(event) => onChange("highlight", event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">highlight_suffix</span>
            <Input
              value={slide.highlight_suffix ?? ""}
              onChange={(event) => onChange("highlight_suffix", event.target.value)}
            />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">body</span>
          <Textarea
            value={slide.body.join("\n")}
            className={compact ? "min-h-[92px]" : "min-h-[130px]"}
            onChange={(event) =>
              onChange(
                "body",
                event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
              )
            }
          />
        </label>

        <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
          <p className="text-xs font-semibold text-muted-foreground">文字数警告</p>
          <div className="grid gap-2">
            {warnings.map((warning) => (
              <div
                key={warning.field}
                className={cn("rounded-md border px-3 py-2 text-xs", warningClass(warning.level))}
              >
                <span className="font-semibold">{warning.field}: {warning.label}</span>
                <span className="ml-2">{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
