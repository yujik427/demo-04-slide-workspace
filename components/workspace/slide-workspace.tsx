"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

type Theme = "lecture" | "bootcamp";
type ContentTheme = "lecture" | "bootcamp";
type ColorTheme = "lecture" | "bootcamp";
type ScriptBlock = { num: number; text: string; count: number };
type ParagraphMetric = { num: number; top: number; height: number };

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
function parseScript(text: string, { keepEmpty = false } = {}): ScriptBlock[] {
  const blocks = text
    .split(/\n[ \t]*\n/)
    .map((block, i) => ({
      num: i + 1,
      text: block.trim(),
      count: block.trim().replace(/\s/g, "").length,
    }));

  return keepEmpty ? blocks : blocks.filter((b) => b.text.length > 0);
}

function normalizeScriptForComparison(text: string) {
  return parseScript(text)
    .map((block) =>
      block.text
        .replace(/\r\n/g, "\n")
        .replace(/\u00a0/g, " ")
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .trim()
    )
    .join("\n\n");
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

type GeneratedSlideStatus = "idle" | "generating" | "done" | "failed";

type GeneratedSlide = {
  num: number;
  sourceText: string;
  count: number;
  status: GeneratedSlideStatus;
  imagePath?: string;
  error?: string;
  title: string;
};

type GenerationHistory = {
  id: number;
  createdAt: string;
  scriptText: string;
  slides: GeneratedSlide[];
  template: string;
  illustration: string;
  colorTheme: ColorTheme;
};

export function SlideWorkspace() {
  // 1区で選ぶ「テーマ内容」（何の案件か）と 4区で選ぶ「配色テーマ」（どの色で出すか）は完全独立
  const [contentTheme, setContentTheme] = useState<ContentTheme>("bootcamp");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("bootcamp");
  const theme = colorTheme; // 既存コードとの互換（プレビューに使う）
  const [activeSection, setActiveSection] = useState(2);
  const [activeTemplate, setActiveTemplate] = useState("落差ストーリー");
  const [activeIllustration, setActiveIllustration] = useState("step");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [largePreviewOpen, setLargePreviewOpen] = useState(false);
  const [selectedGeneratedSlide, setSelectedGeneratedSlide] = useState(1);
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistory[]>([]);
  const [latestGenerationSnapshot, setLatestGenerationSnapshot] =
    useState<GenerationHistory | null>(null);
  const [currentGenerationSourceLabel, setCurrentGenerationSourceLabel] =
    useState<string | null>(null);
  const [currentGenerationScriptText, setCurrentGenerationScriptText] =
    useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isMockGenerating, setIsMockGenerating] = useState(false);
  // 章ごとに編集中の原稿テキストを保持（state、リロードで消える）
  const [editedScripts, setEditedScripts] = useState<Record<number, string>>({});
  const draftScriptsRef = useRef<Record<number, string>>({});
  const editorRef = useRef<HTMLDivElement | null>(null);
  const measurementRef = useRef<HTMLDivElement | null>(null);
  const [paragraphMetrics, setParagraphMetrics] = useState<ParagraphMetric[]>([]);

  const currentSection = SALES_SECTIONS.find((s) => s.id === activeSection)!;
  const savedScriptText =
    editedScripts[activeSection] ??
    CHAPTER_DEFAULTS[activeSection] ??
    CHAPTER_DEFAULTS[2];
  const currentScriptText = draftScriptsRef.current[activeSection] ?? savedScriptText;
  const currentScript = parseScript(currentScriptText, { keepEmpty: true });
  const themeStyle = THEMES[theme];

  const illustrationLabel =
    ILLUSTRATION_OPTIONS.find((o) => o.id === activeIllustration)?.label ?? "";
  const selectedGenerated =
    generatedSlides.find((slide) => slide.num === selectedGeneratedSlide) ??
    generatedSlides[0] ??
    null;
  const generatingSlide =
    generatedSlides.find((slide) => slide.status === "generating") ?? null;
  const previewSlides = generatedSlides.length > 0 ? generatedSlides : createPendingSlides();
  const displaySelectedSlide =
    selectedGenerated ??
    previewSlides.find((slide) => slide.num === selectedGeneratedSlide) ??
    previewSlides[0] ??
    null;
  const currentGenerationSummary =
    generatedSlides.length > 0
      ? {
          slides: generatedSlides,
          template: activeTemplate,
          colorTheme,
        }
      : null;
  const isGeneratedStale =
    generatedSlides.length > 0 &&
    currentGenerationScriptText !== null &&
    normalizeScriptForComparison(currentGenerationScriptText) !==
      normalizeScriptForComparison(currentScriptText);

  useEffect(() => {
    setSelectedGeneratedSlide(1);
  }, [activeSection]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    if (editor.innerText !== currentScriptText) {
      editor.innerText = currentScriptText;
    }
  }, [currentScriptText]);

  useLayoutEffect(() => {
    const measurement = measurementRef.current;
    if (!measurement) return;

    const updateMetrics = () => {
      const nodes = Array.from(
        measurement.querySelectorAll<HTMLElement>("[data-script-block]")
      );
      setParagraphMetrics(
        nodes.map((node, index) => ({
          num: index + 1,
          top: node.offsetTop,
          height: node.offsetHeight,
        }))
      );
    };

    updateMetrics();

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(measurement);
    return () => observer.disconnect();
  }, [currentScriptText, currentScript.length]);

  function createPendingSlides(): GeneratedSlide[] {
    return currentScript.map((block) => ({
      num: block.num,
      sourceText: block.text,
      count: block.count,
      status: "idle",
      title: block.text.split("\n")[0]?.slice(0, 28) || `Slide ${block.num}`,
    }));
  }

  async function generateSlideImage(slide: GeneratedSlide) {
    const response = await fetch("/api/regenerate-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionTitle: `${currentSection.title} / ${slide.num}枚目`,
        script: slide.sourceText,
        template: activeTemplate,
        illustration: illustrationLabel,
        colorTheme,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error ?? `HTTP ${response.status}`);
    }
    if (!result.imagePath) {
      throw new Error("生成画像のパスが返ってきませんでした");
    }
    return result.imagePath as string;
  }

  async function handleGenerateSection() {
    if (currentScript.length === 0) return;
    const sourceScriptText = currentScriptText;
    if (
      currentScript.length > 10 &&
      !window.confirm(`${currentScript.length}枚生成します。続けますか？`)
    ) {
      return;
    }

    setLatestGenerationSnapshot(null);
    setCurrentGenerationSourceLabel(null);

    if (generatedSlides.length > 0) {
      setGenerationHistory((prev) => [
        {
          id: Date.now(),
          createdAt: new Date().toLocaleString("ja-JP"),
          scriptText: currentGenerationScriptText ?? currentScriptText,
          slides: generatedSlides,
          template: activeTemplate,
          illustration: illustrationLabel,
          colorTheme,
        },
        ...prev,
      ]);
    }

    setIsMockGenerating(true);
    setCurrentGenerationScriptText(sourceScriptText);
    setSelectedGeneratedSlide(1);

    const nextSlides = createPendingSlides();
    setGeneratedSlides(nextSlides);

    for (const slide of nextSlides) {
      setSelectedGeneratedSlide(slide.num);
      setGeneratedSlides((prev) =>
        prev.map((item) =>
          item.num === slide.num
            ? { ...item, status: "generating", error: undefined }
            : item
        )
      );

      try {
        const imagePath = await generateSlideImage(slide);
        setGeneratedSlides((prev) =>
          prev.map((item) =>
            item.num === slide.num
              ? { ...item, status: "done", imagePath, error: undefined }
              : item
          )
        );
      } catch (error) {
        setGeneratedSlides((prev) =>
          prev.map((item) =>
            item.num === slide.num
              ? {
                  ...item,
                  status: "failed",
                  imagePath: undefined,
                  error: error instanceof Error ? error.message : "生成に失敗しました",
                }
              : item
          )
        );
      }
    }

    setIsMockGenerating(false);
  }

  async function retryMockSlide(slideNum: number) {
    const targetSlide = generatedSlides.find((slide) => slide.num === slideNum);
    if (!targetSlide) return;

    setIsMockGenerating(true);
    setSelectedGeneratedSlide(slideNum);
    setGeneratedSlides((prev) =>
      prev.map((item) =>
        item.num === slideNum ? { ...item, status: "generating", error: undefined } : item
      )
    );

    try {
      const imagePath = await generateSlideImage(targetSlide);
      setGeneratedSlides((prev) =>
        prev.map((item) =>
          item.num === slideNum
            ? { ...item, status: "done", imagePath, error: undefined }
            : item
        )
      );
    } catch (error) {
      setGeneratedSlides((prev) =>
        prev.map((item) =>
          item.num === slideNum
            ? {
                ...item,
                status: "failed",
                imagePath: undefined,
                error: error instanceof Error ? error.message : "生成に失敗しました",
              }
            : item
        )
      );
    }
    setIsMockGenerating(false);
  }

  function restoreHistory(history: GenerationHistory, sourceLabel: string) {
    if (!latestGenerationSnapshot && !currentGenerationSourceLabel && generatedSlides.length > 0) {
      setLatestGenerationSnapshot({
        id: Date.now(),
        createdAt: new Date().toLocaleString("ja-JP"),
        scriptText: currentGenerationScriptText ?? currentScriptText,
        slides: generatedSlides,
        template: activeTemplate,
        illustration: illustrationLabel,
        colorTheme,
      });
    }
    setGeneratedSlides(history.slides);
    setActiveTemplate(history.template);
    setActiveIllustration(history.illustration);
    setColorTheme(history.colorTheme);
    setCurrentGenerationScriptText(history.scriptText);
    setCurrentGenerationSourceLabel(sourceLabel);
    setSelectedGeneratedSlide(history.slides[0]?.num ?? 1);
    setHistoryOpen(false);
  }

  function restoreLatestGeneration() {
    if (!latestGenerationSnapshot) return;
    setGeneratedSlides(latestGenerationSnapshot.slides);
    setActiveTemplate(latestGenerationSnapshot.template);
    setActiveIllustration(latestGenerationSnapshot.illustration);
    setColorTheme(latestGenerationSnapshot.colorTheme);
    setCurrentGenerationScriptText(latestGenerationSnapshot.scriptText);
    setCurrentGenerationSourceLabel(null);
    setSelectedGeneratedSlide(latestGenerationSnapshot.slides[0]?.num ?? 1);
    setLatestGenerationSnapshot(null);
    setHistoryOpen(false);
  }

  function getHistoryLabel(index: number) {
    if (index === 0) return "前回";
    if (index === 1) return "2つ前";
    return `${index + 1}つ前`;
  }

  function updateWholeScriptText(nextText: string) {
    draftScriptsRef.current[activeSection] = nextText;
    setEditedScripts((prev) => ({
      ...prev,
      [activeSection]: nextText,
    }));
  }

  function handleEditorInput(event: FormEvent<HTMLDivElement>) {
    updateWholeScriptText(event.currentTarget.innerText);
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
        <article className="flex flex-col bg-white overflow-hidden border-r border-slate-200">
          <div className="flex items-center justify-between gap-2 min-h-[64px] px-5 py-3 border-b border-slate-200/50 bg-white">
            <div className="min-w-0">
              <div className="text-[11px] font-black tracking-[0.08em] text-[#0f5f7a]">
                3 / 原稿編集
              </div>
              <div className="truncate text-[15px] font-black text-[#172033] leading-tight mt-1">
                {currentSection.title}
              </div>
            </div>
          </div>
          <div className="h-full overflow-hidden bg-white grid grid-rows-[1fr_auto]">
            {/* セクション内のスライド区切りが見える原稿エディタ */}
            <div className="relative min-h-0 overflow-auto scroll-smooth overscroll-contain px-8 py-7">
              {isMockGenerating && (
                <div className="sticky top-0 z-20 mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[12px] font-bold text-orange-700 shadow-sm">
                  生成中は原稿を編集できません。
                  {generatingSlide ? ` ${generatingSlide.num}/${currentScript.length}枚目を生成中...` : ""}
                </div>
              )}
              <div className="flex items-center justify-between mb-5 text-[11px] text-slate-500">
                <span>
                  段落ごとに1枚のスライドとして扱います
                </span>
              </div>
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-start gap-4">
                <div className="pointer-events-none relative min-h-[520px] select-none">
                  {currentScript.map((block, idx) => {
                    const metric = paragraphMetrics[idx];
                    const nextMetric = paragraphMetrics[idx + 1];

                    return (
                    <div
                      key={`num-${activeSection}-${block.num}`}
                      className="absolute left-0 right-0 flex justify-center"
                      style={{
                        top: `${metric?.top ?? 0}px`,
                      }}
                    >
                      <span
                        className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-black leading-none transition-colors ${
                          selectedGeneratedSlide === block.num
                            ? "border-[#0f5f7a] bg-[#0f5f7a] text-white"
                            : "border-slate-300 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {block.num}
                      </span>
                      {nextMetric && (
                        <span
                          className="absolute left-1/2 top-[34px] w-px -translate-x-1/2 bg-slate-200"
                          style={{ height: `${Math.max(18, nextMetric.top - (metric?.top ?? 0) - 38)}px` }}
                        />
                      )}
                    </div>
                    );
                  })}
                </div>
                <div className="relative min-h-[520px]">
                  <div
                    ref={editorRef}
                    contentEditable={!isMockGenerating}
                    suppressContentEditableWarning
                    spellCheck={false}
                    onInput={handleEditorInput}
                    className="relative z-10 min-h-[520px] w-full whitespace-pre-wrap break-words text-[14px] font-normal leading-[1.85] text-slate-900 outline-none"
                    aria-disabled={isMockGenerating}
                  />
                  <div
                    ref={measurementRef}
                    aria-hidden="true"
                    className="pointer-events-none invisible absolute inset-x-0 top-0 -z-10 w-full whitespace-pre-wrap break-words text-[14px] font-normal leading-[1.85]"
                  >
                    {currentScript.map((block) => (
                      <div
                        key={`measure-${activeSection}-${block.num}`}
                        data-script-block
                        className="min-h-[1.85em] pb-[1.85em]"
                      >
                        {block.text || "\u00a0"}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pointer-events-none relative min-h-[520px] select-none text-right text-[11px] font-semibold text-slate-300">
                  {currentScript.map((block, idx) => (
                    <div
                      key={`count-${activeSection}-${block.num}`}
                      className="absolute left-0 right-0"
                      style={{
                        top: `${paragraphMetrics[idx]?.top ?? 0}px`,
                      }}
                    >
                      {block.count}字
                    </div>
                  ))}
                </div>
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
            <div
              className={`border border-slate-200 rounded-xl bg-white p-3.5 transition-opacity ${
                isMockGenerating ? "opacity-55 pointer-events-none" : ""
              }`}
              aria-disabled={isMockGenerating}
            >
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
            <div
              className={`border border-slate-200 rounded-xl bg-white p-3.5 transition-opacity ${
                isMockGenerating ? "opacity-55 pointer-events-none" : ""
              }`}
              aria-disabled={isMockGenerating}
            >
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
            <div
              className={`border border-slate-200 rounded-xl bg-white p-3.5 transition-opacity ${
                isMockGenerating ? "opacity-55 pointer-events-none" : ""
              }`}
              aria-disabled={isMockGenerating}
            >
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

            {/* 生成実行 */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-slate-700 text-[13px] font-black">
                  セクション生成
                </span>
                <button
                  type="button"
                  onClick={() => setHistoryOpen((prev) => !prev)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  {historyOpen ? "履歴を閉じる" : "履歴を見る"}
                </button>
              </div>
              <p className="mb-3 text-[11px] leading-[1.6] text-slate-500">
                3区の1〜{currentScript.length}を、それぞれ1枚のスライドとして生成します。
              </p>
              <button
                type="button"
                onClick={handleGenerateSection}
                disabled={isMockGenerating || currentScript.length === 0}
                className={`w-full min-h-[44px] rounded-lg text-[13px] font-extrabold transition-colors ${
                  isMockGenerating
                    ? "bg-slate-200 text-slate-400 cursor-wait"
                    : "bg-[#ff6b35] text-white hover:bg-[#e85d2c]"
                }`}
              >
                {isMockGenerating
                  ? `${generatingSlide?.num ?? 1}/${currentScript.length}枚目を生成中...`
                  : isGeneratedStale
                    ? `更新した原稿で${currentScript.length}枚再生成`
                    : `この条件で${currentScript.length}枚生成`}
              </button>
              {historyOpen && (
                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
                  {currentGenerationSummary && (
                    <div className="rounded-lg border border-[#0f5f7a] bg-cyan-50 px-3 py-2 text-left">
                      <span className="block text-[11px] font-black text-[#0f5f7a]">
                        現在の生成
                        {currentGenerationSourceLabel
                          ? `（${currentGenerationSourceLabel}から復元）`
                          : ""}
                      </span>
                      <span className="mt-1 block text-[11px] leading-[1.5] text-slate-600">
                        {currentGenerationSummary.slides.length}枚 /{" "}
                        {currentGenerationSummary.template} /{" "}
                        {currentGenerationSummary.colorTheme === "bootcamp"
                          ? "Claude Code 配色"
                          : "講義配色"}
                      </span>
                    </div>
                  )}
                  {latestGenerationSnapshot && (
                    <button
                      type="button"
                      onClick={restoreLatestGeneration}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-[#0f5f7a] hover:bg-cyan-50"
                    >
                      <span className="block text-[11px] font-black text-slate-700">
                        最新の生成
                      </span>
                      <span className="mt-1 block text-[11px] leading-[1.5] text-slate-500">
                        {latestGenerationSnapshot.slides.length}枚 /{" "}
                        {latestGenerationSnapshot.template} /{" "}
                        {latestGenerationSnapshot.colorTheme === "bootcamp"
                          ? "Claude Code 配色"
                          : "講義配色"}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {latestGenerationSnapshot.createdAt}
                      </span>
                      <span className="mt-1 block text-[10px] font-bold text-[#0f5f7a]">
                        最新の生成を現在に戻す
                      </span>
                    </button>
                  )}
                  {generationHistory.length === 0 ? (
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-[1.5] text-slate-400">
                      前回の生成はまだありません。
                    </div>
                  ) : (
                    generationHistory.map((history, index) => (
                      <button
                        key={history.id}
                        type="button"
                        onClick={() => restoreHistory(history, getHistoryLabel(index))}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-[#0f5f7a] hover:bg-cyan-50"
                      >
                        <span className="block text-[11px] font-black text-slate-700">
                          {getHistoryLabel(index)}
                        </span>
                        <span className="mt-1 block text-[11px] leading-[1.5] text-slate-500">
                          {history.slides.length}枚 / {history.template} /{" "}
                          {history.colorTheme === "bootcamp" ? "Claude Code 配色" : "講義配色"}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {history.createdAt}
                        </span>
                        <span className="mt-1 block text-[10px] font-bold text-[#0f5f7a]">
                          これを現在に戻す
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 生成スライド */}
            <div className="border border-slate-200 rounded-xl bg-white p-3.5">
              <div className="flex justify-between gap-2 mb-2.5 text-slate-700 text-[13px] font-black">
                <span>生成スライド</span>
                <button
                  type="button"
                  onClick={() => setLargePreviewOpen(true)}
                  disabled={!displaySelectedSlide?.imagePath}
                  className="min-h-[30px] px-2.5 border border-slate-200 rounded-lg bg-white text-slate-600 text-[12px] font-extrabold hover:bg-slate-50"
                >
                  大プレビュー
                </button>
              </div>
              <div className="-mx-1 overflow-x-auto px-1 pb-2">
                <div className="flex w-max gap-2">
                {previewSlides.map((slide) => (
                  <button
                    key={slide.num}
                    type="button"
                    onClick={() => setSelectedGeneratedSlide(slide.num)}
                    aria-label={`スライド${slide.num}を選択`}
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-black transition-colors ${
                      selectedGeneratedSlide === slide.num
                        ? slide.status === "failed"
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-[#0f5f7a] bg-[#0f5f7a] text-white"
                        : slide.status === "failed"
                          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {slide.num}
                  </button>
                ))}
                </div>
              </div>
              {isGeneratedStale && displaySelectedSlide?.imagePath && (
                <div
                  className="mt-2 w-fit rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700"
                  title="このプレビューは前の原稿から生成されています"
                >
                  原稿変更あり
                </div>
              )}
              <div
                className="mt-3 aspect-video overflow-hidden border border-slate-200 rounded-xl relative"
                style={{ background: themeStyle.bg, color: themeStyle.text }}
              >
                {displaySelectedSlide?.status === "failed" ? (
                  <div className="flex h-full flex-col justify-center p-[18px]">
                    <small className="text-[10px] font-black tracking-wider text-red-500">
                      SLIDE {displaySelectedSlide.num}
                    </small>
                    <h3 className="mt-4 max-w-[86%] text-[18px] font-bold leading-[1.3] text-red-600">
                      このスライドの生成に失敗しました
                    </h3>
                    <p className="mt-2 max-w-[82%] text-[11px] leading-[1.7] text-slate-500">
                      {displaySelectedSlide.error ??
                        "成功したスライドは残したまま、この1枚だけ再試行できます。"}
                    </p>
                    <button
                      type="button"
                      onClick={() => retryMockSlide(displaySelectedSlide.num)}
                      disabled={isMockGenerating}
                      className="mt-4 w-fit rounded-lg bg-red-600 px-3 py-2 text-[12px] font-black text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      この1枚を再試行
                    </button>
                  </div>
                ) : displaySelectedSlide?.imagePath ? (
                  <img
                    src={displaySelectedSlide.imagePath}
                    alt={`生成スライド ${displaySelectedSlide.num}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col justify-center p-[18px]">
                    <small className="text-[10px] font-black tracking-wider text-slate-400">
                      SLIDE {displaySelectedSlide?.num ?? 1}
                    </small>
                    <h3 className="mt-4 max-w-[86%] text-[18px] font-bold leading-[1.3]">
                      生成前プレビュー
                    </h3>
                    <p className="mt-2 max-w-[82%] text-[11px] leading-[1.7] opacity-70">
                      条件を選び、「この条件で{currentScript.length}枚生成」を押すとここに最新結果が表示されます。
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-3 text-[11px] text-slate-500 leading-[1.6]">
                選択中: {displaySelectedSlide ? `${displaySelectedSlide.num}枚目` : "-"}
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
            {displaySelectedSlide?.imagePath ? (
              <img
                src={displaySelectedSlide.imagePath}
                alt={`生成スライド ${displaySelectedSlide.num}`}
                className="w-full rounded-lg shadow-2xl"
              />
            ) : (
              <div className="aspect-video rounded-lg bg-white p-10 text-slate-700 shadow-2xl">
                まだ生成されていません
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-white text-sm">
                {displaySelectedSlide
                  ? `スライド ${displaySelectedSlide.num}: ${displaySelectedSlide.title}`
                  : "生成スライド"}
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
