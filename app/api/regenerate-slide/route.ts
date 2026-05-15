/**
 * /api/regenerate-slide
 *
 * Next.js の API Route 内で完結する「Claude → OpenAI gpt-image-2」の連動エージェント。
 * 外部スクリプト（spawn）は使わない。全部 fetch で完結（ADS 第5講義方針）。
 *
 * フロー:
 *   1. Claude Opus 4.7 で image-design 要素を生成（原稿・テンプレ・イラストを統合）
 *   2. 配色テーマに応じた style_description を組み立て
 *   3. OpenAI gpt-image-2 を fetch で叩く
 *   4. 返ってきた base64 を public/regenerated/<ts>/slide-1.png に保存
 *   5. パス＋メタを返す
 *
 * リクエスト:
 *   {
 *     sectionTitle: string,
 *     script: string,
 *     template: string,
 *     illustration: string,
 *     colorTheme: "lecture" | "bootcamp"
 *   }
 *
 * レスポンス:
 *   { imagePath: "/regenerated/<ts>/slide-1.png", imageSpec, timings, usage }
 *   or { error: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

// .env.local を直接読む（Claude Code 環境では ANTHROPIC_API_KEY="" が
// シェルに事前設定され、Next.js の dotenv が上書きしないため、回避策）
async function readEnvLocal(): Promise<Record<string, string>> {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = await readFile(envPath, "utf-8");
    const env: Record<string, string> = {};
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

async function getEnv(key: string): Promise<string | undefined> {
  // process.env が空文字列の場合は .env.local から直接読む
  const fromProcess = process.env[key];
  if (fromProcess && fromProcess.length > 0) return fromProcess;
  const fileEnv = await readEnvLocal();
  return fileEnv[key];
}

// ─── 配色テーマ定義 ─────────────────────────────────────────────
const COLOR_THEMES = {
  bootcamp: {
    name: "Claude Code",
    style_base: "stripe",
    style_description:
      "Claude Code aesthetic. STRICT COLOR PALETTE: background #0A0E27 (dark navy), main text #F5F5F7 (off-white), accent #FF6B35 (warm orange). Extra-bold sans-serif typography (Inter / Noto Sans JP). Generous whitespace 40%+, one focal point per slide. Orange accent applied ONLY to hero numbers and CTA elements—keep accent area under 10% of total canvas. NO gradients, NO 3D, NO glossy effects. Flat design and line art only.",
  },
  lecture: {
    name: "講義スライド",
    style_base: "apple",
    style_description:
      "Lecture slide aesthetic. STRICT COLOR PALETTE: background #FFFFFF (white), main text #0F172A (deep navy), accent #0891B2 (cyan blue). Clean sans-serif typography (Inter / Noto Sans JP). Generous whitespace 40%+, one focal point per slide. Cyan accent applied ONLY to hero numbers and key elements—keep accent area under 10% of total canvas. NO gradients, NO 3D. Flat design and line art only.",
  },
} as const;

// ─── 共通デザインルール（cc-slides の DESIGN_RULES 移植） ─────────
const DESIGN_RULES = `=== DESIGN PHILOSOPHY ===
A good image causes an INTENDED CHANGE in the viewer's mind with MINIMUM COGNITIVE LOAD.

=== ABSOLUTE RULES ===
- TEXT ACCURACY IS #1 PRIORITY. Copy every character EXACTLY from "TEXT TO RENDER".
- NEVER use emoji anywhere on the image.
- Render ONLY the listed text. Do NOT add extra labels or numbers.
- ALL Japanese text must be perfectly legible.

=== ILLUSTRATION STYLE ===
- FLAT DESIGN + LINE ART ONLY. NO 3D, isometric, glossy, or realistic rendering.

=== TYPOGRAPHY ===
- CLEAN TYPOGRAPHY ONLY. No outlines, shadows, strokes, or 3D effects.
- Title: extra-bold, large, high contrast.

=== LAYOUT ===
- Strict GRID system. Generous margins (10%+ each side).
- ONE clear focal point per image.
- Whitespace is a design element — at least 40% empty space.

=== VISUAL DISCIPLINE ===
- NO decorative gradients, curves, swooshes, or wave shapes.
- NO rounded rectangle cards, pill badges, button shapes, or card grids with shadows.
- Think "Apple keynote slide" — minimal, grid-aligned, breathable.`;

// ─── Claude システムプロンプト ─────────────────────────────────
const CLAUDE_SYSTEM_PROMPT = `あなたは販売スライド設計者です。
入力された原稿・テンプレ・配色・イラストを統合し、cc-slides 形式の image-design "images[]" 配列の1要素を生成します。

# 出力フォーマット（JSON のみ、前置き禁止）

{
  "purpose": "<このスライドの役割・レイアウト指示。テンプレとイラスト指定を反映、200字以内>",
  "text": {
    "main": "<メインタイトル、20文字以内、結論文型、説明文型禁止>",
    "sub": "<サブタイトル、25文字以内>",
    "other": ["<本文行1、42文字以内>", "<本文行2>", "<本文行3>"]
  }
}

# 事実準拠ルール

入力原稿の事実のみ使用する。以下は禁止：
- 情景描写、感情・心情、人物・関係、属性・性格、時系列の詳細、動機・思考、主観評価、派生フレーズ

# 数字の混同を絶対にしない

- 「達成チーム4人」と「会社の人数」は別物（会社は100名体制）
- 「初月売上4,500万円」の「初月」を消さない
- 「営業初月1,000万円の案件」（単価）と「初月売上4,500万円」（総売上）を混同しない

# 「『案件探索ツール』」は必ず鉤括弧つき

# title のキレ味

- 結論文または体言止め
- 「、」が2つ以上は説明文 → 書き直す
- 要素列挙禁止

出力は JSON オブジェクトのみ。前置き・解説・コードフェンスは不要。`;

// ─── OpenAI 用プロンプト構築（cc-slides の buildPrompt 移植） ─────
function buildImagePrompt(
  imageSpec: { purpose: string; text: { main: string; sub?: string; other?: string[] } },
  styleDescription: string
): string {
  const main = imageSpec.text?.main || "";
  const sub = imageSpec.text?.sub || "";
  const other = imageSpec.text?.other || [];

  let textSection = `Main title: ${main}`;
  if (sub) textSection += `\nSubtitle: ${sub}`;
  if (other.length > 0) {
    textSection += `\nOther elements (arrange HORIZONTALLY): ${other.map((t, i) => `${i + 1}. ${t}`).join("  |  ")}`;
  }

  return `Generate a single image (16:9 (1920x1080px)).

${DESIGN_RULES}

=== PURPOSE ===
${imageSpec.purpose}

=== TEXT TO RENDER (render ONLY these exact strings) ===
${textSection}

=== VISUAL STYLE ===
Unified style: ${styleDescription}
Design as a professional INFOGRAPHIC. Use diagrams, flow arrows, icons, charts where appropriate.
Visual elements should occupy 40-50% of the image.

=== PRESET (video-slide) ===
- Design for 10-20 seconds viewing time per slide
- Keep bottom 8% clear for caption area`;
}

// ─── メイン処理 ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      sectionTitle,
      script,
      template,
      illustration,
      colorTheme = "bootcamp",
    } = body as {
      sectionTitle: string;
      script: string;
      template: string;
      illustration: string;
      colorTheme: "lecture" | "bootcamp";
    };

    if (!sectionTitle || !script) {
      return NextResponse.json(
        { error: "sectionTitle and script are required" },
        { status: 400 }
      );
    }

    const themeConfig = COLOR_THEMES[colorTheme] ?? COLOR_THEMES.bootcamp;

    // === Step 1: Claude Opus 4.7 で image-design 要素を生成 ===
    const anthropicKey = await getEnv("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not set. Add it to .env.local" },
        { status: 500 }
      );
    }

    const claudeUserMessage = `# 章タイトル
${sectionTitle}

# 選択中テンプレート
${template}

# 選択中イラスト
${illustration}

# 配色テーマ
${themeConfig.name}

# 章の原稿
${script}`;

    const client = new Anthropic({ apiKey: anthropicKey });
    const claudeStart = Date.now();
    const claudeResponse = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2000,
      system: CLAUDE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: claudeUserMessage }],
    });
    const claudeElapsed = Date.now() - claudeStart;

    const claudeText = claudeResponse.content.find((b) => b.type === "text");
    const claudeRaw =
      claudeText && "text" in claudeText ? claudeText.text.trim() : "";

    // JSON 抽出
    let cleanJson = claudeRaw;
    const fenced = cleanJson.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (fenced) {
      cleanJson = fenced[1].trim();
    } else {
      const firstBrace = cleanJson.indexOf("{");
      const lastBrace = cleanJson.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleanJson = cleanJson.slice(firstBrace, lastBrace + 1);
      }
    }

    let imageSpec: {
      purpose: string;
      text: { main: string; sub?: string; other?: string[] };
    };
    try {
      imageSpec = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json(
        {
          error: "Claude returned invalid JSON",
          raw: claudeRaw.slice(0, 500),
        },
        { status: 500 }
      );
    }

    // === Step 2: OpenAI gpt-image-2 で画像生成 ===
    const openaiKey = await getEnv("OPENAI_API_KEY");
    if (!openaiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not set. Add it to .env.local (cc-slides の .env から OPENAI_API_KEY をコピー)",
        },
        { status: 500 }
      );
    }

    const imagePrompt = buildImagePrompt(imageSpec, themeConfig.style_description);
    const imageStart = Date.now();
    const openaiRes = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-2",
          prompt: imagePrompt,
          size: "1536x1024",
          quality: "medium",
          n: 1,
        }),
      }
    );

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return NextResponse.json(
        {
          error: `OpenAI API error (${openaiRes.status})`,
          detail: errText.slice(0, 300),
        },
        { status: 500 }
      );
    }

    const openaiData = await openaiRes.json();
    const b64 = openaiData?.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No image in OpenAI response" },
        { status: 500 }
      );
    }
    const imageElapsed = Date.now() - imageStart;

    // === Step 3: PNG として Supabase Storage にアップロード ===
    const timestamp = Date.now();
    const supabase = getSupabaseAdmin();
    const pngObjectPath = `${timestamp}/slide-1.png`;
    const designObjectPath = `${timestamp}/image-design.json`;

    const { error: pngUploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(pngObjectPath, Buffer.from(b64, "base64"), {
        contentType: "image/png",
        upsert: false,
      });

    if (pngUploadError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${pngUploadError.message}` },
        { status: 500 }
      );
    }

    // 設計図（image-design.json）も保存（再現性のため）
    const designJson = JSON.stringify(
      {
        type: "single",
        style_base: themeConfig.style_base,
        style_description: themeConfig.style_description,
        preset: "video-slide",
        images: [imageSpec],
        meta: {
          sectionTitle,
          template,
          illustration,
          colorTheme,
          generatedAt: new Date(timestamp).toISOString(),
        },
      },
      null,
      2
    );
    await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(designObjectPath, designJson, {
        contentType: "application/json",
        upsert: false,
      });

    // === Step 4: 公開 URL とメタを返す ===
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(pngObjectPath);

    return NextResponse.json({
      imagePath: urlData.publicUrl,
      imageSpec,
      themeName: themeConfig.name,
      timings: {
        total: Date.now() - startTime,
        claude: claudeElapsed,
        openai: imageElapsed,
      },
      usage: claudeResponse.usage,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
