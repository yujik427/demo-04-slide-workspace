/**
 * ローカルの data/*.json と public/regenerated/* を Supabase に移行する一発スクリプト。
 *
 * 実行方法:
 *   node --env-file=.env.local scripts/migrate-to-supabase.mjs
 *
 * 必要な環境変数:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.");
  console.error("Run with: node --env-file=.env.local scripts/migrate-to-supabase.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ROW_ID = "default";
const STORAGE_BUCKET = "regenerated";
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REGEN_DIR = path.join(ROOT, "public", "regenerated");

async function safeReadJson(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.warn(`  skip (not readable): ${filePath}`);
    return null;
  }
}

/** Step 1: state 系 3 ファイルを各テーブルへ upsert */
async function migrateStateFiles() {
  console.log("=== Migrating state JSON files ===");

  const targets = [
    {
      file: "workspace-state-v2.json",
      table: "workspace_state_v2",
      column: "state",
      extract: (json) => json?.state ?? json,
    },
    {
      file: "script-draft.json",
      table: "script_draft",
      column: "scripts",
      extract: (json) => json?.scripts ?? json,
    },
    {
      file: "workspace-state.json",
      table: "workspace_state",
      column: "state",
      extract: (json) => json?.state ?? json,
    },
  ];

  for (const t of targets) {
    const filePath = path.join(DATA_DIR, t.file);
    const json = await safeReadJson(filePath);
    if (!json) continue;
    const value = t.extract(json);
    if (value === null || value === undefined) {
      console.log(`  ${t.file}: empty, skip`);
      continue;
    }
    const { error } = await supabase
      .from(t.table)
      .upsert({
        id: ROW_ID,
        [t.column]: value,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.error(`  ${t.file} -> ${t.table}: FAILED`, error.message);
    } else {
      console.log(`  ${t.file} -> ${t.table}: OK`);
    }
  }
}

/** Step 2: public/regenerated/* の中身をすべて Storage にアップロード */
async function migrateImages() {
  console.log("=== Migrating images to Storage ===");
  let dirs;
  try {
    dirs = await readdir(REGEN_DIR);
  } catch {
    console.log("  No public/regenerated directory, skip");
    return [];
  }

  const uploaded = [];

  for (const dir of dirs) {
    const dirPath = path.join(REGEN_DIR, dir);
    const stats = await stat(dirPath).catch(() => null);
    if (!stats || !stats.isDirectory()) continue;

    const files = await readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const objectPath = `${dir}/${file}`;
      const buffer = await readFile(filePath);
      const contentType =
        file.endsWith(".png") ? "image/png" :
        file.endsWith(".jpg") || file.endsWith(".jpeg") ? "image/jpeg" :
        file.endsWith(".json") ? "application/json" :
        "application/octet-stream";

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, buffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error(`  ${objectPath}: FAILED ${error.message}`);
      } else {
        uploaded.push(objectPath);
        console.log(`  ${objectPath}: OK`);
      }
    }
  }
  console.log(`  Uploaded ${uploaded.length} files`);
  return uploaded;
}

/** Step 3: workspace_state テーブル内の imagePath を Supabase Storage URL に書き換え */
async function rewriteImagePaths() {
  console.log("=== Rewriting imagePath to Supabase Storage URL ===");

  const supabasePublicBase = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;

  function rewrite(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "string") {
      // 旧形式: "/regenerated/1234/slide-1.png"
      if (obj.startsWith("/regenerated/")) {
        const objectPath = obj.replace(/^\/regenerated\//, "");
        return `${supabasePublicBase}/${objectPath}`;
      }
      return obj;
    }
    if (Array.isArray(obj)) return obj.map(rewrite);
    if (typeof obj === "object") {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = rewrite(v);
      }
      return out;
    }
    return obj;
  }

  // workspace_state テーブル (UI ステート: 生成スライドの imagePath が入る)
  const { data, error } = await supabase
    .from("workspace_state")
    .select("state")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error || !data) {
    console.error("  workspace_state read failed", error?.message);
    return;
  }

  const rewritten = rewrite(data.state);
  const { error: upError } = await supabase
    .from("workspace_state")
    .upsert({
      id: ROW_ID,
      state: rewritten,
      updated_at: new Date().toISOString(),
    });
  if (upError) {
    console.error("  workspace_state rewrite failed", upError.message);
  } else {
    console.log("  workspace_state imagePath rewritten: OK");
  }
}

async function main() {
  console.log(`Migrating to: ${SUPABASE_URL}`);
  console.log("");
  await migrateStateFiles();
  console.log("");
  await migrateImages();
  console.log("");
  await rewriteImagePaths();
  console.log("");
  console.log("All done.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
