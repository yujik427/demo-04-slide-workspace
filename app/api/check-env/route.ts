/**
 * 拡張診断用エンドポイント。
 * process.env の API 関連キーを列挙 + Supabase 接続テスト。
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const anthropic = process.env.ANTHROPIC_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Supabase 接続テスト（実際にテーブルを叩いてみる）
  let connectionTest: unknown = null;
  if (sbUrl && sbKey) {
    try {
      const sb = createClient(sbUrl, sbKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await sb
        .from("workspace_state_v2")
        .select("id, updated_at")
        .eq("id", "default")
        .maybeSingle();
      connectionTest = {
        ok: !error,
        error: error
          ? {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            }
          : null,
        hasRow: !!data,
        rowUpdatedAt: data?.updated_at ?? null,
      };
    } catch (e) {
      const err = e as Error;
      connectionTest = {
        ok: false,
        thrown: err.message ?? String(e),
        stack: err.stack?.split("\n").slice(0, 4),
      };
    }
  } else {
    connectionTest = "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing, skipped";
  }

  return NextResponse.json({
    ANTHROPIC_API_KEY: anthropic
      ? { length: anthropic.length, prefix: anthropic.slice(0, 12), suffix: anthropic.slice(-4) }
      : "NOT SET",
    OPENAI_API_KEY: openai
      ? { length: openai.length, prefix: openai.slice(0, 12), suffix: openai.slice(-4) }
      : "NOT SET",
    SUPABASE_URL: sbUrl
      ? {
          length: sbUrl.length,
          value: sbUrl,
          hasTrailingNewline: sbUrl.endsWith("\n") || sbUrl.endsWith("\r"),
          hasLeadingWhitespace: sbUrl !== sbUrl.trimStart(),
          hasTrailingWhitespace: sbUrl !== sbUrl.trimEnd(),
        }
      : "NOT SET",
    SUPABASE_SERVICE_ROLE_KEY: sbKey
      ? {
          length: sbKey.length,
          prefix: sbKey.slice(0, 15),
          suffix: sbKey.slice(-8),
          hasTrailingNewline: sbKey.endsWith("\n") || sbKey.endsWith("\r"),
          hasLeadingWhitespace: sbKey !== sbKey.trimStart(),
          hasTrailingWhitespace: sbKey !== sbKey.trimEnd(),
          looksLikeJWT: sbKey.startsWith("eyJ"),
          jwtSegments: sbKey.split(".").length,
        }
      : "NOT SET",
    connectionTest,
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
}
