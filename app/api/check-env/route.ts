/**
 * 拡張診断用エンドポイント。
 * process.env 内の API 関連キーをすべて列挙して、ANTHROPIC_API_KEY がどう登録されているか確認する。
 */
import { NextResponse } from "next/server";

export async function GET() {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const openai = process.env.OPENAI_API_KEY;

  // process.env 内の関連キー（API、KEY、SECRET、ANTHROPIC、OPENAI、CLAUDE を含むもの）
  const matchedKeys = Object.keys(process.env)
    .filter((k) =>
      /anthropic|openai|api|key|secret|claude/i.test(k)
    )
    .sort()
    .map((k) => ({
      key: k,
      length: (process.env[k] ?? "").length,
      prefix: (process.env[k] ?? "").slice(0, 12),
    }));

  return NextResponse.json({
    ANTHROPIC_API_KEY: anthropic
      ? {
          length: anthropic.length,
          prefix: anthropic.slice(0, 12),
          suffix: anthropic.slice(-4),
        }
      : "NOT SET (process.env から読めていない)",
    OPENAI_API_KEY: openai
      ? {
          length: openai.length,
          prefix: openai.slice(0, 12),
          suffix: openai.slice(-4),
        }
      : "NOT SET",
    matchedKeys,
    totalEnvKeys: Object.keys(process.env).length,
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
}
