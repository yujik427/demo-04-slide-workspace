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
  const dataAttrs = `data-index="${slide.index}" data-type="${escapeHtml(slide.type)}"`;

  if (slide.type === "cover") {
    return `
<section class="slide slide-cover" ${dataAttrs}>
  <div class="brand-row">
    <span class="brand-mark">SLIDE WORKSPACE</span>
    <span class="brand-divider"></span>
    <span class="brand-tag">${escapeHtml(slide.eyebrow ?? "")}</span>
  </div>
  <div class="cover-main">
    <h1 class="cover-title">${escapeHtmlWithBr(slide.title)}</h1>
    ${slide.subtitle ? `<p class="cover-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
    ${
      slide.highlight
        ? `<div class="cover-highlight">${escapeHtml(slide.highlight)}${
            slide.highlight_suffix
              ? `<span class="cover-highlight-suffix">${escapeHtml(slide.highlight_suffix)}</span>`
              : ""
          }</div>`
        : ""
    }
  </div>
  <div class="cover-foot">
    ${slide.body.length ? `<p class="cover-lead">${escapeHtml(slide.body[0])}</p>` : ""}
    ${slide.footer ? `<p class="cover-org">${escapeHtml(slide.footer)}</p>` : ""}
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

  .slide-cover {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: radial-gradient(ellipse at top right, #1c2454 0%, #0a0e27 60%);
    padding: 140px 160px;
    row-gap: 0;
  }

  .slide-cover::after { display: none; }

  .slide-cover::before {
    width: 980px;
    height: 980px;
    top: -360px;
    right: -360px;
    background: radial-gradient(circle, rgba(255, 107, 53, 0.22), transparent 60%);
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 28px;
    color: var(--text-dim);
    font-size: 22px;
    letter-spacing: 0.22em;
    font-weight: 700;
  }

  .brand-mark { color: var(--accent); }
  .brand-divider { width: 56px; height: 2px; background: var(--text-dim); }

  .cover-main {
    display: flex;
    flex-direction: column;
    gap: 56px;
    max-width: 1600px;
  }

  .cover-title {
    font-size: 120px;
    line-height: 1.12;
    font-weight: 900;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .cover-subtitle {
    font-size: 32px;
    color: var(--text-dim);
    margin: 0;
    font-weight: 500;
    line-height: 1.5;
  }

  .cover-highlight {
    display: inline-flex;
    align-items: baseline;
    gap: 20px;
    color: var(--accent);
    font-weight: 900;
    font-size: 64px;
  }

  .cover-highlight-suffix {
    color: var(--text);
    font-size: 32px;
    font-weight: 700;
  }

  .cover-foot { display: flex; flex-direction: column; gap: 16px; }
  .cover-lead { font-size: 28px; color: var(--text); margin: 0; max-width: 1500px; line-height: 1.6; }
  .cover-org { font-size: 22px; color: var(--text-dim); margin: 0; letter-spacing: 0.04em; }

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
