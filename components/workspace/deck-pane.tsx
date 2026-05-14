import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Deck, ProjectBrief } from "@/lib/slide-types";

type DeckPaneProps = {
  deck: Deck;
  brief: ProjectBrief;
};

export function DeckPane({ deck, brief }: DeckPaneProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>案件・目的</CardTitle>
        <CardDescription>制作判断の前提を固定表示</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">案件名</p>
          <p className="text-sm font-semibold">{brief.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">目的</p>
          <p className="text-sm leading-6">{brief.purpose}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">対象商品</p>
          <p className="text-sm font-semibold">{brief.product}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">デッキ名</p>
          <p className="text-sm font-semibold leading-6">{brief.deckName}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">読者・視聴者</p>
          <p className="text-sm leading-6">{brief.audience}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{deck.slides.length}枚</Badge>
          <Badge variant="outline">{brief.tone}</Badge>
          <Badge variant="warning">{brief.status}</Badge>
        </div>
        <div className="rounded-lg border bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
          Bは原稿から抽出パーツ、生成スライドまでを一画面で扱う作業場です。保存やユーザー管理は次フェーズに回します。
        </div>
      </CardContent>
    </Card>
  );
}
