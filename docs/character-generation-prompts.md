# キャラAI生成プロンプト

> 表紙キービジュアル用のキャラ画像をAI生成するための **プロンプト原本**。
> 事前にこのプロンプトで複数バリエ生成し、`public/characters/` にライブラリ化する。

## 1. 人物キャラ(スキルプラス調)

### 用途
表紙右側に配置する、副業会社員ターゲット向けの「親しみやすい先輩」風人物イラスト。

### 推奨ツール
- Imagen 4 / DALL-E 3 / Midjourney v6
- 透過PNG出力可能なものを優先(背景は別途HTMLで合成するため)

### プロンプト (英語、推奨)

```
Semi-realistic 2.5D digital illustration of a young Japanese man, late 20s to early 30s, 
matching the style of modern Japanese online learning course thumbnails.
Clean modern haircut, dark hair, friendly confident smile, approachable expression.
Wearing a casual but neat outfit — white shirt or light hoodie or simple jacket.
Upper body shot, three-quarter view, facing slightly toward viewer.
Confident hand gesture: thumbs up, open palm, or pointing forward.
Soft ambient lighting with subtle warm rim light to lift the figure from a dark background.
Color palette: muted warm tones (skin and clothing) that contrast against dark navy backgrounds.
Isolated on transparent background, no scenery, no environmental elements.
Mood: trustworthy, "I succeeded with this, you can too" — like a peer mentor, not a teacher.
Style: clean digital illustration, smooth shading, NOT photorealistic, NOT anime/manga, 
NOT exaggerated cartoon, NOT 3D render.
```

### バリエ作成のポイント
| バリエ軸 | 値の例 |
|---|---|
| 髪型 | short / medium / glasses付き |
| 服装 | white shirt / hoodie / blazer |
| ポーズ | thumbs up / open palm / pointing forward / arms crossed |
| 表情 | smile (mouth open) / smile (mouth closed) / confident calm |
| 年齢感 | 28前後 / 33前後 |

目安: **5-8バリエ** 生成 → ライブラリ化

### 注意点
- **特定の実在人物に似せない**(肖像権)
- **anime/manga スタイルは避ける**(情報商材臭が出てトーン崩壊)
- **背景は必ず透過**(HTMLテンプレ側でダーク背景に合成する設計のため)

---

## 2. 8bitピクセルキャラ(Clawdインスパイア)

> **判断記録(2026-05-14)**: 商標リスク観点でオリジナル雲ロボを推奨したが、オーナー判断により「Clawdに似たキャラ」採用。リスクはオーナーが認識した上での選択。アドネス自身もClawdを商用利用している実態あり。

### 用途
表紙のサブキャラとして、人物キャラの近くに小さく配置。Claude Code公式マスコット Clawd(8bitピクセルクラブ)のスタイルを踏襲。

### 設計コンセプト
- **モチーフ**: 8bitピクセルのカニ風キャラ(Clawd系統)
- **形状**: 正面向きの甲羅、両サイドにハサミ脚、シンプルなピクセルの目
- **色**: Anthropic公式オレンジ #d97757 を主色(Clawd初期版に近い)
- **解像度**: 32x32 または 64x64 ピクセルグリッド

### プロンプト (英語、推奨)

```
8-bit pixel art mascot character on transparent background.
Form: a cute pixel art crab/crustacean character, front-facing, 
inspired by retro NES/Game Boy mascots — round body/shell, 
two small claw-arms on each side, two tiny pixel eyes, simple cheerful expression.
Style: retro pixel art, flat 2D, no gradient shading, 
clear pixel grid visible, limited color palette (4-6 colors max).
Primary color: warm orange #d97757 (Anthropic brand orange).
Outline: dark navy #0a0e27.
Accent color: soft cream #faf9f5 for shell highlights.
Resolution: rendered at 64x64 pixel grid, exported at higher resolution 
with crisp nearest-neighbor scaling (pixelated edges preserved).
Pose variations needed: idle/waving claw/coding/thinking/celebrating.
NOT 3D, NOT smooth illustration, NOT vector — strictly pixelated retro game style.
```

### バリエ作成のポイント
| バリエ軸 | 値の例 |
|---|---|
| ポーズ | idle / waving claw / coding (with mini keyboard) / thinking / celebrating |
| 表情 | smile / surprised / focused (^_^) |
| アクセサリ | なし / 小さな旗 / 小さなキーボード / ヘッドホン |

目安: **5バリエ** 生成 → ライブラリ化

### 注意点
- **Clawd公式の "You're Absolutely Right" フラグ等、固有要素の完全模倣は避ける**(完全コピーは商標衝突のリスクが上がる)
- **Anthropic 公式ロゴ(星型)をキャラに埋め込まない**
- **"Claude" や "Anthropic" の文字をキャラに描かない**
- 商標リスクの最終責任はオーナー判断による(2026-05-14)

---

## 3. ファイル保管ルール

| パス | 内容 |
|---|---|
| `public/characters/person/` | 人物キャラのバリエPNG(透過) |
| `public/characters/pixel/` | ピクセルキャラのバリエPNG(透過) |
| `public/characters/index.json` | キャラ一覧メタデータ(ファイル名・バリエ名・推奨用途) |

### `index.json` 構造案

```json
{
  "person": [
    { "id": "person-01", "file": "person/person-01.png", "label": "笑顔・親指立て", "variant": { "outfit": "white-shirt", "pose": "thumbs-up" } },
    { "id": "person-02", "file": "person/person-02.png", "label": "穏やか・指さし", "variant": { "outfit": "hoodie", "pose": "pointing" } }
  ],
  "pixel": [
    { "id": "pixel-01", "file": "pixel/pixel-01.png", "label": "雲ロボ・手振り", "variant": { "pose": "waving" } },
    { "id": "pixel-02", "file": "pixel/pixel-02.png", "label": "雲ロボ・コーディング", "variant": { "pose": "coding" } }
  ]
}
```

ワークスペース右ペインの「イラスト候補」UI から、このindex.jsonを読んで選択肢を表示する設計。

---

**作成**: 2026-05-14
**次のステップ**: 上記プロンプトで実際に画像生成 → 採用候補を選別 → `public/characters/` に配置 → index.jsonを書く
