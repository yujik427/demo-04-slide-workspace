---
name: script-pipeline
description: スライド原稿の grill-me から生成・humanize・Pane2 反映まで一気通貫で行うパイプライン。「スライド原稿作成開始」「原稿生成」「スライド原稿パイプライン」等のトリガーで発動。
---

# script-pipeline — スライド原稿自動生成パイプライン

スライド制作ワークスペース（demo-04-slide-workspace）の3区「原稿エディタ」に、humanize 済みの原稿テキストを章単位で流し込むまでを1セッションで担当する。

## 起動条件

ユーザーがこのスキルを呼ぶのは、ワークスペース2区ヘッダーの「AIで原稿を作る」ボタンを押した直後 or 同セッションで「スライド原稿作成開始」と打ったとき。

## 全体フロー

```
[Step 1] workspace-state-v2.json を読む
   ↓
[Step 2] grill-me で原稿要件を詰める（既存 grill-me スキルを呼ぶ）
   ↓
[Step 3] 確定した要件を briefing として Pane1 へ書き戻す
   ↓
[Step 4] 章ごとに原稿を執筆（メイン Claude が直接書く）
   ↓
[Step 5] humanize 前の原稿を /api/script-draft へ POST（バックアップを作る）
   ↓
[Step 6] humanize-inline スキルを呼んで humanize 済みテキストを得る
   ↓
[Step 7] humanize 済み原稿を /api/script-draft へ POST（上書き）
   ↓
[Step 8] 完了報告
```

## Step 1: workspace-state-v2.json を読む

```bash
cat data/workspace-state-v2.json
```

から以下を取得する:

- `state.navigation.themes.{contentTheme}.subThemes[*]` — 現在のテーマの小テーマと章一覧
- `state.briefing` — 既存の案件・目的（あれば）
- どの小テーマ（subTheme）/ どの章群（chapters）を対象とするか

**現在アクティブなテーマと小テーマの判定**:

workspace-state-v2.json 自体には「アクティブな小テーマ」の情報が完全には載っていない場合がある。その場合は GET /api/workspace-state で `WorkspacePersistedState` も取得し、`contentTheme` と組み合わせて判断する。実装上は次のように扱う:

1. `state.navigation.themes` 配下から `subThemes` を取り出す
2. 各テーマ（lecture / bootcamp）の中で章数が0でない subTheme を候補にする
3. 候補が1つならそれを採用。複数なら最後に更新された subTheme（または `activeSubThemeIdByTheme` 情報を別途取得）を使う

判別がつかなければ、grill-me 直前にユーザーに「どの小テーマの原稿を作りますか？」と1回だけ尋ねる。

## Step 2: grill-me で原稿要件を詰める

既存の grill-me スキルを呼び出して、以下の観点を詰める:

- **ターゲット**: 誰に向けて作る原稿か
- **メイン訴求軸**: スライド全体で打ち出す柱
- **トーン**: 冷静 vs 熱量 / 真面目 vs カジュアル
- **章ごとの狙い**: 各章で何を伝えるか
- **数字・固有名詞**: 使える具体的素材

grill-me の冒頭で、Step 1 で取得した `state.briefing`（既存があれば）を渡し、「Pane1 にはこう書いてある。これでターゲットの認識は合っているか？訴求軸が足りていない章はどれか？」と、足りないスロットから埋める形で対話を始める。

grill-me が「決まったこと/未決/次のステップ」のまとめを出したら、その内容を以下の Markdown 形式に整形する:

```markdown
## 案件・目的

- ターゲット: {ターゲット}
- メイン訴求軸: {訴求軸}
- トーン: {トーン}

### 章ごとの狙い

- 第1章 {章タイトル}: {狙い}
- 第2章 {章タイトル}: {狙い}
- ...

### 使える数字・固有名詞

- {素材1}
- {素材2}

### 確認事項
- 文体: {文体メモ。humanize-inline に渡す}
```

## Step 3: briefing を Pane1 へ書き戻す

workspace-state-v2 API は state を**丸ごと差し替え**する仕様。なので「現在の state を GET → briefing を差し替え → 全体を POST」の3手順を踏む。

```bash
# 1) 現在の state を取得
curl -s http://localhost:3000/api/workspace-state-v2 > /tmp/ws-state.json

# 2) Edit ツールで /tmp/ws-state.json の state.briefing を Step 2 のまとめテキストに書き換える
#    （または jq 等を使うが、ここでは Read + Edit でやる）

# 3) state 全体を POST し直す
curl -s http://localhost:3000/api/workspace-state-v2 \
  -X POST \
  -H 'Content-Type: application/json' \
  -d @- <<'EOF'
{"state": { ... ここに更新後の state 全体 ... }}
EOF
```

**注意点**:

- GET レスポンスは `{ updatedAt, state }` の形。POST するときは `{ state }` だけにする
- `state.briefing` キーは既存スキーマに存在しないため新規追加扱い。追加して POST すれば通る（バリデーションは空 state のみ拒否）
- POST が成功したら、ユーザーに「Pane1 に案件・目的を反映しました。ブラウザでリロードすると2区に表示されます」と1回伝える

## Step 4: 章ごとに原稿を執筆

Step 2 で確定した「章ごとの狙い」をもとに、メイン Claude が章単位でスライド原稿を直接書く。

**執筆の方針**:

- 章ごとに独立して書く（章境界をまたいだ文体一貫性は Step 2 の「トーン」で担保）
- 1章あたり600〜1200字を目安にする（スライド5〜10枚相当）
- Step 2 で挙がった「使える数字・固有名詞」を最低1つは入れる
- AI 定型表現（「〜について解説します」「〜は非常に重要です」など）は避けようとせず、後段の humanize-inline で潰すので構わない

出力形式: `{ chapter_id: "原稿テキスト" }` の章IDマップ（JavaScript オブジェクト or JSON）として手元に保持する。例:

```json
{
  "1": "（第1章: 結論の本文 600〜1200字）",
  "2": "（第2章: それ、本当？の本文 600〜1200字）"
}
```

## Step 5: humanize 前の原稿を POST（バックアップ作成）

script-draft API は `scripts` を**丸ごと差し替え**する仕様。先に humanize 前を POST しておくと、Step 7 の humanize 済み POST のときに自動で `data/script-draft.previous.json` にバックアップが取られる。

```bash
# 1) 現在の script-draft を取得（他章を消さないため）
curl -s http://localhost:3000/api/script-draft > /tmp/script-draft.json

# 2) Read + Edit で Step 4 の章IDマップを統合（既存章があれば上書き、新規章は追加）

# 3) 統合後の scripts を POST
curl -s http://localhost:3000/api/script-draft \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"scripts": { ... 統合後の全章 ... }}'
```

`scripts` は `Record<string, string>` で、キーは章 ID（数値）の文字列。

## Step 6: humanize-inline スキルを呼ぶ

Step 4 の章IDマップを humanize-inline スキルに渡す。humanize-inline は診断 → ユーザー選択 → リライト → 承認 のフローを Terminal 上で進める。

呼び出し時に Step 2 で確定した「トーン」と「文体メモ」を一緒に渡す（humanize-inline 側で文体ヒアリングをスキップできる）。

humanize-inline の出力は、入力と同じ章IDマップ形式で「humanize 済みテキスト」が返ってくる。

## Step 7: humanize 済み原稿を POST（上書き）

Step 6 の出力（humanize 済み章IDマップ）を、Step 5 と同じ手順で /api/script-draft に POST する。

- 既存の scripts に humanize 済み版をマージして POST
- 自動で `script-draft.previous.json` に humanize 前（Step 5 で書いた版）が退避される

POST 成功後、ユーザーに次を伝える:

```
✓ 原稿を反映しました。
- 第1章: humanize 済み（{N1}字 → {M1}字）
- 第2章: humanize 済み（{N2}字 → {M2}字）
- ...

ブラウザの3区（原稿エディタ）をリロードすると最新が表示されます。
humanize 前の原稿は data/script-draft.previous.json に保管されています。
```

## Step 8: 完了報告

最後にユーザーに完了を伝える:

```
✓ パイプライン完了。

[grill-me 結論]
- ターゲット: {…}
- メイン訴求軸: {…}
- トーン: {…}

[反映先]
- Pane1（2区）: 案件・目的を更新
- Pane2（3区）: humanize 済み原稿を {N} 章ぶん反映
- humanize 前: data/script-draft.previous.json

ブラウザでリロードして確認してください。
```

## 失敗時の振る舞い

- どの Step でもエラーが出たら、エラー内容をそのまま Terminal に出して停止する
- 自動リトライはしない
- ユーザーが再度「スライド原稿作成開始」と打てば最初からやり直し（既存 Pane1 / Pane2 はそのまま）

## 注意点

- **dev server が起動している前提**: `npm run dev` で localhost:3000 が立っていないと、curl が失敗する。Step 3 の前に `curl -s http://localhost:3000/api/check-env` 等で疎通確認しても良い
- **章 ID が文字列キー**: JSON のキーは文字列扱いなので、章 ID 1 は `"1"`、章 ID 2 は `"2"` として POST する
- **既存章を消さない**: script-draft は全章まとめ POST 仕様。新規章だけ POST すると他章が消える。必ず GET → マージ → POST の3手順
- **ブラウザは自動更新しない**: 書き込み後、ユーザーが手動でリロードする必要がある旨を毎回伝える
- **同時編集の衝突**: ユーザーが手で原稿を編集中にこのパイプラインを走らせると上書きする。Step 5 の前に「現在編集中の章はありませんか？」を一度確認する

## 起動時の最初の発話例

```
スライド原稿パイプラインを開始します。

まず workspace-state-v2.json を読んで、現在の案件構成を確認します。
```

→ Step 1 に進む。
