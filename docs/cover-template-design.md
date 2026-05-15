# 表紙テンプレート — 設計案

> [cover-design-and-workflow.md](./cover-design-and-workflow.md) で決定した仕様を、既存ワークスペースに組み込むための **実装設計案**。
> ゼロから作らず、既存の `slide-renderer.ts` の `cover` タイプを **拡張する** 方針。

## 1. 既存構造との関係

| 既存 | 拡張内容 |
|---|---|
| `lib/slide-types.ts` の `Slide` 型 | **キャッチ帯/キャラ/配色プリセット** のフィールドを追加 |
| `lib/slide-renderer.ts` の `slide-cover` レンダリング | 現行のシンプルレンダリングを **スキルプラス級レイアウト** に改修 |
| `data/sales-deck.json` の1枚目データ | 新フィールドを使った値に更新 |
| `components/workspace/` の右ペイン関連 | **「表紙生成」セクション**(キャラ選択UI、配色プリセット選択UI)を追加 |
| `public/` | `characters/`ディレクトリを追加、`index.json`でメタ管理 |

## 2. 型拡張: `lib/slide-types.ts`

既存の `Slide` 型に、表紙(cover)専用のオプショナルフィールドを追加:

```ts
export type Slide = {
  index: number;
  type: SlideType;
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  highlight?: string | null;
  highlight_suffix?: string | null;
  body: string[];
  footer?: string | null;
  cta?: string | null;

  // === 表紙(cover)専用 ===
  /** 黄色キャッチ帯の文言。"7日で1本、自分で動くアプリを" 等 */
  catchBand?: string | null;
  /** 人物キャラID。public/characters/index.json の person.id を参照 */
  personCharacterId?: string | null;
  /** ピクセルキャラID。public/characters/index.json の pixel.id を参照 */
  pixelCharacterId?: string | null;
  /** 配色プリセットID。"claude-dark" | "claude-light" 等 */
  colorPresetId?: string | null;
  /** ツールロゴ。"claude-code" 単独想定 */
  toolLogoId?: string | null;
};
```

すべて optional なので、既存の他スライド(problem/cta等)には影響しない。

## 3. レンダリング設計: `lib/slide-renderer.ts`

### 3-1. HTML 構造(`slide-cover` を改修)

```html
<section class="slide slide-cover" data-index="1" data-type="cover" data-preset="claude-dark">
  <!-- 黄色キャッチ帯(最上部) -->
  <div class="cover-catch-band">
    <span class="cover-catch-text">7日で1本、自分で動くアプリを</span>
  </div>

  <!-- メイン領域(左:テキスト / 右:キャラ) -->
  <div class="cover-grid">
    <!-- 左: タイトル群 -->
    <div class="cover-text-zone">
      <h1 class="cover-title">Claude Code<br/>ブートキャンプ</h1>
      <p class="cover-subtitle">未経験7日で成果物1本</p>
    </div>

    <!-- 右: キャラ群(人物 + ピクセル) -->
    <div class="cover-character-zone">
      <img class="cover-person" src="/characters/person/person-01.png" alt="" />
      <img class="cover-pixel" src="/characters/pixel/pixel-01.png" alt="" />
    </div>
  </div>

  <!-- 下部: ツールロゴ -->
  <div class="cover-tool-row">
    <img class="cover-tool-logo" src="/logos/claude-code.svg" alt="Claude Code" />
  </div>
</section>
```

### 3-2. CSS 設計(16:9 固定、CSS Grid主体)

```css
.slide-cover {
  /* 16:9 の固定アスペクト比 */
  aspect-ratio: 16 / 9;
  width: 1920px;       /* 出力PNG解像度。Playwrightでこのサイズでスクショ */
  height: 1080px;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-rows: 140px 1fr 160px; /* 上:キャッチ帯 / 中:メイン / 下:ロゴ */
  background: var(--cover-bg);
  color: var(--cover-text);
  font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
}

/* === キャッチ帯 === */
.cover-catch-band {
  background: var(--cover-catch-bg);   /* 黄色 #facc15 など */
  color: var(--cover-catch-text);
  display: flex;
  align-items: center;
  padding: 0 80px;
  font-weight: 900;
  font-size: 44px;                     /* 30字想定で1行に収める。短文化したら56pxへ */
  letter-spacing: 0.01em;
  line-height: 1.2;
}

/* === メイン領域(左右分割) === */
.cover-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;   /* 左60%・右40% */
  gap: 60px;
  padding: 80px 100px;
  align-items: center;
}

.cover-text-zone {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.cover-title {
  font-size: 128px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}

.cover-subtitle {
  font-size: 44px;
  font-weight: 700;
  color: var(--cover-subtitle-color);
  margin: 0;
}

/* === キャラ領域 === */
.cover-character-zone {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.cover-person {
  width: 100%;
  max-height: 700px;
  object-fit: contain;
}

.cover-pixel {
  position: absolute;
  bottom: 40px;
  right: 20px;
  width: 120px;
  image-rendering: pixelated;  /* ピクセルアートのカクカク維持 */
}

/* === ツールロゴ === */
.cover-tool-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 100px;
}

.cover-tool-logo {
  height: 100px;
}

/* === 配色プリセット === */
.slide-cover[data-preset="claude-dark"] {
  --cover-bg: #0a0e27;
  --cover-text: #ffffff;
  --cover-subtitle-color: #a0aec0;
  --cover-catch-bg: #facc15;       /* 黄 */
  --cover-catch-text: #0a0e27;     /* 帯の文字は濃紺 */
}

.slide-cover[data-preset="claude-light"] {
  --cover-bg: #faf9f5;
  --cover-text: #141413;
  --cover-subtitle-color: #6b7280;
  --cover-catch-bg: #d97757;       /* Anthropic オレンジ */
  --cover-catch-text: #ffffff;
}
```

### 3-3. レンダリング関数(TypeScript)

```ts
function renderCoverSlide(slide: Slide): string {
  const dataAttrs = `data-index="${slide.index}" data-type="${escapeHtml(slide.type)}" data-preset="${escapeHtml(slide.colorPresetId ?? "claude-dark")}"`;

  const personSrc = slide.personCharacterId
    ? `/characters/person/${slide.personCharacterId}.png`
    : null;
  const pixelSrc = slide.pixelCharacterId
    ? `/characters/pixel/${slide.pixelCharacterId}.png`
    : null;
  const toolLogo = slide.toolLogoId ?? "claude-code";

  return `
<section class="slide slide-cover" ${dataAttrs}>
  ${slide.catchBand ? `<div class="cover-catch-band"><span class="cover-catch-text">${escapeHtml(slide.catchBand)}</span></div>` : ""}
  <div class="cover-grid">
    <div class="cover-text-zone">
      <h1 class="cover-title">${escapeHtmlWithBr(slide.title)}</h1>
      ${slide.subtitle ? `<p class="cover-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
    </div>
    <div class="cover-character-zone">
      ${personSrc ? `<img class="cover-person" src="${personSrc}" alt="" />` : ""}
      ${pixelSrc ? `<img class="cover-pixel" src="${pixelSrc}" alt="" />` : ""}
    </div>
  </div>
  <div class="cover-tool-row">
    <img class="cover-tool-logo" src="/logos/${escapeHtml(toolLogo)}.svg" alt="" />
  </div>
</section>`;
}
```

既存の `renderSlide` 関数の `if (slide.type === "cover")` 分岐をこの新関数の呼び出しに差し替える。

## 4. データソース更新: `data/sales-deck.json`

1枚目(表紙)のスライドデータを以下に更新:

```json
{
  "index": 1,
  "type": "cover",
  "title": "Claude Code\nブートキャンプ",
  "subtitle": "未経験7日で成果物1本",
  "catchBand": "プログラミング未経験から、7日でAIシステムが1本完成する。",
  "personCharacterId": "person-01",
  "pixelCharacterId": "pixel-01",
  "colorPresetId": "claude-dark",
  "toolLogoId": "claude-code",
  "body": []
}
```

## 5. キャラ画像メタ: `public/characters/index.json`

[character-generation-prompts.md](./character-generation-prompts.md) のセクション3に既述。

ワークスペースの右ペインから読み込んで、キャラ選択UIに表示する。

## 6. 配色プリセット

| ID | 用途 | bg | text | catch帯bg |
|---|---|---|---|---|
| `claude-dark` | デフォルト | `#0a0e27` | `#ffffff` | `#facc15`(黄) |
| `claude-light` | サブ | `#faf9f5` | `#141413` | `#d97757`(オレンジ) |

将来増やす場合は CSS の `data-preset` セレクタを追加するだけ。

## 7. UI拡張: 右ペイン「表紙生成」セクション

既存の `components/workspace/extracted-parts-pane.tsx` または `generated-slide-pane.tsx` の中に、cover スライド選択時のみ表示する小セクションを追加:

```
┌─────────────────────────────┐
│ 表紙設定                       │
├─────────────────────────────┤
│ キャッチ帯                     │
│ [テキスト入力欄] + [3案生成▼] │  ← 3案生成ボタンでAI提案
├─────────────────────────────┤
│ 人物キャラ                     │
│ [サムネ1] [サムネ2] [サムネ3]  │  ← index.json から
├─────────────────────────────┤
│ ピクセルキャラ                 │
│ [サムネ1] [サムネ2] [サムネ3]  │
├─────────────────────────────┤
│ 配色プリセット                 │
│ ◉ ダーク  ○ ライト            │
├─────────────────────────────┤
│ [プレビュー更新]              │
│ [PNG画像として保存]            │  ← Playwrightで出力
└─────────────────────────────┘
```

選択を変えるたびに即座にプレビューが更新されるのが理想(useState で完結)。

## 8. PNG出力フロー(Playwright)

```ts
// scripts/export-cover.ts (新規)
import { chromium } from "playwright";

async function exportCover(slideIndex: number, outputPath: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  await page.goto(`http://localhost:3000/preview/${slideIndex}`);
  await page.waitForSelector(".slide-cover");
  const slideElement = await page.$(".slide-cover");
  await slideElement!.screenshot({ path: outputPath, omitBackground: false });
  await browser.close();
}
```

`/preview/[slideIndex]` ページを新規追加(printout専用ルート、HTMLだけ)。

## 9. 実装手順

| # | タスク | 推定工数 |
|---|---|---|
| 1 | `slide-types.ts` に新フィールド追加 | 5分 |
| 2 | `slide-renderer.ts` の cover 部分を新ロジックに改修 + CSS追加 | 60分 |
| 3 | `data/sales-deck.json` の1枚目を新フォーマットに更新 | 5分 |
| 4 | `public/characters/` 作成 + 仮素材 + `index.json` | (画像生成後) |
| 5 | `public/logos/claude-code.svg` 配置 | 10分 |
| 6 | 右ペイン「表紙設定」セクションUI追加 | 90分 |
| 7 | `/preview/[slideIndex]` 専用ルート追加(Playwright用) | 30分 |
| 8 | `scripts/export-cover.ts` 実装 + npm script 登録 | 30分 |

**最短ルート**: 1→2→3→5→7→ 仮プレビューで確認 → 6→8→ 完成

## 10. 既存仕様との非互換チェック

- `Slide`型への追加フィールドはすべて optional → **既存スライドのレンダリングに影響なし**
- 既存 `renderSlide` 関数の cover 分岐だけ差し替え → 他のスライドタイプには影響なし
- `data/sales-deck.json` の1枚目以外は変更なし
- CSS のセレクタは `.slide-cover` 内に閉じている → 既存スタイルとの衝突なし

---

**作成**: 2026-05-14
**次のステップ**: この設計でOKなら、上記「9. 実装手順」の#1〜#3 から着手(キャラ画像なしでも仮素材で先にレイアウト確認できる)
