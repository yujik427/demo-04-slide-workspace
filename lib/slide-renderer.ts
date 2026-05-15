import type { Deck, Slide } from "@/lib/slide-types";

function escapeHtml(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtmlWithBr(value: unknown) {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

function renderBody(lines: string[] = []) {
  if (!lines.length) return "";
  return `<ul class="body">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

export function renderSlide(slide: Slide) {
  const preset = slide.colorPresetId ?? "claude-dark";
  const dataAttrs = `data-index="${slide.index}" data-type="${escapeHtml(slide.type)}" data-preset="${escapeHtml(preset)}"`;

  if (slide.type === "cover") {
    const personSrc = slide.personCharacterId
      ? `/characters/person/${slide.personCharacterId}.png`
      : null;
    const toolLogo = slide.toolLogoId ?? "claude-code";

    return `
<section class="slide slide-cover" ${dataAttrs}>
  <div class="cover-bg-pattern"></div>
  <div class="cover-brand-row">
    <span class="cover-brand-mark">◆</span>
    <span class="cover-brand-name">アドネス</span>
  </div>

  ${slide.catchBand ? `
  <div class="cover-catch-wrap">
    <div class="cover-catch-band">
      <span class="cover-catch-text">${escapeHtml(slide.catchBand)}</span>
    </div>
  </div>
  ` : ""}

  <div class="cover-grid">
    <div class="cover-text-zone">
      <h1 class="cover-title">${escapeHtmlWithBr(slide.title)}</h1>
      ${slide.subtitle ? `<p class="cover-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
    </div>
    <div class="cover-character-zone">
      ${personSrc ? `<img class="cover-person" src="${personSrc}" alt="" />` : `<div class="cover-person-placeholder">2.5D 男性キャラ<br/>(画像生成後に配置)</div>`}
    </div>
  </div>

  <div class="cover-tool-row">
    <span class="tool-chip tool-chip-primary">${escapeHtml(toolLogo === "claude-code" ? "Claude Code" : toolLogo)}</span>
    <span class="tool-chip">Cursor</span>
    <span class="tool-chip">GitHub</span>
  </div>
</section>`;
  }

  if (slide.type === "cta") {
    return `
<section class="slide slide-cta" ${dataAttrs}>
  <div class="cta-main">
    <h2 class="cta-title">${escapeHtmlWithBr(slide.title)}</h2>
    ${slide.subtitle ? `<p class="cta-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
    ${
      slide.highlight
        ? `<p class="cta-highlight">${escapeHtml(slide.highlight)}${
            slide.highlight_suffix
              ? `<span class="cta-highlight-suffix">${escapeHtml(slide.highlight_suffix)}</span>`
              : ""
          }</p>`
        : ""
    }
    <div class="cta-button">${escapeHtml(slide.cta ?? "次へ進む")}</div>
    ${slide.body.length ? `<p class="cta-note">${escapeHtml(slide.body.join("  /  "))}</p>` : ""}
  </div>
  ${slide.footer ? `<div class="slide-foot">${escapeHtml(slide.footer)}</div>` : ""}
</section>`;
  }

  return `
<section class="slide slide-${escapeHtml(slide.type)}" ${dataAttrs}>
  <div class="slide-body">
    <h2 class="slide-title">${escapeHtmlWithBr(slide.title)}</h2>
    ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
    ${
      slide.highlight
        ? `<p class="slide-highlight"><span>${escapeHtml(slide.highlight)}</span>${
            slide.highlight_suffix
              ? `<span class="slide-highlight-suffix">${escapeHtml(slide.highlight_suffix)}</span>`
              : ""
          }</p>`
        : ""
    }
    ${renderBody(slide.body)}
  </div>
  ${slide.footer ? `<div class="slide-foot">${escapeHtml(slide.footer)}</div>` : ""}
</section>`;
}

function renderDeckStyles() {
  return `
  :root {
    --bg: #0a0e27;
    --bg-light: #f5f5f7;
    --text: #f5f5f7;
    --text-dim: rgba(245, 245, 247, 0.7);
    --accent: #ff6b35;
    --slide-w: 1920px;
    --slide-h: 1080px;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #050714;
    color: var(--text);
    font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .deck {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 40px 0;
  }

  .deck.single {
    width: var(--slide-w);
    height: var(--slide-h);
    gap: 0;
    padding: 0;
    overflow: hidden;
  }

  .slide {
    position: relative;
    width: var(--slide-w);
    height: var(--slide-h);
    padding: 140px 160px;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;
    row-gap: 64px;
  }

  .slide::before {
    content: "";
    position: absolute;
    top: -260px;
    right: -260px;
    width: 720px;
    height: 720px;
    background: radial-gradient(circle, rgba(255, 107, 53, 0.18), transparent 65%);
    pointer-events: none;
  }

  .slide::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 160px;
    width: 80px;
    height: 6px;
    background: var(--accent);
  }

  .slide-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 56px;
    max-width: 1520px;
  }

  .slide-title {
    font-size: 88px;
    line-height: 1.22;
    font-weight: 900;
    letter-spacing: -0.01em;
    margin: 0;
    max-width: 1500px;
  }

  .slide-subtitle {
    font-size: 32px;
    line-height: 1.6;
    color: var(--text-dim);
    font-weight: 500;
    margin: 0;
    max-width: 1400px;
  }

  .slide-highlight { margin: 0; }

  .slide-highlight span {
    display: inline-block;
    font-weight: 900;
    font-size: 160px;
    line-height: 1;
    color: var(--accent);
    letter-spacing: -0.02em;
  }

  .slide-highlight-suffix {
    margin-left: 16px;
    color: var(--text);
    font-size: 40px;
    font-weight: 700;
    vertical-align: baseline;
  }

  .body {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .body li {
    font-size: 32px;
    line-height: 1.6;
    color: var(--text);
    padding-left: 36px;
    position: relative;
    font-weight: 500;
  }

  .body li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 22px;
    width: 18px;
    height: 3px;
    background: var(--accent);
  }

  .slide-foot {
    color: var(--text-dim);
    font-size: 22px;
    letter-spacing: 0.02em;
    align-self: end;
  }

  /* ===== Cover (Slide 1) — スキルプラス フォーマット模倣 ===== */
  .slide-cover {
    position: relative;
    display: block;
    padding: 0;
    row-gap: 0;
    background: var(--cover-bg);
    color: var(--cover-text);
    overflow: hidden;
  }

  .slide-cover::after { display: none; }
  .slide-cover::before { display: none; }

  /* 配色プリセット: 紫グラデ(濃いめ) */
  .slide-cover[data-preset="claude-dark"] {
    --cover-bg: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 35%, #8b5cf6 70%, #7c3aed 100%);
    --cover-text: #0f0a2e;
    --cover-subtitle-color: #1e1b4b;
    --cover-catch-bg: #fde047;
    --cover-catch-text: #0f0a2e;
    --cover-pattern: rgba(255, 255, 255, 0.18);
    --cover-pattern-strong: rgba(255, 255, 255, 0.32);
    --cover-chip-bg: #ffffff;
    --cover-chip-text: #1e1b4b;
    --cover-character-bg: #f5f3ff;
  }

  .slide-cover[data-preset="claude-light"] {
    --cover-bg: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
    --cover-text: #1e1b4b;
    --cover-subtitle-color: #78350f;
    --cover-catch-bg: #d97757;
    --cover-catch-text: #ffffff;
    --cover-pattern: rgba(217, 119, 87, 0.08);
    --cover-chip-bg: #ffffff;
    --cover-chip-text: #1e1b4b;
    --cover-character-bg: #ffffff;
  }

  /* 背景パターン(製品UIを抽象化した格子+ドット) */
  .cover-bg-pattern {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 80% 30%, var(--cover-pattern) 2px, transparent 3px),
      radial-gradient(circle at 20% 70%, var(--cover-pattern) 2px, transparent 3px),
      linear-gradient(135deg, var(--cover-pattern) 1px, transparent 1px);
    background-size: 60px 60px, 80px 80px, 200px 200px;
    pointer-events: none;
    z-index: 0;
  }

  /* 左上ブランドマーク */
  .cover-brand-row {
    position: absolute;
    top: 60px;
    left: 80px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.85);
    padding: 14px 28px;
    border-radius: 60px;
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
  }

  .cover-brand-mark {
    color: #7c3aed;
    font-size: 36px;
    line-height: 1;
  }

  .cover-brand-name {
    color: #1e1b4b;
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  /* 黄色キャッチ帯(吹き出し型) */
  .cover-catch-wrap {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    max-width: 1280px;
  }

  .cover-catch-band {
    background: var(--cover-catch-bg);
    color: var(--cover-catch-text);
    padding: 22px 80px;
    font-weight: 900;
    font-size: 42px;
    letter-spacing: 0.01em;
    line-height: 1.25;
    text-align: center;
    /* 両端を三角に切り取って吹き出し型 */
    clip-path: polygon(40px 0, calc(100% - 40px) 0, 100% 50%, calc(100% - 40px) 100%, 40px 100%, 0 50%);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }

  .cover-catch-text {
    display: inline-block;
  }

  /* メイン領域: 左テキスト/右キャラ */
  .cover-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1.2fr 0.9fr;
    gap: 60px;
    padding: 220px 100px 200px;
    align-items: center;
    min-height: 100%;
  }

  .cover-text-zone {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .cover-title {
    font-size: 124px;
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -0.025em;
    color: var(--cover-text);
    margin: 0;
    text-shadow: 0 4px 16px rgba(255, 255, 255, 0.4);
  }

  .cover-subtitle {
    font-size: 40px;
    line-height: 1.4;
    color: var(--cover-subtitle-color);
    font-weight: 800;
    margin: 0;
    background: rgba(255, 255, 255, 0.7);
    padding: 14px 32px;
    border-radius: 12px;
    display: inline-block;
    width: fit-content;
  }

  .cover-character-zone {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 100%;
  }

  .cover-person {
    width: 100%;
    max-height: 760px;
    object-fit: contain;
    filter: drop-shadow(0 24px 48px rgba(76, 29, 149, 0.3));
  }

  .cover-person-placeholder {
    width: 420px;
    height: 620px;
    background: var(--cover-character-bg);
    border: 3px dashed rgba(124, 58, 237, 0.45);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7c3aed;
    font-size: 26px;
    font-weight: 800;
    text-align: center;
    line-height: 1.6;
    padding: 24px;
    box-shadow: 0 24px 48px rgba(76, 29, 149, 0.25);
  }

  /* 下部ツールロゴ(チップ並び) */
  .cover-tool-row {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(255, 255, 255, 0.92);
    padding: 18px 32px;
    border-radius: 100px;
    box-shadow: 0 12px 32px rgba(76, 29, 149, 0.2);
  }

  .tool-chip {
    color: var(--cover-chip-text);
    font-size: 30px;
    font-weight: 900;
    letter-spacing: -0.01em;
    padding: 8px 24px;
    border-radius: 60px;
    background: transparent;
  }

  .tool-chip-primary {
    background: linear-gradient(135deg, #d97757 0%, #f97316 100%);
    color: #ffffff;
  }

  .slide-cta {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: radial-gradient(circle at center, #1c2454 0%, #0a0e27 70%);
    row-gap: 0;
  }

  .cta-main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 48px;
  }

  .cta-title {
    font-size: 96px;
    line-height: 1.18;
    font-weight: 900;
    margin: 0;
    letter-spacing: -0.02em;
    max-width: 1600px;
  }

  .cta-subtitle {
    font-size: 32px;
    color: var(--text-dim);
    margin: 0;
    max-width: 1400px;
    line-height: 1.6;
  }

  .cta-highlight {
    font-size: 40px;
    color: var(--accent);
    font-weight: 900;
    margin: 0;
  }

  .cta-highlight-suffix {
    margin-left: 12px;
    color: var(--text);
    font-size: 28px;
    font-weight: 700;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    gap: 18px;
    padding: 28px 72px;
    background: var(--accent);
    color: #0a0e27;
    font-size: 40px;
    font-weight: 900;
    border-radius: 8px;
    letter-spacing: 0.04em;
    box-shadow: 0 16px 40px rgba(255, 107, 53, 0.35);
  }

  .cta-note { font-size: 22px; color: var(--text-dim); margin: 0; }
  .slide-value_compare .slide-highlight span { font-size: 144px; }
`;
}

export function renderDeckHtml(deck: Deck) {
  const slidesHtml = deck.slides.map(renderSlide).join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(deck.metadata.title ?? "Slide Deck")}</title>
<style>${renderDeckStyles()}</style>
</head>
<body>
  <div class="deck">
    ${slidesHtml}
  </div>
</body>
</html>`;
}

export function renderSingleSlideHtml(slide: Slide, title = "Slide Preview") {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<style>${renderDeckStyles()}</style>
</head>
<body>
  <div class="deck single">
    ${renderSlide(slide)}
  </div>
</body>
</html>`;
}
