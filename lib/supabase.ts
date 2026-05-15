import { createClient, SupabaseClient } from "@supabase/supabase-js";

// サーバー側 (API route / RSC) からのみ使う Supabase クライアント。
// service_role キーを使うため、絶対にクライアントバンドルに含めないこと。

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables"
    );
  }

  cachedClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

// 単一WS共有運用なので、すべてのテーブルで id = "default" 固定の1行を使う。
export const WORKSPACE_ROW_ID = "default";

// 生成画像を保存する Storage バケット名
export const STORAGE_BUCKET = "regenerated";
