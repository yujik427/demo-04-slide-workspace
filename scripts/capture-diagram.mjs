#!/usr/bin/env node
/**
 * pipeline-diagram.png を1コマンドで生成する。
 *
 * 内部で Next.js dev server を spawn し、port を自動検出してから
 * Playwright でスクショ → dev server を kill する。
 *
 * 実行（プロジェクトルートから）:
 *   npm run capture-diagram
 *   または
 *   node scripts/capture-diagram.mjs
 *
 * 出力先:
 *   public/diagrams/pipeline-diagram.png
 */

import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const OUT_DIR = path.join(process.cwd(), "public", "diagrams");
const OUT_FILE = path.join(OUT_DIR, "pipeline-diagram.png");
const SELECTOR = "#pipeline-diagram";
const DEV_READY_TIMEOUT_MS = 30_000;

function startDevServer() {
  return new Promise((resolve, reject) => {
    const dev = spawn("npm", ["run", "dev"], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    let port = null;
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        dev.kill();
        reject(new Error(`dev server did not become Ready within ${DEV_READY_TIMEOUT_MS}ms`));
      }
    }, DEV_READY_TIMEOUT_MS);

    const onChunk = (chunk) => {
      const s = chunk.toString();
      const m = s.match(/http:\/\/localhost:(\d+)/);
      if (m && !port) port = m[1];
      if (/Ready in/.test(s) && port) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve({ proc: dev, port });
        }
      }
    };

    dev.stdout.on("data", onChunk);
    dev.stderr.on("data", onChunk);

    dev.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log("→ Starting Next.js dev server ...");
  const { proc, port } = await startDevServer();
  const url = `http://localhost:${port}/diagram`;
  console.log(`  dev server up: ${url}`);

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1200, height: 2400 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    console.log(`→ Opening ${url}`);
    await page.goto(url, { waitUntil: "networkidle" });

    const element = page.locator(SELECTOR);
    await element.waitFor({ state: "visible", timeout: 10_000 });
    await element.screenshot({ path: OUT_FILE, omitBackground: false });

    console.log(`✓ Saved: ${OUT_FILE}`);
  } finally {
    if (browser) await browser.close();
    proc.kill();
    // 念のため、ぶら下がりプロセスを止める
    setTimeout(() => proc.kill("SIGKILL"), 2000).unref();
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
