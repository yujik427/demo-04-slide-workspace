"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import salesDeckJson from "@/data/sales-deck.json";
import { Button } from "@/components/ui/button";

type Theme = "lecture" | "bootcamp";
type ContentTheme = "lecture" | "bootcamp";
type ColorTheme = "lecture" | "bootcamp";

type SalesSlide = {
  index: number;
  type: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  highlight: string | null;
  highlight_suffix: string | null;
  body: string[];
  footer: string;
  cta: string | null;
  narration: string;
};

type SalesDeck = {
  metadata: {
    title: string;
    audience: string;
    tone: string;
    theme: string;
  };
  slides: SalesSlide[];
};

const salesDeck = salesDeckJson as SalesDeck;

// 販売スライドの9章立て（各章=スライド何枚）
const SALES_SECTIONS = [
  { id: 1, title: "1. 導入", slideCount: "1/1", slideIndex: 1 },
  { id: 2, title: "2. 私の話：公務員からのスタート", slideCount: "2/2", slideIndex: 4 },
  { id: 3, title: "3. なぜこのブートキャンプを作ったか", slideCount: "1/1", slideIndex: 2 },
  { id: 4, title: "4. うちの会社：アドネスとみかみのこと", slideCount: "1/1", slideIndex: 4 },
  { id: 5, title: "5. このブートキャンプで手に入ること", slideCount: "1/1", slideIndex: 5 },
  { id: 6, title: "6. カリキュラム：7日で何をやるか", slideCount: "1/1", slideIndex: 6 },
  { id: 7, title: "7. 価格について", slideCount: "1/1", slideIndex: 8 },
  { id: 8, title: "8. よくある不安に先回りで答える", slideCount: "1/1", slideIndex: 9 },
  { id: 9, title: "9. 最後に", slideCount: "1/1", slideIndex: 10 },
];

// 各章のデフォルト原稿（v6 script-source.md より）。1つの文字列として保持（段落は空行区切り）
const CHAPTER_DEFAULTS: Record<number, string> = {
  1: `今日はですね、私たちが今やっている「本質のClaude Code 完全攻略 7dayブートキャンプ」の話をさせてください。
私自身がプログラミング経験ゼロから始めて、何ができるようになったのか。
それを7日間で皆さんにお渡しする、という話です。
少しだけ私の話から始めさせてください。`,
  2: `私、もともと高卒で市役所に入った公務員だったんですよ。
月給は12万円でした。
働きながら大学に通って、そのあと大学院にも進んだんですけど、半年で中退して起業したんです。
それで借金が500万円残りました。

その後、アドネスという会社に入って、人生が一変したんです。
私、プログラミング経験ゼロだったんですよ。
それなのに Claude Code を使い始めて、100個以上のシステムを作れるようになりました。

経験ゼロから始めた身でも作れたシステムの中に、『案件探索ツール』というのがあって、営業を自動化したら初月で1,000万円の案件が取れたんです。
同じく未経験のまま始めた人間が、法人のAIコンサルを月額50万円から200万円で複数社と契約できるようになりました。
Claude Code を使いまくった結果、初月の売上が4,500万円を突破したんです。
私を含めて4人のチームで達成した数字です。`,
};

// 空行（連続改行）で段落分割し、文字数をカウントする
function parseScript(
  text: string
): { num: number; text: string; count: number }[] {
  return text
    .split(/\n\s*\n/)
    .map((block, i) => ({
      num: i + 1,
      text: block.trim(),
      count: block.trim().replace(/\s/g, "").length,
    }))
    .filter((b) => b.text.length > 0);
}

// イラスト候補
const ILLUSTRATION_OPTIONS = [
  { id: "step", label: "経歴ステップ" },
  { id: "graph", label: "数字グラフ" },
  { id: "team", label: "チーム構成" },
];

// テンプレート画像（17枚）
const TEMPLATES = Array.from({ length: 17 }, (_, i) => ({
  id: `T${String(i + 1).padStart(2, "0")}`,
  src: `/templates/T${String(i + 1).padStart(2, "0")}.png`,
}));

// 配色テーマ
const THEMES: Record<Theme, { bg: string; text: string; accent: string; label: string }> = {
  lecture: {
    bg: "#ffffff",
    text: "#0f172a",
    accent: "#0891b2",
    label: "講義スライド配色",
  },
  bootcamp: {
    bg: "#0a0e27",
    text: "#f5f5f7",
    accent: "#ff6b35",
    label: "Claude Code 配色",
  },
};

type RegenerationResult = {
  imagePath: string;
  imageSpec: {
    purpose: string;
    text: { main: string; sub?: string; other?: string[] };
  };
  themeName?: string;
  timings?: { total: number; claude: number; openai: number };
  usage?: { input_tokens?: number; output_tokens?: number } | null;
};

export function SlideWorkspace() {
  // 1区で選ぶ「テーマ内容」（何の案件か）と 4区で選ぶ「配色テーマ」（どの色で出すか）は完全独立
  const [contentTheme, setContentTheme] = useState<ContentTheme>("bootcamp");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("bootcamp");
  const theme = colorTheme; // 既存コードとの互換（プレビューに使う）
  const setTheme = setColorTheme;
  const [activeSection, setActiveSection] = useState(2);
  const [activeTemplate, setActiveTemplate] = useState("落差ストーリー");
  const [activeIllustration, setActiveIllustration] = useState("step");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [largePreviewOpen, setLargePreviewOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationResult, setRegenerationResult] =
    useState<RegenerationResult | null>(null);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  // 章ごとに編集中の原稿テキストを保持（state、リロードで消える）
  const [editedScripts, setEditedScripts] = useState<Record<number, string>>({});
  const undoStackRef = useRef<Record<number, string[]>>({});
  const redoStackRef = useRef<Record<number, string[]>>({});
  const paragraphRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const currentSection = SALES_SECTIONS.find((s) => s.id === activeSection)!;
  const activeSlide = salesDeck.slides.find((s) => s.index === currentSection.slideIndex)!;
  const currentScriptText =
    editedScripts[activeSection] ??
    CHAPTER_DEFAULTS[activeSection] ??
    CHAPTER_DEFAULTS[2];
  const currentScript = parseScript(currentScriptText);
  const themeStyle = THEMES[theme];

  const illustrationLabel =
    ILLUSTRATION_OPTIONS.find((o) => o.id === activeIllustration)?.label ?? "";

  async function handleRegenerate() {
    setIsRegenerating(true);
    setRegenerationError(null);
    try {
      const scriptText = currentScriptText;
      const res = await fetch("/api/regenerate-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: currentSection.title,
          script: scriptText,
          template: activeTemplate,
          illustration: illustrationLabel,
          colorTheme,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRegenerationError(
          json.error ?? `HTTP ${res.status}: Unknown error`
        );
        return;
      }
      setRegenerationResult(json as RegenerationResult);
    } catch (err) {
      setRegenerationError(
        err instanceof Error ? err.message : "Network error"
      );
    } finally {
      setIsRegenerating(false);
    }
  }

  function resetRegeneration() {
    setRegenerationResult(null);
    setRegenerationError(null);
  }

  function rememberScript(previousText: string) {
    const stack = undoStackRef.current[activeSection] ?? [];
    if (stack.at(-1) !== previousText) {
      undoStackRef.current[activeSection] = [...stack, previousText].slice(-100);
    }
    redoStackRef.current[activeSection] = [];
  }

  function commitScriptText(nextText: string) {
    if (nextText === currentScriptText) return;
    rememberScript(currentScriptText);
    setEditedScripts((prev) => ({
      ...prev,
      [activeSection]: nextText,
    }));
  }

  function updateScriptParagraph(blockIndex: number, nextText: string) {
    const blocks = currentScript.map((block) => block.text);
    blocks[blockIndex] = nextText;
    commitScriptText(blocks.join("\n\n"));
  }

  function getCaretOffsetWithin(element: HTMLElement) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  function focusParagraph(blockNum: number, cursorOffset: number) {
    window.setTimeout(() => {
      const target = paragraphRefs.current[blockNum];
      if (!target) return;
      target.focus();

      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let remaining = cursorOffset;
      let textNode = walker.nextNode();
      while (textNode) {
        const length = textNode.textContent?.length ?? 0;
        if (remaining <= length) {
          const range = document.createRange();
          range.setStart(textNode, remaining);
          range.collapse(true);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          return;
        }
        remaining -= length;
        textNode = walker.nextNode();
      }
    }, 0);
  }

  function splitParagraphAtCaret(blockIndex: number, element: HTMLElement) {
    const text = element.innerText;
    const caretOffset = getCaretOffsetWithin(element);
    const blocks = currentScript.map((block) => block.text);
    blocks[blockIndex] = text.slice(0, caretOffset);
    blocks.splice(blockIndex + 1, 0, text.slice(caretOffset));
    commitScriptText(blocks.join("\n\n"));
    focusParagraph(blockIndex + 2, 0);
  }

  function mergeParagraphWithPrevious(blockIndex: number) {
    if (blockIndex <= 0) return;
    const blocks = currentScript.map((block) => block.text);
    const previousLength = blocks[blockIndex - 1].length;
    blocks[blockIndex - 1] = `${blocks[blockIndex - 1]}${blocks[blockIndex]}`;
    blocks.splice(blockIndex, 1);
    commitScriptText(blocks.join("\n\n"));
    focusParagraph(blockIndex, previousLength);
  }

  function handleParagraphKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    blockIndex: number
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      splitParagraphAtCaret(blockIndex, event.currentTarget);
      return;
    }

    if (event.key !== "Backspace") return;
    const selection = window.getSelection();
    if (!selection || !selection.isCollapsed || selection.anchorOffset !== 0) return;
    event.preventDefault();
    mergeParagraphWithPrevious(blockIndex);
  }

  function resetCurrentScript() {
    const defaultText = CHAPTER_DEFAULTS[activeSection] ?? CHAPTER_DEFAULTS[2];
    if (defaultText === currentScriptText) return;
    rememberScript(currentScriptText);
    setEditedScripts((prev) => {
      const next = { ...prev };
      delete next[activeSection];
      return next;
    });
  }

  function undoScriptChange() {
    const stack = undoStackRef.current[activeSection] ?? [];
    const previousText = stack.at(-1);
    if (previousText === undefined) return;
    undoStackRef.current[activeSection] = stack.slice(0, -1);
    redoStackRef.current[activeSection] = [
      ...(redoStackRef.current[activeSection] ?? []),
      currentScriptText,
    ].slice(-100);
    setEditedScripts((prev) => ({
      ...prev,
      [activeSection]: previousText,
    }));
  }

  function redoScriptChange() {
    const stack = redoStackRef.current[activeSection] ?? [];
    const nextText = stack.at(-1);
    if (nextText === undefined) return;
    redoStackRef.current[activeSection] = stack.slice(0, -1);
    undoStackRef.current[activeSection] = [
      ...(undoStackRef.current[activeSection] ?? []),
      currentScriptText,
    ].slice(-100);
    setEditedScripts((prev) => ({
      ...prev,
      [activeSection]: nextText,
    }));
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLElement>) {
    const isModifierPressed = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    if (!isModifierPressed || (key !== "z" && key !== "y")) return;

    event.preventDefault();
    if (key === "y" || event.shiftKey) {
      redoScriptChange();
      return;
    }
    undoScriptChange();
  }

  const headerTitle =
    contentTheme === "bootcamp"
      ? "Claude Code ブートキャンプ販売セミナー"
      : "講義スライド作業場";

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f8fafc] text-[#162033]">
      <section
        className="grid h-full w-full"
        style={{ gridTemplateColumns: "292px 360px minmax(460px, 1fr) 390px" }}
        aria-label="4ペイン構成"
      >
        {/* === 1区: 全体ナビ === */}
        <article className="flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          <div className="p-3.5 flex flex-col h-full">
            <div className="grid grid-cols-[76px_1fr] items-center gap-3 border-b border-slate-200/50 pb-3.5 mb-3.5">
              <img
                src="/addness-logo.png"
                alt="アドネス株式会社"
                className="block w-[72px] max-h-[38px] object-contain"
              />
              <div className="text-[14px] font-black leading-tight truncate text-[#172033]">
                全体カリキュラム
              </div>
            </div>
            <nav className="grid gap-1">
              <button
                type="button"
                onClick={() => setContentTheme("lecture")}
                className={`flex items-center gap-2 min-h-[38px] px-2.5 rounded-[10px] text-left text-[12px] font-semibold transition-colors ${
                  contentTheme === "lecture"
                    ? "bg-slate-100 text-[#0f2f46] font-extrabold shadow-[inset_0_0_0_1px_rgba(15,47,70,0.04)]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="inline-flex w-4 h-4 rounded-[4px] border border-slate-300 bg-slate-50 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-sm bg-slate-500" />
                </span>
                <span className="truncate">講義スライド</span>
              </button>
              <button
                type="button"
                onClick={() => setContentTheme("bootcamp")}
                className={`flex items-center gap-2 min-h-[38px] px-2.5 rounded-[10px] text-left text-[12px] font-semibold transition-colors ${
                  contentTheme === "bootcamp"
                    ? "bg-slate-100 text-[#0f2f46] font-extrabold shadow-[inset_0_0_0_1px_rgba(15,47,70,0.04)]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="inline-flex w-4 h-4 rounded-[4px] border border-slate-300 bg-slate-50 items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-sm bg-slate-500" />
                </span>
                <span className="truncate">Claude Code ブートキャンプ販売スライド</span>
              </button>
              <button
                type="button"
                onClick={() => alert("テーマ追加は次フェーズで実装予定です")}
                className="flex items-center gap-2 min-h-[38px] px-2.5 mt-2 rounded-[10px] text-left text-[12px] font-semibold text-slate-400 border border-dashed border-slate-300 hover:bg-slate-50"
              >
                <span className="inline-flex w-4 h-4 items-center justify-center text-slate-400">
                  +
                </span>
                <span className="truncate">テーマを追加</span>
              </button>
            </nav>
            <div className="mt-auto pt-4 border-t border-slate-200/50 text-[11px] text-slate-400 leading-[1.6]">
              テーマ内容: {contentTheme === "bootcamp" ? "Claude Code 販売" : "講義"}
            </div>
          </div>
        </article>

        {/* === 2区: セクション一覧 === */}
        <article className="flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          <header className="px-[18px] pt-[18px] pb-3 border-b border-slate-200/50">
            <h2 className="text-[19px] leading-tight tracking-tight font-bold">
              {headerTitle}
            </h2>
            <p className="mt-2 text-[12px] text-slate-500">全体 10/10枚</p>
          </header>
          <div className="px-3.5 py-3 overflow-auto flex-1">
            <div className="grid gap-1">
              {SALES_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`grid grid-cols-[1fr_auto] gap-3 items-start min-h-[42px] px-3 py-2.5 rounded-[10px] text-left text-[12px] transition-colors ${
                    activeSection === section.id
                      ? "bg-[#eef3f8] text-[#0f2f46] font-extrabold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate leading-[1.7]">{section.title}</span>
                  <span
                    className={`text-[11px] leading-[1.7] whitespace-nowrap ${
                      activeSection === section.id ? "text-[#0f2f46]" : "text-slate-400"
                    }`}
                  >
                    {section.slideCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <footer className="mt-auto border-t border-slate-200/50 p-4 text-[12px] text-slate-500 leading-[1.8]">
            進捗 10/10枚
            <br />
            想定時間 12/15分
          </footer>
        </article>

        {/* === 3区: 原稿エディタ === */}
        <article
          className="flex flex-col bg-white overflow-hidden border-r border-slate-200"
          onKeyDown={handleEditorKeyDown}
        >
          <div className="flex items-center justify-between gap-2 min-h-[64px] px-5 py-3 border-b border-slate-200/50 bg-white">
            <div className="min-w-0">
              <div className="text-[11px] font-black tracking-[0.08em] text-[#0f5f7a]">
                3 / 原稿編集
              </div>
              <div className="truncate text-[15px] font-black text-[#172033] leading-tight mt-1">
                {currentSection.title}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-[30px] text-[12px] font-extrabold text-slate-600"
              >
                確認
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-[30px] text-[12px] font-extrabold text-slate-600"
              >
                書き出し
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-[30px] bg-[#0f5f7a] text-[12px] font-extrabold text-white hover:bg-[#0a4a60]"
              >
                記録
              </Button>
            </div>
          </div>
          <div className="h-full overflow-hidden bg-white grid grid-rows-[1fr_auto]">
            {/* セクション内のスライド区切りが見える原稿エディタ */}
            <div className="min-h-0 overflow-auto scroll-smooth overscroll-contain px-8 py-7">
              <div className="flex items-center justify-between mb-5 text-[11px] text-slate-500">
                <span>
                  段落ごとに1枚のスライドとして扱います
                </span>
                <Button
                  type="button"
                  onClick={resetCurrentScript}
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 py-0 text-[11px] font-semibold text-slate-400 underline hover:bg-transparent hover:text-slate-600"
                >
                  デフォルトに戻す
                </Button>
              </div>
              <div className="grid gap-0">
                {currentScript.map((block, idx) => (
                  <div
                    key={block.num}
                    className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-start gap-4 pb-[22px] last:pb-0"
                  >
                    <div className="relative flex justify-center">
                      <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[12px] font-black leading-none text-slate-600">
                        {block.num}
                      </span>
                      {idx < currentScript.length - 1 && (
                        <span className="absolute left-1/2 top-[34px] h-[calc(100%+20px)] w-px -translate-x-1/2 bg-slate-200" />
                      )}
                    </div>
                    <div
                      ref={(node) => {
                        paragraphRefs.current[block.num] = node;
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      spellCheck={false}
                      onBlur={(event) =>
                        updateScriptParagraph(idx, event.currentTarget.innerText)
                      }
                      onKeyDown={(event) => handleParagraphKeyDown(event, idx)}
                      className="min-h-[26px] whitespace-pre-wrap break-words text-[14px] font-normal leading-[1.85] text-slate-900 outline-none"
                    >
                      {block.text}
                    </div>
                    <div className="pt-1 text-right text-[11px] font-semibold text-slate-300">
                      {block.count}字
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 原稿を箱で囲わず、状態だけを下端に控えめに出す */}
            <div className="flex items-center justify-between border-t border-slate-200/60 bg-white px-8 py-3 text-[11px] text-slate-400">
              <span>全{currentScript.length}段落</span>
              <span>
                総文字数 {currentScript.reduce((s, b) => s + b.count, 0)}字
              </span>
            </div>
          </div>
        </article>

        {/* === 4区: 選択中テンプレート / イラスト候補 / 生成後プレビュー === */}
        <article className="flex flex-col overflow-hidden bg-[#f8fafc]">
          <div className="grid gap-3.5 p-4 overflow-auto h-full content-start">
            {/* 選択中テンプレート */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5">
              <div className="flex justify-between gap-2 mb-2.5 text-slate-700 text-[13px] font-black">
                <span>選択中テンプレート</span>
              </div>
              <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 border border-slate-200 rounded-[10px] bg-slate-50">
                <span className="text-slate-700 text-[13px] font-black">
                  {activeTemplate}
                </span>
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(true)}
                  className="min-h-[30px] px-2.5 border border-slate-200 rounded-lg bg-white text-slate-600 text-[12px] font-extrabold hover:bg-slate-50"
                >
                  変更
                </button>
              </div>
            </div>

            {/* イラスト候補 */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5">
              <div className="flex justify-between gap-2 mb-2.5 text-slate-700 text-[13px] font-black">
                <span>イラスト候補</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ILLUSTRATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActiveIllustration(opt.id)}
                    className={`grid gap-2 p-2 border rounded-[10px] text-[11px] font-extrabold text-center transition-colors ${
                      activeIllustration === opt.id
                        ? "border-[#0f5f7a] bg-cyan-50 text-[#0f5f7a]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-200 to-white" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 配色テーマ選択 */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5">
              <div className="flex justify-between gap-2 mb-2.5 text-slate-700 text-[13px] font-black">
                <span>配色テーマ</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setColorTheme("lecture")}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-[10px] text-[12px] font-extrabold text-left transition-colors ${
                    colorTheme === "lecture"
                      ? "border-[#0f5f7a] bg-cyan-50 text-[#0f5f7a]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="inline-block w-4 h-4 rounded border border-slate-300 bg-white" />
                  <span>講義配色</span>
                </button>
                <button
                  type="button"
                  onClick={() => setColorTheme("bootcamp")}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-[10px] text-[12px] font-extrabold text-left transition-colors ${
                    colorTheme === "bootcamp"
                      ? "border-[#0f5f7a] bg-cyan-50 text-[#0f5f7a]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="inline-block w-4 h-4 rounded border border-slate-700 bg-[#0a0e27]" />
                  <span>Claude Code 配色</span>
                </button>
              </div>
            </div>

            {/* 再生成ボタン */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-slate-700 text-[13px] font-black">
                  このスライドを再生成
                </span>
                {regenerationResult && (
                  <button
                    type="button"
                    onClick={resetRegeneration}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    元に戻す
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className={`w-full min-h-[44px] rounded-lg text-[13px] font-extrabold transition-colors ${
                  isRegenerating
                    ? "bg-slate-200 text-slate-400 cursor-wait"
                    : "bg-[#ff6b35] text-white hover:bg-[#e85d2c]"
                }`}
              >
                {isRegenerating ? "AIで再生成中..." : "AIで再生成（Claude Opus 4.7）"}
              </button>
              {regenerationError && (
                <p className="mt-2 text-[11px] text-red-600 leading-[1.5]">
                  エラー: {regenerationError}
                </p>
              )}
              {regenerationResult?.timings && (
                <p className="mt-2 text-[11px] text-slate-400 leading-[1.5]">
                  ✓ 合計 {(regenerationResult.timings.total / 1000).toFixed(1)}s
                  （Claude {(regenerationResult.timings.claude / 1000).toFixed(1)}s + OpenAI {(regenerationResult.timings.openai / 1000).toFixed(1)}s）
                </p>
              )}
              {isRegenerating && (
                <p className="mt-2 text-[11px] text-slate-500 leading-[1.5]">
                  Claude Opus 4.7 → OpenAI gpt-image-2 を順番に呼んでいます（30〜60秒）
                </p>
              )}
            </div>

            {/* 生成後プレビュー */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5">
              <div className="flex justify-between gap-2 mb-2.5 text-slate-700 text-[13px] font-black">
                <span>生成後プレビュー</span>
                <button
                  type="button"
                  onClick={() => setLargePreviewOpen(true)}
                  className="min-h-[30px] px-2.5 border border-slate-200 rounded-lg bg-white text-slate-600 text-[12px] font-extrabold hover:bg-slate-50"
                >
                  大プレビュー
                </button>
              </div>
              <div
                className="aspect-video overflow-hidden border border-slate-200 rounded-xl relative"
                style={{ background: themeStyle.bg, color: themeStyle.text }}
              >
                {regenerationResult ? (
                  // AI再生成された PNG を表示（Claude → OpenAI gpt-image-2 経由）
                  <img
                    src={regenerationResult.imagePath}
                    alt="AI再生成スライド"
                    className="w-full h-full object-cover"
                  />
                ) : theme === "bootcamp" ? (
                  <img
                    src={`/slides/v7/slide-${activeSlide.index}.png`}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-[18px]">
                    <small
                      className="text-[10px] font-black tracking-wider"
                      style={{ color: themeStyle.accent }}
                    >
                      {activeSlide.eyebrow}
                    </small>
                    <h3 className="max-w-[82%] mt-4 mb-2.5 text-[20px] leading-[1.28] font-bold">
                      {activeSlide.title}
                    </h3>
                    {activeSlide.subtitle && (
                      <p className="max-w-[78%] m-0 text-[11px] leading-[1.7] opacity-70">
                        {activeSlide.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] text-slate-500 leading-[1.6]">
                {regenerationResult
                  ? `AI再生成 (${regenerationResult.themeName ?? ""}): ${regenerationResult.imageSpec.text.main}`
                  : `スライド ${activeSlide.index}：${activeSlide.title}`}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* === テンプレート選択モーダル === */}
      {templateModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setTemplateModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-[1200px] max-h-[85vh] overflow-auto p-6 w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-3 border-b border-slate-200">
              <h2 className="text-xl font-black">テンプレートを選ぶ</h2>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="min-h-[36px] px-4 border border-slate-200 rounded-lg bg-white text-slate-600 text-[13px] font-extrabold hover:bg-slate-50"
              >
                閉じる
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setActiveTemplate(tmpl.id);
                    setTemplateModalOpen(false);
                  }}
                  className="border border-slate-200 rounded-xl p-2 hover:border-[#0f5f7a] hover:shadow-md transition-all bg-white"
                >
                  <img
                    src={tmpl.src}
                    alt={tmpl.id}
                    className="w-full rounded-lg"
                  />
                  <div className="mt-2 text-[12px] font-bold text-slate-700 text-left px-1">
                    {tmpl.id}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === 大プレビュー === */}
      {largePreviewOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-8"
          onClick={() => setLargePreviewOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-w-[1600px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                regenerationResult
                  ? regenerationResult.imagePath
                  : `/slides/v7/slide-${activeSlide.index}.png`
              }
              alt={
                regenerationResult
                  ? regenerationResult.imageSpec.text.main
                  : activeSlide.title
              }
              className="w-full rounded-lg shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-white text-sm">
                {regenerationResult
                  ? `AI再生成: ${regenerationResult.imageSpec.text.main}`
                  : `スライド ${activeSlide.index}：${activeSlide.title}`}
              </p>
              <button
                type="button"
                onClick={() => setLargePreviewOpen(false)}
                className="px-6 py-2 bg-white rounded-lg font-bold text-slate-700 hover:bg-slate-100"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
