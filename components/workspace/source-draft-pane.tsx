import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceDraft } from "@/lib/slide-types";

type SourceDraftPaneProps = {
  sourceDraft: SourceDraft;
};

const statusLabel: Record<SourceDraft["status"], string> = {
  drafting: "原稿作成中",
  ready: "原稿確定",
  needs_review: "確認待ち"
};

export function SourceDraftPane({ sourceDraft }: SourceDraftPaneProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>原稿</CardTitle>
            <CardDescription>スライド化の制作元</CardDescription>
          </div>
          <Badge variant="warning">{statusLabel[sourceDraft.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto pr-2">
        <div className="rounded-lg border bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">原稿タイトル</p>
          <p className="mt-1 text-sm font-semibold leading-6">{sourceDraft.title}</p>
        </div>

        {sourceDraft.sections.map((section) => (
          <section key={section.heading} className="space-y-2 rounded-lg border bg-background p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold">{section.heading}</h3>
              <div className="flex flex-wrap justify-end gap-1">
                {section.signals.map((signal) => (
                  <Badge key={signal} variant="secondary">
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-xs leading-6 text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
