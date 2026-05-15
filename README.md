# Addness Slide Studio

販売スライドを同じ品質で何度でも量産するための Web アプリケーション。

アドネス株式会社 採用評価タスク（CC ブートキャンプ販売スライド自動生成システム）の提出物です。

## デモ

- **本番デモ**: https://demo-04-slide-workspace.vercel.app
- **デザイン & ワークフロー言語化ドキュメント**: [`docs/submission-doc.md`](./docs/submission-doc.md)（提出物②の元データ）

## 設計コンセプト

販売スライド制作の工程（テーマ整理 → 原稿執筆 → パーツ抽出 → スライド構成 → プレビュー → 出力）を **4 つの区画として 1 画面に並列配置** し、往復コストを最小化する設計。

4 つのデータレイヤー（`sourceDraft` / `extractedParts` / `slidePlan` / `slides`）を並列保持することで、配色だけ・1 枚だけ・原稿だけ・イラストだけ、といった粒度の違う差し替えをフルスケール再生成なしで実現します。

## 4 区ワークスペース

| 区画 | 役割 |
|---|---|
| 1 区 | テーマ作成（テーマ・案件文脈の入力） |
| 2 区 | セクション作成と原稿自動生成（`script-pipeline` スキル起動） |
| 3 区 | 原稿編集とセクション内スライド数の決定 |
| 4 区 | テンプレ設定 → スライド生成 → プレビュー → 採用判断 → ダウンロード |

## 処理パイプライン

### 原稿生成層（`script-pipeline` スキル）

1. **grill-me**: 推奨案つきの選択肢で原稿方針を対話ヒアリング
2. **Claude (Anthropic)**: 販売原稿を執筆
3. **humanize-inline**: AI 特有の言い回しを除去
4. `POST /api/script-draft`: 3 区に自動保存

### スライド生成層（`POST /api/regenerate-slide`）

1 スライド = 1 リクエスト。セクション × スライド数の回数だけ実行：

1. **Claude Opus 4.7**: image-design JSON を生成
2. **OpenAI gpt-image-2**: 1536 × 1024 PNG を生成
3. **Playwright**: HTML → PNG レンダリング

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router) / React 19 / TypeScript 5.8
- **UI**: Tailwind CSS / shadcn/ui (Radix UI) / lucide-react
- **AI**: Anthropic SDK (Claude Opus 4.7) / OpenAI Images API (gpt-image-2)
- **永続化**: Supabase (Postgres + Storage)
- **ビジュアル化**: Playwright (HTML → PNG)
- **デプロイ**: Vercel

## セットアップ

```bash
# 依存インストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して各 API キーを入力

# 開発サーバー起動
npm run dev
# → http://localhost:3000
```

### 必要な環境変数

| 変数名 | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API (原稿生成 / image-design JSON 生成) |
| `OPENAI_API_KEY` | gpt-image-2 (画像生成) |
| `SUPABASE_URL` | Supabase プロジェクト URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サーバー側操作キー |

## ディレクトリ構成

```
app/                Next.js App Router（API routes / ページ）
components/         UI コンポーネント
data/               シードデータ（sales-deck.json など）
docs/               設計ドキュメント・提出物
lib/                Supabase クライアント / 型定義 / ユーティリティ
scripts/            ビルド・キャプチャ用スクリプト
```

## 関連ドキュメント

- [`docs/submission-doc.md`](./docs/submission-doc.md) — 提出物② 言語化ドキュメント
- [`docs/cover-design-and-workflow.md`](./docs/cover-design-and-workflow.md) — 表紙デザイン仕様
- [`docs/character-generation-prompts.md`](./docs/character-generation-prompts.md) — キャラ生成プロンプト
- [`spec.md`](./spec.md) — システム仕様

## ライセンス

採用評価タスクの提出物として作成。再利用は応募者本人の自由とします。
