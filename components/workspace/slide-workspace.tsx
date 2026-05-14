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

// CCブートキャンプ販売スライド原稿（各項目=1スライド）
const SALES_SECTIONS = [
  { id: 1, title: "1. 結論", slideCount: "1/1", slideIndex: 1 },
  { id: 2, title: "2. それ、本当？", slideCount: "1/1", slideIndex: 2 },
  { id: 3, title: "3. 未経験で本当にできるのか", slideCount: "1/1", slideIndex: 3 },
  { id: 4, title: "4. 7日でついていけるのか", slideCount: "1/1", slideIndex: 4 },
  { id: 5, title: "5. 元は取れるのか", slideCount: "1/1", slideIndex: 5 },
  { id: 6, title: "6. 他のAIスクールと何が違うのか", slideCount: "1/1", slideIndex: 6 },
  { id: 7, title: "7. おまけじゃなく、武器が手に入る", slideCount: "1/1", slideIndex: 7 },
  { id: 8, title: "8. 価格", slideCount: "1/1", slideIndex: 8 },
  { id: 9, title: "9. 受講の流れ", slideCount: "1/1", slideIndex: 9 },
  { id: 10, title: "10. CTA", slideCount: "1/1", slideIndex: 10 },
];

// 各スライドの講師ナレーション。1スライド=1ブロックにするため、ナレーション内は空行を入れない。
const CHAPTER_DEFAULTS: Record<number, string> = {
  1: `こんばんは。アドネス株式会社、佐藤将司です。
今日この1時間、お時間いただきます。
最初に、皆さんに少しだけ聞かせてください。
毎日PC開いて、終わるまでに、似たような作業を繰り返してませんか?
資料を作る、メールを返す、リサーチする、SNSに投稿する。
「これ、もっと効率よくできないのかな」って、1日に何回か頭をよぎる。違いますか?
そして、心のどこかで、こうも思ってませんか?
「副業を始めたい。でも本業で疲れて、結局何もしないまま1週間が終わる」。
「AIを使いこなせるようになりたい。でも、何から始めればいいか分からない」。
「このまま今の会社で、給料も上がらないまま、10年過ごすことになるんじゃないか」。
この3つの不安、今日この1時間で、全部にこちらから答えを出します。
答えは、画面に書いてある通りです。
プログラミング未経験から、7日でAIシステムが1本完成する。
「いやいや、無理でしょ」って、たぶん今思いましたよね。
でも、これは私が今、実際にやってることなんです。
うちの会社では、Claude Codeで作ったシステムを100個以上、毎日動かしてます。
私個人で、初月の売上が4,500万円。
そして1期生で、エクセルしか触ったことがなかった方が、参加から7日後、自分の業務を自動化するシステムを1本仕上げて出てきました。
これからの1時間で、なぜそれが可能なのか、未経験のあなたがどうやってそこに到達するのか、全部種明かししていきます。
最後まで聞き終わった時、「自分にもできそう」じゃなくて、「自分は何を作るか」まで決まってる状態になります。`,
  2: `ここで一旦止めます。
今、たぶん皆さんの頭の中、こうなってますよね。
「未経験で本当にできるの?」
「7日って短すぎない?」
「198,000円、本当に元取れる?」
「他のAIスクールと、何が違うの?」
「そもそも忙しい平日、時間取れないけど?」
この5つ、当たり前に出てくる疑問です。
こういう時に「大丈夫です、信じてください」って言うのは、私は嫌いなんです。
だから、次のページから1枚ずつ、事実で答えます。
5枚使います。1枚で1つの疑問を、潰します。`,
  3: `1つ目。「未経験で本当にできるの?」。
答え、できます。証拠を2つ出します。
1つ目、1期生。
プログラミングを一度もやったことがない方が、7日でシステムを1本完成させて出てきました。これは、ご本人がSNSで発信してます。
2つ目、私自身。
何度も言いますが、私はもとは公務員で、月給12万円、プログラミングは一切やったことがありませんでした。
そこからClaude Codeを始めて、今までに100個以上のシステムを構築してます。
なぜそれが可能か。理由はシンプルです。
Claude Codeは、日本語で「こういうもの作って」って話しかけるだけで動くからです。
コードを書きません。読みません。覚える必要も、ありません。
「AIに業務を依頼する」感覚です。これなら、未経験でも、初日からアウトプットが出ます。`,
  4: `2つ目の疑問、「7日でついていける?」。
ついでに、5つ目の「忙しくて時間ない」にも、ここで一緒に答えます。
実はこのブートキャンプ、「7日間だけ集中」ではないんです。3段階で支える構造にしてます。
第1段階、予習期間。
購入したその日から、講義動画と「アクションマップ」を、自分のペースで進められます。1日30分でOK。コミュニティで質問し放題なので、つまずいたら、すぐ聞けます。
第2段階、ブートキャンプ本番。
月・水・金・土の夜21時から、2時間ずつ。仕事終わりに参加できる時間にしてます。全4回、合計8時間。
第3段階、補講期間。
本番が終わった後、もう1ヶ月、コミュニティに残れます。作ったものへのフィードバックも、ここでもらえます。
つまり、「7日」だけを切り取ると短く見えますけど、実際には予習から補講まで、1ヶ月以上、伴走する構造です。
夜2時間 × 4回、これさえ確保できれば、未経験でも、ついていけます。`,
  5: `3つ目。「198,000円、本当に元は取れるの?」。
ここ、たぶん一番気になるところですよね。
結論から言います。月10万円の案件を、2件取れば、それで全額回収です。
計算します。
受講料が198,000円。Claude Codeの月額が約3,000円。
月10万円の案件を2件取った時点で、20万円。受講料と、1ヶ月分の月額、もう超えてます。
「でも、案件って簡単に取れるの?」って思いますよね。
ここで、1個データを見てください。
Claude Codeを仕事で使いこなしてる日本人、推定で0.1%未満です。
何が言いたいかというと、今、市場の供給が圧倒的に足りてない、ということです。
案件は、今、明らかに足りてないんです。
私自身、Claude Codeで作った案件探索システムで、営業の初月に1,000万円の案件を1本取りました。
これ、特殊なケースじゃないんです。Claude Codeを使えるだけで、市場での値段が一段上がるから、起きるんです。`,
  6: `4つ目。「他のAIスクールと、何が違うの?」。
正直に言います。今、世の中にAIスクールはたくさんあります。
そして、教えてる人の多くは、「AIを教える人」であって、「AIで稼いでる人」ではないんです。
私は違います。
私はもとは公務員、月給12万円、プログラミング経験ゼロ。
そこからClaude Codeを始めて、100個以上のシステムを構築して、Claude Codeを使い倒した結果、4人体制で初月売上4,500万円を達成しました。
つまり、皆さんがこれから学ぶ内容を、私は今、毎日仕事で使って、結果を出し続けてます。
「AIで稼ぐ方法」を、AIで現役で稼いでる人間が教える。
これが、他のAIスクールとの一番の違いです。
机上の空論を聞きに来てるんじゃないんです。今、動いてる現場の話を、そのまま持って帰ってもらいます。`,
  7: `ここまで、5つの疑問に答えてきました。
ここから、お渡しするものの中身をお話します。
ブートキャンプの講義と、本番の全4回。これが本体です。
ただし、それだけじゃありません。
2期生限定の特典として、アドネスが社内で実際に毎日使ってる12種のAIシステムを、そのままお渡しします。
中身、少しだけ紹介します。
・スライド自動生成、月額換算で40万円相当
・PPTX自動作成、20万円相当
・システム開発アシスタント、20万円相当
・LP制作、SNS自動投稿、案件探索、SEO記事生成 …まだあります
全部合わせて、1,736,000円相当です。
これ、動画を見て学んで終わり、じゃないんです。
学んだ翌日から、実務で使える武器が、12個、手元に揃います。
開いて話しかけるだけで、動きます。`,
  8: `ここで、価格を、お伝えします。
受講料は、198,000円(税抜)。
支払い方法は、クレジットカード、銀行振込、分割払いから選べます。
銀行振込で一括なら、5,000円引きです。
分割なら、月々約7,532円。
これを1日あたりに直すと、約251円です。
コンビニコーヒー1杯、ちょっといいパン1個、それくらいの金額です。
そして、さっき話したことを、もう一度思い出してください。
月10万円の案件を1件取った瞬間、半年分の月額を、もう超えます。
このセミナーを最後まで聞いてくださってる時点で、皆さんは、自分の時間を投資して、動き始めてる方です。
あとは、決めるかどうか、それだけです。`,
  9: `「申し込んだあと、どうなるの?」
ここを、ご説明します。
ステップ1、購入。
クレジットカード、銀行振込、分割、どれでもOKです。
ステップ2、予習期間。
購入したその瞬間から、講義動画とアクションマップに手をつけられます。
コミュニティに参加して、わからないことはすぐ質問してください。
ステップ3、ブートキャンプ本番。
月・水・金・土の夜21時から、全4回、皆で集まって手を動かします。
私もリアルタイムで参加します。つまずいたら、その場で解消します。
ステップ4、補講期間。
本番が終わった後、1ヶ月、コミュニティに残って質問し放題です。
特別な準備は要りません。PCとネット環境、それだけです。
申し込んだその日から、もう動き始められます。`,
  10: `最後に、お伝えします。
今、Claude Codeを仕事で使いこなしてる日本人は、0.1%未満。
これが意味するのは、今、参加するかしないかで、来年の自分が立ってる場所が、まったく違う景色になる、ということです。
このセミナーを最後まで聞いてくれてる時点で、皆さんはもう、その0.1%側に入る準備ができてる方です。
あとは、決めるだけです。
7日後、未経験のあなたが、自分の手で動かせるAIシステムを1本、持ってる状態に変わります。
これは、私が、確実にお約束します。
申し込みは、画面に出てるボタンから。
迷うところがあれば、LINEで個別相談もできます。私が直接お答えします。
募集枠には、限りがあります。
皆さんの参加、お待ちしてます。
本日は、ありがとうございました。`,
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
type DraftSaveStatus = "loading" | "saved" | "saving" | "error";

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
  const [draftSaveStatus, setDraftSaveStatus] = useState<DraftSaveStatus>("loading");
  // 章ごとに編集中の原稿テキストを保持（state、リロードで消える）
  const [editedScripts, setEditedScripts] = useState<Record<number, string>>({});
  const hasLoadedDraftRef = useRef(false);
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
    let isMounted = true;

    async function loadDraft() {
      try {
        const response = await fetch("/api/script-draft");
        const result = await response.json();
        if (!isMounted) return;

        const scripts = Object.fromEntries(
          Object.entries(result.scripts ?? {}).map(([key, value]) => [
            Number(key),
            String(value),
          ])
        ) as Record<number, string>;

        if (Object.keys(scripts).length > 0) {
          draftScriptsRef.current = scripts;
          setEditedScripts(scripts);
        }
        setDraftSaveStatus("saved");
      } catch {
        if (isMounted) setDraftSaveStatus("error");
      } finally {
        hasLoadedDraftRef.current = true;
      }
    }

    loadDraft();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedDraftRef.current) return;

    setDraftSaveStatus("saving");
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/script-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scripts: editedScripts }),
        });
        if (!response.ok) throw new Error("Failed to save draft");
        setDraftSaveStatus("saved");
      } catch {
        setDraftSaveStatus("error");
      }
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [editedScripts]);

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
              <div className="flex items-center gap-3">
                <span>
                  {draftSaveStatus === "loading"
                    ? "下書き確認中"
                    : draftSaveStatus === "saving"
                      ? "自動保存中..."
                      : draftSaveStatus === "error"
                        ? "自動保存エラー"
                        : "自動保存済み"}
                </span>
                <span>
                  総文字数 {currentScript.reduce((s, b) => s + b.count, 0)}字
                </span>
              </div>
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
