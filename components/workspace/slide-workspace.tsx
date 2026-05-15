"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

type Theme = "lecture" | "bootcamp";
type ContentTheme = "lecture" | "bootcamp";
type ColorTheme = "lecture" | "bootcamp";
type ScriptBlock = { num: number; text: string; count: number };
type ParagraphMetric = { num: number; top: number; height: number };
type SettingSource = "recommended" | "manual";

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

function normalizeParagraphText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function hashText(text: string) {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// contenteditable は段落間を BR で表現するため、テキストノードと BR を
// まとめて innerText 相当の1次元テキストにマップする。
type EditorSegment =
  | { kind: "text"; node: Text; start: number; end: number }
  | { kind: "br"; node: HTMLBRElement; offset: number };

function buildEditorLinearMap(editor: HTMLElement): {
  text: string;
  segments: EditorSegment[];
} {
  let text = "";
  const segments: EditorSegment[] = [];
  const walker = document.createTreeWalker(
    editor,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT
  );
  let node: Node | null = walker.currentNode;
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const start = text.length;
      text += textNode.data;
      segments.push({ kind: "text", node: textNode, start, end: text.length });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.tagName === "BR") {
        segments.push({ kind: "br", node: element as HTMLBRElement, offset: text.length });
        text += "\n";
      }
    }
    node = walker.nextNode();
  }
  return { text, segments };
}

function caretOffsetInLinearText(
  editor: HTMLElement,
  segments: EditorSegment[]
): number | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return null;

  const container = range.startContainer;
  const offsetIn = range.startOffset;

  if (container.nodeType === Node.TEXT_NODE) {
    for (const segment of segments) {
      if (segment.kind === "text" && segment.node === container) {
        return segment.start + Math.min(offsetIn, segment.node.length);
      }
    }
    return null;
  }

  // anchor が要素 (editor 直下や BR の親) の場合: その要素の childNodes[offsetIn]
  // より前にあるテキスト長を積み上げる
  let consumed = 0;
  const children = container.childNodes;
  const limit = Math.min(offsetIn, children.length);
  for (let i = 0; i < limit; i += 1) {
    const child = children[i];
    if (child.nodeType === Node.TEXT_NODE) {
      consumed += (child as Text).length;
    } else if ((child as HTMLElement).tagName === "BR") {
      consumed += 1;
    } else {
      consumed += (child.textContent ?? "").length;
    }
  }
  // container 自体が editor でない場合、container より前のセグメントを足す
  if (container !== editor) {
    for (const segment of segments) {
      if (segment.kind === "text" && container.contains(segment.node)) {
        consumed = Math.max(consumed, segment.end);
        break;
      }
    }
  }
  return consumed;
}

function getCaretParagraphNum(editor: HTMLElement): number | null {
  const { segments } = buildEditorLinearMap(editor);
  const offset = caretOffsetInLinearText(editor, segments);
  if (offset === null) return null;
  const before = (() => {
    let acc = "";
    for (const segment of segments) {
      if (segment.kind === "text") {
        const remaining = offset - acc.length;
        if (remaining <= 0) break;
        acc += segment.node.data.slice(0, Math.min(segment.node.length, remaining));
      } else {
        if (acc.length >= offset) break;
        acc += "\n";
      }
    }
    return acc;
  })();
  return before.split(/\n[ \t]*\n/).length;
}

function focusParagraphAt(editor: HTMLElement, paragraphNum: number) {
  const { text, segments } = buildEditorLinearMap(editor);

  const targetNum = Math.max(1, paragraphNum);
  let targetOffset = 0;
  if (targetNum > 1) {
    const separator = /\n[ \t]*\n/g;
    let blockIdx = 1;
    let match: RegExpExecArray | null;
    while ((match = separator.exec(text)) !== null) {
      blockIdx += 1;
      if (blockIdx === targetNum) {
        targetOffset = match.index + match[0].length;
        break;
      }
    }
    if (blockIdx < targetNum) {
      targetOffset = text.length;
    }
  }

  let chosenNode: Text | null = null;
  let chosenOffset = 0;
  for (const segment of segments) {
    if (segment.kind === "text") {
      if (targetOffset >= segment.start && targetOffset <= segment.end) {
        chosenNode = segment.node;
        chosenOffset = targetOffset - segment.start;
        break;
      }
    }
  }

  if (!chosenNode) {
    // targetOffset が BR の位置 → 直後の text segment へ寄せる
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (segment.kind === "br" && segment.offset >= targetOffset) {
        const next = segments[i + 1];
        if (next && next.kind === "text") {
          chosenNode = next.node;
          chosenOffset = 0;
          break;
        }
      }
    }
  }

  if (!chosenNode) {
    // フォールバック: 末尾のテキストノード
    for (let i = segments.length - 1; i >= 0; i -= 1) {
      const segment = segments[i];
      if (segment.kind === "text") {
        chosenNode = segment.node;
        chosenOffset = segment.node.length;
        break;
      }
    }
  }

  if (!chosenNode) {
    editor.focus();
    return;
  }

  const range = document.createRange();
  range.setStart(chosenNode, chosenOffset);
  range.collapse(true);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  editor.focus();
  chosenNode.parentElement?.scrollIntoView({ block: "center", behavior: "smooth" });
}

function createParagraphFingerprint(text: string) {
  return hashText(normalizeParagraphText(text));
}

// イラスト候補
const ILLUSTRATION_OPTIONS = [
  { id: "step", label: "経歴ステップ" },
  { id: "graph", label: "数字グラフ" },
  { id: "team", label: "チーム構成" },
];

// テンプレートカタログ。保存と生成には安定ID、UIには用途名を使う。
const TEMPLATE_CATALOG = [
  { id: "T01", label: "ストーリー", description: "変化やビフォーアフターを見せる" },
  { id: "T02", label: "疑問提示", description: "読者の不安や問いを並べる" },
  { id: "T03", label: "証拠提示", description: "実績・事例・根拠で答える" },
  { id: "T04", label: "数字強調", description: "金額・期間・割合を大きく見せる" },
  { id: "T05", label: "手順説明", description: "ステップや流れを整理する" },
  { id: "T06", label: "比較", description: "他社・過去・選択肢との差を見せる" },
  { id: "T07", label: "CTA", description: "申込・相談など次の行動を促す" },
  ...Array.from({ length: 10 }, (_, i) => {
    const n = i + 8;
    const id = `T${String(n).padStart(2, "0")}`;
    return { id, label: `汎用 ${id}`, description: "汎用レイアウト" };
  }),
] as const;

const TEMPLATES = TEMPLATE_CATALOG.map((template) => ({
  ...template,
  src: `/templates/${template.id}.png`,
}));

const DEFAULT_TEMPLATE_ID = "T01";
const DEFAULT_ILLUSTRATION_ID = "step";

function getTemplateById(templateId: string) {
  return TEMPLATES.find((template) => template.id === templateId) ?? TEMPLATES[0];
}

function getIllustrationById(illustrationId: string) {
  return (
    ILLUSTRATION_OPTIONS.find((illustration) => illustration.id === illustrationId) ??
    ILLUSTRATION_OPTIONS[0]
  );
}

function recommendSlideSettings(text: string): {
  templateId: string;
  illustrationId: string;
} {
  const normalized = normalizeParagraphText(text);

  if (/申し込|参加|相談|募集|ボタン|お待ち|決めるだけ|LINE/.test(normalized)) {
    return { templateId: "T07", illustrationId: "step" };
  }
  if (/価格|受講料|円|月々|分割|一括|回収|元|万円|251/.test(normalized)) {
    return { templateId: "T04", illustrationId: "graph" };
  }
  if (/ステップ|流れ|第1|第2|第3|購入|予習|本番|補講/.test(normalized)) {
    return { templateId: "T05", illustrationId: "step" };
  }
  if (/違い|他の|比較|スクール|ではない|私は違/.test(normalized)) {
    return { templateId: "T06", illustrationId: "team" };
  }
  if (/証拠|実績|1期生|SNS|完成|構築|達成|データ|0\.1/.test(normalized)) {
    return { templateId: "T03", illustrationId: "graph" };
  }
  if (/本当に|できる|短すぎ|取れる|疑問|不安|どうなる|ですか|[?？]/.test(normalized)) {
    return { templateId: "T02", illustrationId: "team" };
  }
  return { templateId: DEFAULT_TEMPLATE_ID, illustrationId: DEFAULT_ILLUSTRATION_ID };
}

function createParagraphId(sectionId: number, block: ScriptBlock) {
  return `s${sectionId}-p${block.num}-${createParagraphFingerprint(block.text)}`;
}

function reconcileParagraphSettings(
  sectionId: number,
  scriptBlocks: ScriptBlock[],
  previousSettings: ParagraphSlideSetting[]
): ParagraphSlideSetting[] {
  const usedIndexes = new Set<number>();

  return scriptBlocks.map((block, index) => {
    const textFingerprint = createParagraphFingerprint(block.text);
    const exactIndex = previousSettings.findIndex((setting, settingIndex) => {
      if (usedIndexes.has(settingIndex)) return false;
      return setting.textFingerprint === textFingerprint;
    });
    const fallbackIndex =
      exactIndex >= 0
        ? exactIndex
        : index < previousSettings.length && !usedIndexes.has(index)
          ? index
          : -1;
    const recommended = recommendSlideSettings(block.text);

    if (fallbackIndex >= 0) {
      usedIndexes.add(fallbackIndex);
      const previous = previousSettings[fallbackIndex];
      // テキスト一致(exactIndex)時のみ採用状態を引き継ぐ。同位置 fallback では原稿が
      // 変わっているため、採用済みは外す。
      const isExactMatch = exactIndex >= 0;
      return {
        ...previous,
        textFingerprint,
        templateId:
          previous.templateSource === "manual" ? previous.templateId : recommended.templateId,
        illustrationId:
          previous.illustrationSource === "manual"
            ? previous.illustrationId
            : recommended.illustrationId,
        approvedImagePath: isExactMatch ? previous.approvedImagePath ?? null : null,
      };
    }

    return {
      paragraphId: createParagraphId(sectionId, block),
      textFingerprint,
      templateId: recommended.templateId,
      templateSource: "recommended",
      illustrationId: recommended.illustrationId,
      illustrationSource: "recommended",
      slideHistory: [],
      approvedImagePath: null,
    };
  });
}

const DEFAULT_BOOTCAMP_SUBTHEME_ID = "sub-bootcamp-default";
const DEFAULT_BOOTCAMP_SUBTHEME_NAME = "Claude Codeブートキャンプ販売スライド";

function createEmptyNavigation(): NavigationState {
  return {
    themes: {
      lecture: { subThemes: [] },
      bootcamp: { subThemes: [] },
    },
  };
}

function buildDefaultNavigation(): NavigationState {
  const nav = createEmptyNavigation();
  nav.themes.bootcamp.subThemes = [
    {
      id: DEFAULT_BOOTCAMP_SUBTHEME_ID,
      name: DEFAULT_BOOTCAMP_SUBTHEME_NAME,
      chapters: SALES_SECTIONS.map((section) => ({
        id: section.id,
        title: section.title,
      })),
    },
  ];
  return nav;
}

function ensureNavigation(state: unknown): NavigationState {
  if (
    state &&
    typeof state === "object" &&
    "themes" in state &&
    (state as NavigationState).themes &&
    (state as NavigationState).themes.lecture &&
    (state as NavigationState).themes.bootcamp
  ) {
    const candidate = state as NavigationState;
    return {
      themes: {
        lecture: {
          subThemes: Array.isArray(candidate.themes.lecture.subThemes)
            ? candidate.themes.lecture.subThemes
            : [],
        },
        bootcamp: {
          subThemes: Array.isArray(candidate.themes.bootcamp.subThemes)
            ? candidate.themes.bootcamp.subThemes
            : [],
        },
      },
    };
  }
  return buildDefaultNavigation();
}

function findChapterLocation(
  navigation: NavigationState,
  chapterId: number
): { theme: ContentTheme; subThemeId: string } | null {
  for (const themeKey of ["lecture", "bootcamp"] as const) {
    for (const sub of navigation.themes[themeKey].subThemes) {
      if (sub.chapters.some((chapter) => chapter.id === chapterId)) {
        return { theme: themeKey, subThemeId: sub.id };
      }
    }
  }
  return null;
}

function countApprovedSlidesForChapter(
  chapterId: number,
  sections: Record<number, WorkspaceV2SectionState>
): number {
  const paragraphs = sections[chapterId]?.paragraphs ?? [];
  return paragraphs.reduce(
    (sum, paragraph) => (paragraph.approvedImagePath ? sum + 1 : sum),
    0
  );
}

function countApprovedSlidesForSubTheme(
  subTheme: SubThemeEntry,
  sections: Record<number, WorkspaceV2SectionState>
): number {
  return subTheme.chapters.reduce(
    (sum, chapter) => sum + countApprovedSlidesForChapter(chapter.id, sections),
    0
  );
}

function computeNextChapterId(navigation: NavigationState): number {
  let max = 0;
  for (const themeKey of ["lecture", "bootcamp"] as const) {
    for (const sub of navigation.themes[themeKey].subThemes) {
      for (const chapter of sub.chapters) {
        if (chapter.id > max) max = chapter.id;
      }
    }
  }
  return max + 1;
}

function computeSectionProgress(
  scriptText: string,
  paragraphSettings: ParagraphSlideSetting[] | undefined,
  _generatedSlides: GeneratedSlide[] | undefined
): { approved: number; total: number } {
  // 採用判定は approvedImagePath を信頼源にする。
  // generatedSlides の状態（履歴復元・再生成で消えたか等）に左右されない。
  // 「採用フラグが立っている = 採用済み」というシンプルな約束に統一。
  const blocks = parseScript(scriptText);
  const total = blocks.length;
  if (total === 0 || !paragraphSettings) {
    return { approved: 0, total };
  }
  let approved = 0;
  for (let i = 0; i < total; i += 1) {
    const setting = paragraphSettings[i];
    if (setting && setting.approvedImagePath) approved += 1;
  }
  return { approved, total };
}

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
  paragraphId?: string;
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

type SlideHistoryEntry = {
  id: number;
  createdAt: string;
  slide: GeneratedSlide;
  templateId: string;
  templateLabel: string;
  illustrationId: string;
  illustrationLabel: string;
  colorTheme: ColorTheme;
};

type ParagraphSlideSetting = {
  paragraphId: string;
  textFingerprint: string;
  templateId: string;
  templateSource: SettingSource;
  illustrationId: string;
  illustrationSource: SettingSource;
  slideHistory: SlideHistoryEntry[];
  approvedImagePath: string | null;
};

type WorkspaceV2SectionState = {
  paragraphs: ParagraphSlideSetting[];
};

type ChapterEntry = {
  id: number;
  title: string;
};

type SubThemeEntry = {
  id: string;
  name: string;
  chapters: ChapterEntry[];
};

type NavigationState = {
  themes: Record<ContentTheme, { subThemes: SubThemeEntry[] }>;
};

type WorkspaceV2State = {
  navigation: NavigationState;
  sections: Record<number, WorkspaceV2SectionState>;
  briefing?: string;
};

type WorkspacePersistedState = {
  activeSection: number;
  contentTheme: ContentTheme;
  colorTheme: ColorTheme;
  activeTemplate: string;
  activeIllustration: string;
  selectedGeneratedSlidesBySection: Record<number, number>;
  generatedSlidesBySection: Record<number, GeneratedSlide[]>;
  generationHistoryBySection: Record<number, GenerationHistory[]>;
  latestGenerationSnapshotBySection: Record<number, GenerationHistory | null>;
  currentGenerationSourceLabelBySection: Record<number, string | null>;
  currentGenerationScriptTextBySection: Record<number, string | null>;
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
  const [selectedGeneratedSlidesBySection, setSelectedGeneratedSlidesBySection] =
    useState<Record<number, number>>({});
  const [generatedSlidesBySection, setGeneratedSlidesBySection] = useState<
    Record<number, GeneratedSlide[]>
  >({});
  const [generationHistoryBySection, setGenerationHistoryBySection] = useState<
    Record<number, GenerationHistory[]>
  >({});
  const [latestGenerationSnapshotBySection, setLatestGenerationSnapshotBySection] =
    useState<Record<number, GenerationHistory | null>>({});
  const [currentGenerationSourceLabelBySection, setCurrentGenerationSourceLabelBySection] =
    useState<Record<number, string | null>>({});
  const [currentGenerationScriptTextBySection, setCurrentGenerationScriptTextBySection] =
    useState<Record<number, string | null>>({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [generatingSections, setGeneratingSections] = useState<Record<number, boolean>>({});
  const [draftSaveStatus, setDraftSaveStatus] = useState<DraftSaveStatus>("loading");
  const [workspaceStateReady, setWorkspaceStateReady] = useState(false);
  const [workspaceV2State, setWorkspaceV2State] = useState<WorkspaceV2State>(() => ({
    navigation: createEmptyNavigation(),
    sections: {},
  }));
  const [workspaceV2Ready, setWorkspaceV2Ready] = useState(false);
  const [templateModalTargetSlide, setTemplateModalTargetSlide] = useState<number | null>(null);
  const [activeSubThemeIdByTheme, setActiveSubThemeIdByTheme] = useState<
    Record<ContentTheme, string | null>
  >({ lecture: null, bootcamp: DEFAULT_BOOTCAMP_SUBTHEME_ID });
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    confirmLabel?: string;
  } | null>(null);
  const [launchingPipeline, setLaunchingPipeline] = useState(false);
  const [pathSetupOpen, setPathSetupOpen] = useState(false);
  const [pathInput, setPathInput] = useState("");
  const [pathCopiedKey, setPathCopiedKey] = useState<string | null>(null);
  const [renamingChapterId, setRenamingChapterId] = useState<number | null>(null);
  const [renamingSubThemeId, setRenamingSubThemeId] = useState<string | null>(null);
  // 章ごとに編集中の原稿テキストを保持（state、リロードで消える）
  const [editedScripts, setEditedScripts] = useState<Record<number, string>>({});
  const hasLoadedDraftRef = useRef(false);
  const hasLoadedWorkspaceStateRef = useRef(false);
  const isRestoringWorkspaceStateRef = useRef(true);
  const workspaceStateRef = useRef<WorkspacePersistedState | null>(null);
  const workspaceV2StateRef = useRef<WorkspaceV2State>({
    navigation: createEmptyNavigation(),
    sections: {},
  });
  const draftScriptsRef = useRef<Record<number, string>>({});
  const editorRef = useRef<HTMLDivElement | null>(null);
  const measurementRef = useRef<HTMLDivElement | null>(null);
  const [paragraphMetrics, setParagraphMetrics] = useState<ParagraphMetric[]>([]);

  const activeSubThemeId = activeSubThemeIdByTheme[contentTheme];
  const currentSubTheme = useMemo(() => {
    const list = workspaceV2State.navigation.themes[contentTheme]?.subThemes ?? [];
    return list.find((sub) => sub.id === activeSubThemeId) ?? null;
  }, [workspaceV2State.navigation, contentTheme, activeSubThemeId]);
  const currentChapters: ChapterEntry[] = useMemo(
    () => currentSubTheme?.chapters ?? [],
    [currentSubTheme]
  );
  const currentSection =
    currentChapters.find((c) => c.id === activeSection) ?? currentChapters[0] ?? null;
  const sectionProgress = useMemo(() => {
    return currentChapters.reduce<Record<number, { approved: number; total: number }>>(
      (acc, chapter) => {
        const scriptText =
          editedScripts[chapter.id] ?? CHAPTER_DEFAULTS[chapter.id] ?? "";
        acc[chapter.id] = computeSectionProgress(
          scriptText,
          workspaceV2State.sections[chapter.id]?.paragraphs,
          generatedSlidesBySection[chapter.id]
        );
        return acc;
      },
      {}
    );
  }, [currentChapters, editedScripts, workspaceV2State, generatedSlidesBySection]);
  const sectionTotalApproved = Object.values(sectionProgress).reduce(
    (sum, p) => sum + p.approved,
    0
  );
  const sectionTotalSlides = Object.values(sectionProgress).reduce(
    (sum, p) => sum + p.total,
    0
  );
  const savedScriptText =
    editedScripts[activeSection] ?? CHAPTER_DEFAULTS[activeSection] ?? "";
  const currentScriptText = draftScriptsRef.current[activeSection] ?? savedScriptText;
  const currentScript = useMemo(
    () => parseScript(currentScriptText, { keepEmpty: true }),
    [currentScriptText]
  );
  const currentParagraphSettings = reconcileParagraphSettings(
    activeSection,
    currentScript,
    workspaceV2State.sections[activeSection]?.paragraphs ?? []
  );
  const themeStyle = THEMES[theme];
  const selectedGeneratedSlide = selectedGeneratedSlidesBySection[activeSection] ?? 1;
  const generatedSlides = generatedSlidesBySection[activeSection] ?? [];
  const generationHistory = generationHistoryBySection[activeSection] ?? [];
  const latestGenerationSnapshot = latestGenerationSnapshotBySection[activeSection] ?? null;
  const currentGenerationSourceLabel =
    currentGenerationSourceLabelBySection[activeSection] ?? null;
  const currentGenerationScriptText =
    currentGenerationScriptTextBySection[activeSection] ?? null;
  const isMockGenerating = generatingSections[activeSection] ?? false;

  const selectedParagraphSetting =
    currentParagraphSettings[selectedGeneratedSlide - 1] ?? currentParagraphSettings[0] ?? null;
  const selectedTemplate = selectedParagraphSetting
    ? getTemplateById(selectedParagraphSetting.templateId)
    : getTemplateById(DEFAULT_TEMPLATE_ID);
  const selectedIllustration = selectedParagraphSetting
    ? getIllustrationById(selectedParagraphSetting.illustrationId)
    : getIllustrationById(DEFAULT_ILLUSTRATION_ID);
  const illustrationLabel = selectedIllustration.label;
  const previewSlides = mergeGeneratedSlidesWithScript(
    currentScript,
    generatedSlides,
    currentParagraphSettings
  );
  const selectedGenerated =
    previewSlides.find((slide) => slide.num === selectedGeneratedSlide) ??
    previewSlides[0] ??
    null;
  const generatingSlide =
    previewSlides.find((slide) => slide.status === "generating") ?? null;
  const displaySelectedSlide =
    selectedGenerated ?? previewSlides[0] ?? null;
  const currentGenerationSummary =
    previewSlides.some((slide) => slide.status !== "idle" || slide.imagePath || slide.error)
      ? {
          slides: previewSlides,
          template: "スライド別",
          colorTheme,
        }
      : null;
  const isGeneratedStale =
    generatedSlides.length > 0 &&
    currentGenerationScriptText !== null &&
    normalizeScriptForComparison(currentGenerationScriptText) !==
      normalizeScriptForComparison(currentScriptText);
  const workspaceState = useMemo<WorkspacePersistedState>(
    () => ({
      activeSection,
      contentTheme,
      colorTheme,
      activeTemplate,
      activeIllustration,
      selectedGeneratedSlidesBySection,
      generatedSlidesBySection,
      generationHistoryBySection,
      latestGenerationSnapshotBySection,
      currentGenerationSourceLabelBySection,
      currentGenerationScriptTextBySection,
    }),
    [
      activeSection,
      contentTheme,
      colorTheme,
      activeTemplate,
      activeIllustration,
      selectedGeneratedSlidesBySection,
      generatedSlidesBySection,
      generationHistoryBySection,
      latestGenerationSnapshotBySection,
      currentGenerationSourceLabelBySection,
      currentGenerationScriptTextBySection,
    ]
  );

  useEffect(() => {
    setSelectedGeneratedSlidesBySection((prev) =>
      prev[activeSection] ? prev : { ...prev, [activeSection]: 1 }
    );
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
    let isMounted = true;

    function restoreSlidesBySection(
      sections: Record<number, GeneratedSlide[]> | undefined
    ): Record<number, GeneratedSlide[]> {
      return Object.fromEntries(
        Object.entries(sections ?? {}).map(([key, slides]) => [
          Number(key),
          (Array.isArray(slides) ? slides : []).map((slide) =>
            slide.status === "generating"
              ? {
                  ...slide,
                  status: "failed" as GeneratedSlideStatus,
                  error: slide.error ?? "前回生成中にブラウザを閉じたため、再生成してください",
                }
              : slide
          ),
        ])
      ) as Record<number, GeneratedSlide[]>;
    }

    async function loadWorkspaceState() {
      try {
        const response = await fetch("/api/workspace-state");
        const result = await response.json();
        if (!isMounted || !result.state) return;

        const state = result.state as Partial<WorkspacePersistedState>;
        if (typeof state.activeSection === "number") {
          setActiveSection(state.activeSection);
        }
        if (state.contentTheme) setContentTheme(state.contentTheme);
        if (state.colorTheme) setColorTheme(state.colorTheme);
        if (state.activeTemplate) setActiveTemplate(state.activeTemplate);
        if (state.activeIllustration) setActiveIllustration(state.activeIllustration);
        if (state.selectedGeneratedSlidesBySection) {
          setSelectedGeneratedSlidesBySection(state.selectedGeneratedSlidesBySection);
        }
        if (state.generatedSlidesBySection) {
          setGeneratedSlidesBySection(restoreSlidesBySection(state.generatedSlidesBySection));
        }
        if (state.generationHistoryBySection) {
          setGenerationHistoryBySection(state.generationHistoryBySection);
        }
        if (state.latestGenerationSnapshotBySection) {
          setLatestGenerationSnapshotBySection(state.latestGenerationSnapshotBySection);
        }
        if (state.currentGenerationSourceLabelBySection) {
          setCurrentGenerationSourceLabelBySection(state.currentGenerationSourceLabelBySection);
        }
        if (state.currentGenerationScriptTextBySection) {
          setCurrentGenerationScriptTextBySection(state.currentGenerationScriptTextBySection);
        }
      } catch {
        // 原稿下書きは別APIで復元できるため、作業状態の復元失敗だけで画面は止めない。
      } finally {
        hasLoadedWorkspaceStateRef.current = true;
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            isRestoringWorkspaceStateRef.current = false;
            if (isMounted) setWorkspaceStateReady(true);
          });
        });
      }
    }

    loadWorkspaceState();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaceV2State() {
      try {
        const response = await fetch("/api/workspace-state-v2");
        const result = await response.json();
        if (!isMounted) return;

        const raw =
          result.state && typeof result.state === "object"
            ? (result.state as Partial<WorkspaceV2State>)
            : null;
        const nextState: WorkspaceV2State = {
          navigation: ensureNavigation(raw?.navigation),
          sections: raw?.sections ?? {},
        };
        workspaceV2StateRef.current = nextState;
        setWorkspaceV2State(nextState);
      } catch {
        if (!isMounted) return;
        const fallback: WorkspaceV2State = {
          navigation: buildDefaultNavigation(),
          sections: {},
        };
        workspaceV2StateRef.current = fallback;
        setWorkspaceV2State(fallback);
      } finally {
        if (isMounted) setWorkspaceV2Ready(true);
      }
    }

    loadWorkspaceV2State();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    workspaceV2StateRef.current = workspaceV2State;
  }, [workspaceV2State]);

  // 大テーマを切り替えた / 小テーマが削除されたときに activeSubTheme を補正
  useEffect(() => {
    if (!workspaceV2Ready) return;
    const subThemes = workspaceV2State.navigation.themes[contentTheme]?.subThemes ?? [];
    const currentId = activeSubThemeIdByTheme[contentTheme];
    if (currentId && subThemes.some((s) => s.id === currentId)) return;
    const fallback = subThemes[0]?.id ?? null;
    if (currentId !== fallback) {
      setActiveSubThemeIdByTheme((prev) => ({ ...prev, [contentTheme]: fallback }));
    }
  }, [
    contentTheme,
    workspaceV2State.navigation,
    activeSubThemeIdByTheme,
    workspaceV2Ready,
  ]);

  // 小テーマ / 章リスト変化に応じて activeSection を補正
  useEffect(() => {
    if (!workspaceV2Ready) return;
    if (currentChapters.length === 0) return;
    if (!currentChapters.some((c) => c.id === activeSection)) {
      setActiveSection(currentChapters[0].id);
    }
  }, [currentChapters, activeSection, workspaceV2Ready]);

  useEffect(() => {
    if (!workspaceV2Ready) return;

    setWorkspaceV2State((prev) => {
      const previousParagraphs = prev.sections[activeSection]?.paragraphs ?? [];
      const nextParagraphs = reconcileParagraphSettings(
        activeSection,
        currentScript,
        previousParagraphs
      );

      if (JSON.stringify(previousParagraphs) === JSON.stringify(nextParagraphs)) {
        return prev;
      }

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [activeSection]: {
            ...(prev.sections[activeSection] ?? {}),
            paragraphs: nextParagraphs,
          },
        },
      };
    });
  }, [activeSection, currentScript, workspaceV2Ready]);

  useEffect(() => {
    if (!workspaceV2Ready) return;

    const timeoutId = window.setTimeout(async () => {
      try {
        await fetch("/api/workspace-state-v2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: workspaceV2StateRef.current }),
        });
      } catch {
        // v2メタデータは次の変更で再保存する。原稿と生成画像は触らない。
      }
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [workspaceV2Ready, workspaceV2State]);

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
    workspaceStateRef.current = workspaceState;
  }, [workspaceState]);

  async function persistWorkspaceStateNow(state: WorkspacePersistedState) {
    workspaceStateRef.current = state;
    await fetch("/api/workspace-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
  }

  useEffect(() => {
    // 生成状態は `handleGenerateSection` の完了時に明示保存する。
    // 広範囲の状態変更を常時保存すると、復元中の初期値で生成結果を上書きしやすい。
  }, [
    activeSection,
    contentTheme,
    colorTheme,
    activeTemplate,
    activeIllustration,
    selectedGeneratedSlidesBySection,
    generatedSlidesBySection,
    generationHistoryBySection,
    latestGenerationSnapshotBySection,
    currentGenerationSourceLabelBySection,
    currentGenerationScriptTextBySection,
    workspaceStateReady,
  ]);

  useEffect(() => {
    function saveBeforeUnload() {
      // 原稿は別APIで保存済み。生成結果は生成完了時に保存するため、
      // unload時の非同期保存で復元状態を壊さないようにする。
    }

    window.addEventListener("beforeunload", saveBeforeUnload);
    return () => window.removeEventListener("beforeunload", saveBeforeUnload);
  }, []);

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

  function setSelectedGeneratedSlideForSection(sectionId: number, slideNum: number) {
    setSelectedGeneratedSlidesBySection((prev) => ({
      ...prev,
      [sectionId]: slideNum,
    }));
  }

  // キャレット位置の段落 → 4区の選択中スライドへ追従
  useEffect(() => {
    function handleSelectionChange() {
      if (isMockGenerating) return;
      const editor = editorRef.current;
      if (!editor) return;
      const num = getCaretParagraphNum(editor);
      if (num === null) return;
      const clamped = Math.min(Math.max(1, num), Math.max(1, currentScript.length));
      if ((selectedGeneratedSlidesBySection[activeSection] ?? 1) === clamped) return;
      setSelectedGeneratedSlidesBySection((prev) => ({
        ...prev,
        [activeSection]: clamped,
      }));
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [
    activeSection,
    currentScript.length,
    isMockGenerating,
    selectedGeneratedSlidesBySection,
  ]);

  // 段落番号 → エディタ内の該当段落先頭にキャレットジャンプ＆スクロール
  function jumpToParagraph(num: number) {
    const editor = editorRef.current;
    if (!editor) return;
    setSelectedGeneratedSlideForSection(activeSection, num);
    // contenteditable に未フォーカスのまま focus() するとレイアウト直後の DOM が
    // 確定していない場合があるので、rAF で1回挟む
    window.requestAnimationFrame(() => {
      focusParagraphAt(editor, num);
    });
  }

  function updateParagraphSetting(
    paragraphId: string,
    updater: (setting: ParagraphSlideSetting) => ParagraphSlideSetting
  ) {
    setWorkspaceV2State((prev) => {
      const section = prev.sections[activeSection] ?? { paragraphs: currentParagraphSettings };
      const paragraphs = section.paragraphs.map((setting) =>
        setting.paragraphId === paragraphId ? updater(setting) : setting
      );

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [activeSection]: {
            ...section,
            paragraphs,
          },
        },
      };
    });
  }

  function updateSelectedSlideTemplate(templateId: string) {
    const setting = selectedParagraphSetting;
    if (!setting) return;
    updateParagraphSetting(setting.paragraphId, (current) => ({
      ...current,
      templateId,
      templateSource: "manual",
    }));
    setTemplateModalOpen(false);
    setTemplateModalTargetSlide(null);
  }

  function updateSelectedSlideIllustration(illustrationId: string) {
    const setting = selectedParagraphSetting;
    if (!setting) return;
    updateParagraphSetting(setting.paragraphId, (current) => ({
      ...current,
      illustrationId,
      illustrationSource: "manual",
    }));
  }

  const [exportStatus, setExportStatus] = useState<"idle" | "exporting">("idle");

  async function downloadApprovedSlides() {
    const slides: Array<{
      chapterNum: number;
      chapterTitle: string;
      slideNum: number;
      imagePath: string;
    }> = [];

    for (const chapter of currentChapters) {
      const scriptText = editedScripts[chapter.id] ?? CHAPTER_DEFAULTS[chapter.id] ?? "";
      const blocks = parseScript(scriptText);
      const paragraphSettings = workspaceV2State.sections[chapter.id]?.paragraphs ?? [];
      const savedSlides = generatedSlidesBySection[chapter.id] ?? [];
      for (let i = 0; i < blocks.length; i += 1) {
        const setting = paragraphSettings[i];
        if (!setting || !setting.approvedImagePath) continue;
        const matched = savedSlides.find(
          (slide) =>
            slide.paragraphId === setting.paragraphId &&
            slide.status === "done" &&
            slide.imagePath === setting.approvedImagePath
        );
        if (!matched || !matched.imagePath) continue;
        slides.push({
          chapterNum: chapter.id,
          chapterTitle: chapter.title,
          slideNum: i + 1,
          imagePath: matched.imagePath,
        });
      }
    }

    if (slides.length === 0) return;

    const datePart = (() => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
        d.getHours()
      )}${pad(d.getMinutes())}`;
    })();
    const zipName = `${headerTitle}_${datePart}`;

    setExportStatus("exporting");
    try {
      const response = await fetch("/api/export-approved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipName, slides }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? `HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${zipName}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? `書き出しに失敗しました: ${error.message}`
          : "書き出しに失敗しました"
      );
    } finally {
      setExportStatus("idle");
    }
  }

  function updateNavigation(updater: (nav: NavigationState) => NavigationState) {
    setWorkspaceV2State((prev) => ({
      ...prev,
      navigation: updater(prev.navigation),
    }));
  }

  function removeChapterRelatedState(chapterIds: number[]) {
    const purge = <T,>(rec: Record<number, T>): Record<number, T> => {
      const next: Record<number, T> = { ...rec };
      chapterIds.forEach((id) => delete next[id]);
      return next;
    };
    setEditedScripts((prev) => purge(prev));
    setGeneratedSlidesBySection((prev) => purge(prev));
    setSelectedGeneratedSlidesBySection((prev) => purge(prev));
    setGenerationHistoryBySection((prev) => purge(prev));
    setLatestGenerationSnapshotBySection((prev) => purge(prev));
    setCurrentGenerationSourceLabelBySection((prev) => purge(prev));
    setCurrentGenerationScriptTextBySection((prev) => purge(prev));
    chapterIds.forEach((id) => {
      delete draftScriptsRef.current[id];
    });
  }

  function addSubTheme(theme: ContentTheme) {
    const subThemeId = `sub-${Date.now()}`;
    const nextChapterId = computeNextChapterId(workspaceV2StateRef.current.navigation);
    const newChapter: ChapterEntry = { id: nextChapterId, title: "1. 新しい章" };
    updateNavigation((nav) => ({
      ...nav,
      themes: {
        ...nav.themes,
        [theme]: {
          subThemes: [
            ...nav.themes[theme].subThemes,
            { id: subThemeId, name: "新しい小テーマ", chapters: [newChapter] },
          ],
        },
      },
    }));
    setActiveSubThemeIdByTheme((prev) => ({ ...prev, [theme]: subThemeId }));
    setContentTheme(theme);
    setActiveSection(nextChapterId);
    setRenamingSubThemeId(subThemeId);
  }

  function renameSubTheme(theme: ContentTheme, subThemeId: string, newName: string) {
    const trimmed = newName.trim();
    setRenamingSubThemeId(null);
    if (!trimmed) return;
    updateNavigation((nav) => ({
      ...nav,
      themes: {
        ...nav.themes,
        [theme]: {
          subThemes: nav.themes[theme].subThemes.map((sub) =>
            sub.id === subThemeId ? { ...sub, name: trimmed } : sub
          ),
        },
      },
    }));
  }

  function requestDeleteSubTheme(theme: ContentTheme, subThemeId: string) {
    const sub = workspaceV2StateRef.current.navigation.themes[theme].subThemes.find(
      (s) => s.id === subThemeId
    );
    if (!sub) return;
    const approvedCount = countApprovedSlidesForSubTheme(
      sub,
      workspaceV2StateRef.current.sections
    );
    if (approvedCount > 0) {
      setConfirmState({
        title: "削除できません",
        message: `「${sub.name}」配下に採用済みスライドが${approvedCount}枚あります。各スライドの「採用解除」を押してから、もう一度削除してください。`,
        onConfirm: null,
      });
      return;
    }
    setConfirmState({
      title: "小テーマを削除",
      message: `「${sub.name}」とその配下の${sub.chapters.length}章をすべて削除します。原稿・採用状態・生成スライドメタも消えます。続けますか？`,
      onConfirm: () => {
        const chapterIds = sub.chapters.map((c) => c.id);
        setWorkspaceV2State((prev) => {
          const nextSections = { ...prev.sections };
          chapterIds.forEach((id) => delete nextSections[id]);
          return {
            ...prev,
            navigation: {
              ...prev.navigation,
              themes: {
                ...prev.navigation.themes,
                [theme]: {
                  subThemes: prev.navigation.themes[theme].subThemes.filter(
                    (s) => s.id !== subThemeId
                  ),
                },
              },
            },
            sections: nextSections,
          };
        });
        removeChapterRelatedState(chapterIds);
        const remaining = workspaceV2StateRef.current.navigation.themes[theme].subThemes.filter(
          (s) => s.id !== subThemeId
        );
        const nextActiveSubTheme = remaining[0]?.id ?? null;
        setActiveSubThemeIdByTheme((prev) => ({ ...prev, [theme]: nextActiveSubTheme }));
        const nextActiveChapter = remaining[0]?.chapters[0]?.id;
        if (nextActiveChapter !== undefined) setActiveSection(nextActiveChapter);
        setConfirmState(null);
      },
    });
  }

  // claude-cli:// deep link を発火してローカルの Claude Code を起動する。
  // 公式仕様: https://code.claude.com/docs/en/deep-links （Claude Code v2.1.91 以降）
  const LOCAL_CWD_STORAGE_KEY = "demo-04-slide-workspace:local-cwd";

  function fireLaunchDeepLink(cwd: string) {
    const prompt = "スライド原稿作成開始";
    const url = `claude-cli://open?cwd=${encodeURIComponent(cwd)}&q=${encodeURIComponent(prompt)}`;
    window.location.href = url;
    setConfirmState({
      title: "Claude Code を起動しました",
      message:
        "ローカルの Claude Code が立ち上がり、プロンプト「スライド原稿作成開始」がプリフィルされます。Enter で送信すると grill-me による原稿要件の対話が始まります。\n\n反映を確認するには、対話・パイプライン完了後にこの画面をリロードしてください。",
      confirmLabel: "OK",
      onConfirm: () => setConfirmState(null),
    });
  }

  function handleLaunchPipeline() {
    if (launchingPipeline) return;
    const saved = localStorage.getItem(LOCAL_CWD_STORAGE_KEY);
    if (!saved) {
      setPathInput("");
      setPathSetupOpen(true);
      return;
    }
    setLaunchingPipeline(true);
    try {
      fireLaunchDeepLink(saved);
    } catch (e) {
      window.alert(`起動失敗: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLaunchingPipeline(false);
    }
  }

  function handleSavePath() {
    const cwd = pathInput.trim();
    if (!cwd) return;
    localStorage.setItem(LOCAL_CWD_STORAGE_KEY, cwd);
    setPathSetupOpen(false);
    setLaunchingPipeline(true);
    try {
      fireLaunchDeepLink(cwd);
    } catch (e) {
      window.alert(`起動失敗: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLaunchingPipeline(false);
    }
  }

  async function copyPathHint(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setPathCopiedKey(key);
      window.setTimeout(() => setPathCopiedKey((prev) => (prev === key ? null : prev)), 1500);
    } catch {
      window.prompt("以下をコピーしてください:", text);
    }
  }

  function addChapter() {
    if (!currentSubTheme) return;
    const nextId = computeNextChapterId(workspaceV2StateRef.current.navigation);
    const chapterIndex = currentSubTheme.chapters.length + 1;
    const newChapter: ChapterEntry = {
      id: nextId,
      title: `${chapterIndex}. 新しい章`,
    };
    const subThemeId = currentSubTheme.id;
    const themeKey = contentTheme;
    updateNavigation((nav) => ({
      ...nav,
      themes: {
        ...nav.themes,
        [themeKey]: {
          subThemes: nav.themes[themeKey].subThemes.map((sub) =>
            sub.id === subThemeId
              ? { ...sub, chapters: [...sub.chapters, newChapter] }
              : sub
          ),
        },
      },
    }));
    setActiveSection(nextId);
    setRenamingChapterId(nextId);
  }

  function renameChapter(chapterId: number, newTitle: string) {
    const trimmed = newTitle.trim();
    setRenamingChapterId(null);
    if (!trimmed) return;
    updateNavigation((nav) => {
      const themes = { ...nav.themes } as NavigationState["themes"];
      (Object.keys(themes) as ContentTheme[]).forEach((themeKey) => {
        themes[themeKey] = {
          subThemes: themes[themeKey].subThemes.map((sub) => ({
            ...sub,
            chapters: sub.chapters.map((c) =>
              c.id === chapterId ? { ...c, title: trimmed } : c
            ),
          })),
        };
      });
      return { ...nav, themes };
    });
  }

  function requestDeleteChapter(chapterId: number) {
    const location = findChapterLocation(workspaceV2StateRef.current.navigation, chapterId);
    if (!location) return;
    const chapter = workspaceV2StateRef.current.navigation.themes[location.theme].subThemes
      .find((s) => s.id === location.subThemeId)
      ?.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    const approvedCount = countApprovedSlidesForChapter(
      chapterId,
      workspaceV2StateRef.current.sections
    );
    if (approvedCount > 0) {
      setConfirmState({
        title: "削除できません",
        message: `「${chapter.title}」には採用済みスライドが${approvedCount}枚あります。各スライドの「採用解除」を押してから、もう一度削除してください。`,
        onConfirm: null,
      });
      return;
    }
    setConfirmState({
      title: "章を削除",
      message: `「${chapter.title}」を削除します。原稿・採用状態・生成スライドメタも消えます。続けますか？`,
      onConfirm: () => {
        setWorkspaceV2State((prev) => {
          const nextSections = { ...prev.sections };
          delete nextSections[chapterId];
          return {
            ...prev,
            navigation: {
              ...prev.navigation,
              themes: {
                ...prev.navigation.themes,
                [location.theme]: {
                  subThemes: prev.navigation.themes[location.theme].subThemes.map((sub) =>
                    sub.id === location.subThemeId
                      ? { ...sub, chapters: sub.chapters.filter((c) => c.id !== chapterId) }
                      : sub
                  ),
                },
              },
            },
            sections: nextSections,
          };
        });
        removeChapterRelatedState([chapterId]);
        if (activeSection === chapterId) {
          const remaining =
            workspaceV2StateRef.current.navigation.themes[location.theme].subThemes
              .find((s) => s.id === location.subThemeId)
              ?.chapters.filter((c) => c.id !== chapterId) ?? [];
          if (remaining.length > 0) setActiveSection(remaining[0].id);
        }
        setConfirmState(null);
      },
    });
  }

  function toggleApprovedForSelected() {
    const setting = selectedParagraphSetting;
    if (!setting) return;
    if (
      !displaySelectedSlide ||
      displaySelectedSlide.status !== "done" ||
      !displaySelectedSlide.imagePath
    ) {
      return;
    }
    const slideKey = displaySelectedSlide.imagePath;
    updateParagraphSetting(setting.paragraphId, (current) => ({
      ...current,
      approvedImagePath: current.approvedImagePath === slideKey ? null : slideKey,
    }));
  }

  function clearApprovalForParagraph(sectionId: number, paragraphId: string | undefined) {
    if (!paragraphId) return;
    setWorkspaceV2State((prev) => {
      const section = prev.sections[sectionId];
      if (!section) return prev;
      const paragraphs = section.paragraphs.map((setting) =>
        setting.paragraphId === paragraphId && setting.approvedImagePath !== null
          ? { ...setting, approvedImagePath: null }
          : setting
      );
      return {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: { ...section, paragraphs },
        },
      };
    });
  }

  function appendSlideHistoryEntry(
    sectionId: number,
    paragraphId: string | undefined,
    entry: SlideHistoryEntry
  ) {
    if (!paragraphId) return;

    setWorkspaceV2State((prev) => {
      const section = prev.sections[sectionId] ?? { paragraphs: [] };
      const paragraphs = section.paragraphs.map((setting) =>
        setting.paragraphId === paragraphId
          ? {
              ...setting,
              slideHistory: [entry, ...(setting.slideHistory ?? [])],
            }
          : setting
      );

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: {
            ...section,
            paragraphs,
          },
        },
      };
    });
  }

  async function restoreSlideHistoryEntry(entry: SlideHistoryEntry) {
    const sectionId = activeSection;
    const restoredSlides = previewSlides.map((slide) =>
      slide.paragraphId === entry.slide.paragraphId
        ? {
            ...entry.slide,
            num: slide.num,
            sourceText: slide.sourceText,
            count: slide.count,
          }
        : slide
    );
    setGeneratedSlidesBySection((prev) => ({ ...prev, [sectionId]: restoredSlides }));
    clearApprovalForParagraph(sectionId, entry.slide.paragraphId);

    const baseState = workspaceStateRef.current ?? workspaceState;
    await persistWorkspaceStateNow({
      ...baseState,
      activeSection: sectionId,
      generatedSlidesBySection: {
        ...baseState.generatedSlidesBySection,
        [sectionId]: restoredSlides,
      },
      selectedGeneratedSlidesBySection: {
        ...baseState.selectedGeneratedSlidesBySection,
        [sectionId]: selectedGeneratedSlide,
      },
    });
  }

  function updateGeneratedSlidesForSection(
    sectionId: number,
    updater: (slides: GeneratedSlide[]) => GeneratedSlide[]
  ) {
    setGeneratedSlidesBySection((prev) => ({
      ...prev,
      [sectionId]: updater(prev[sectionId] ?? []),
    }));
  }

  function createPendingSlides(
    scriptBlocks = currentScript,
    paragraphSettings = currentParagraphSettings
  ): GeneratedSlide[] {
    return scriptBlocks.map((block, index) => ({
      num: block.num,
      paragraphId: paragraphSettings[index]?.paragraphId,
      sourceText: block.text,
      count: block.count,
      status: "idle",
      title: block.text.split("\n")[0]?.slice(0, 28) || `Slide ${block.num}`,
    }));
  }

  function normalizeSlideSource(text: string) {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\u00a0/g, " ")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();
  }

  function mergeGeneratedSlidesWithScript(
    scriptBlocks: ScriptBlock[],
    savedSlides: GeneratedSlide[],
    paragraphSettings: ParagraphSlideSetting[]
  ): GeneratedSlide[] {
    const usedSavedIndexes = new Set<number>();

    return scriptBlocks.map((block, blockIndex) => {
      const paragraphId = paragraphSettings[blockIndex]?.paragraphId;
      const blockKey = normalizeSlideSource(block.text);
      const paragraphIndex = paragraphId
        ? savedSlides.findIndex((slide, index) => {
            if (usedSavedIndexes.has(index)) return false;
            return slide.paragraphId === paragraphId;
          })
        : -1;
      const exactIndex = savedSlides.findIndex((slide, index) => {
        if (usedSavedIndexes.has(index)) return false;
        return slide.num === block.num && normalizeSlideSource(slide.sourceText) === blockKey;
      });
      const fallbackIndex =
        paragraphIndex >= 0
          ? paragraphIndex
          : exactIndex >= 0
          ? exactIndex
          : savedSlides.findIndex((slide, index) => {
              if (usedSavedIndexes.has(index)) return false;
              return normalizeSlideSource(slide.sourceText) === blockKey;
            });

      if (fallbackIndex >= 0) {
        usedSavedIndexes.add(fallbackIndex);
        const savedSlide = savedSlides[fallbackIndex];
        return {
          ...savedSlide,
          num: block.num,
          paragraphId,
          sourceText: block.text,
          count: block.count,
          title: savedSlide.title || block.text.split("\n")[0]?.slice(0, 28) || `Slide ${block.num}`,
        };
      }

      return {
        num: block.num,
        paragraphId,
        sourceText: block.text,
        count: block.count,
        status: "idle",
        title: block.text.split("\n")[0]?.slice(0, 28) || `Slide ${block.num}`,
      };
    });
  }

  async function generateSlideImage(
    slide: GeneratedSlide,
    context: {
      sectionTitle: string;
      template: string;
      illustration: string;
      colorTheme: ColorTheme;
    }
  ) {
    const response = await fetch("/api/regenerate-slide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionTitle: context.sectionTitle,
        script: slide.sourceText,
        template: context.template,
        illustration: context.illustration,
        colorTheme: context.colorTheme,
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
    const sectionId = activeSection;
    const sectionTitle = (currentSection?.title ?? "");
    const sourceScriptText = currentScriptText;
    const scriptBlocks = currentScript;
    const generationColorTheme = colorTheme;
    if (
      currentScript.length > 10 &&
      !window.confirm(`${currentScript.length}枚生成します。続けますか？`)
    ) {
      return;
    }

    setLatestGenerationSnapshotBySection((prev) => ({ ...prev, [sectionId]: null }));
    setCurrentGenerationSourceLabelBySection((prev) => ({ ...prev, [sectionId]: null }));

    const generatedSnapshotSlides = previewSlides.filter(
      (slide) => slide.status !== "idle" || slide.imagePath || slide.error
    );
    const historyEntry =
      generatedSnapshotSlides.length > 0
        ? {
            id: Date.now(),
            createdAt: new Date().toLocaleString("ja-JP"),
            scriptText: currentGenerationScriptText ?? currentScriptText,
            slides: generatedSnapshotSlides,
            template: "スライド別",
            illustration: "スライド別",
            colorTheme: generationColorTheme,
          }
        : null;
    const nextHistoryBySection = historyEntry
      ? {
          ...generationHistoryBySection,
          [sectionId]: [historyEntry, ...(generationHistoryBySection[sectionId] ?? [])],
        }
      : generationHistoryBySection;

    if (historyEntry) {
      setGenerationHistoryBySection(nextHistoryBySection);
    }

    setGeneratingSections((prev) => ({ ...prev, [sectionId]: true }));
    setCurrentGenerationScriptTextBySection((prev) => ({
      ...prev,
      [sectionId]: sourceScriptText,
    }));
    setSelectedGeneratedSlideForSection(sectionId, 1);

    // 採用済みスライド (= ロック対象) を特定する。
    // ロック対象は再生成で上書きせず、採用フラグも保持する。
    const lockedSlidesByParagraphId = new Map<string, GeneratedSlide>();
    {
      const existingSlides = generatedSlidesBySection[sectionId] ?? [];
      const currentSettings = workspaceV2StateRef.current.sections[sectionId]?.paragraphs ?? [];
      for (const slide of existingSlides) {
        if (!slide.paragraphId || slide.status !== "done" || !slide.imagePath) continue;
        const setting = currentSettings.find((s) => s.paragraphId === slide.paragraphId);
        if (setting && setting.approvedImagePath === slide.imagePath) {
          lockedSlidesByParagraphId.set(slide.paragraphId, slide);
        }
      }
    }

    const nextSlides = createPendingSlides(scriptBlocks, currentParagraphSettings).map(
      (slide) => {
        if (slide.paragraphId && lockedSlidesByParagraphId.has(slide.paragraphId)) {
          // ロック済みは現状の採用済みスライドをそのまま残す
          return { ...lockedSlidesByParagraphId.get(slide.paragraphId)!, num: slide.num };
        }
        return slide;
      }
    );
    let completedSlides = nextSlides;
    setGeneratedSlidesBySection((prev) => ({ ...prev, [sectionId]: nextSlides }));

    for (const slide of nextSlides) {
      // ロック済みスライドは再生成対象から外す
      if (slide.paragraphId && lockedSlidesByParagraphId.has(slide.paragraphId)) {
        continue;
      }
      const setting = currentParagraphSettings[slide.num - 1];
      const templateForSlide = getTemplateById(setting?.templateId ?? DEFAULT_TEMPLATE_ID);
      const illustrationForSlide = getIllustrationById(
        setting?.illustrationId ?? DEFAULT_ILLUSTRATION_ID
      );
      setSelectedGeneratedSlideForSection(sectionId, slide.num);
      completedSlides = completedSlides.map((item) =>
        item.num === slide.num ? { ...item, status: "generating", error: undefined } : item
      );
      updateGeneratedSlidesForSection(sectionId, (prev) =>
        prev.map((item) =>
          item.num === slide.num
            ? { ...item, status: "generating", error: undefined }
            : item
        )
      );

      try {
        const imagePath = await generateSlideImage(slide, {
          sectionTitle: `${sectionTitle} / ${slide.num}枚目`,
          template: templateForSlide.id,
          illustration: illustrationForSlide.label,
          colorTheme: generationColorTheme,
        });
        completedSlides = completedSlides.map((item) =>
          item.num === slide.num
            ? { ...item, status: "done", imagePath, error: undefined }
            : item
        );
        updateGeneratedSlidesForSection(sectionId, (prev) =>
          prev.map((item) =>
            item.num === slide.num
              ? { ...item, status: "done", imagePath, error: undefined }
              : item
          )
        );
        appendSlideHistoryEntry(sectionId, slide.paragraphId, {
          id: Date.now() + slide.num,
          createdAt: new Date().toLocaleString("ja-JP"),
          slide: { ...slide, status: "done", imagePath, error: undefined },
          templateId: templateForSlide.id,
          templateLabel: templateForSlide.label,
          illustrationId: illustrationForSlide.id,
          illustrationLabel: illustrationForSlide.label,
          colorTheme: generationColorTheme,
        });
      } catch (error) {
        completedSlides = completedSlides.map((item) =>
          item.num === slide.num
            ? {
                ...item,
                status: "failed",
                imagePath: undefined,
                error: error instanceof Error ? error.message : "生成に失敗しました",
              }
            : item
        );
        updateGeneratedSlidesForSection(sectionId, (prev) =>
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

    setGeneratingSections((prev) => ({ ...prev, [sectionId]: false }));
    const baseState = workspaceStateRef.current ?? workspaceState;
    await persistWorkspaceStateNow({
      ...baseState,
      activeSection: sectionId,
      contentTheme,
      colorTheme: generationColorTheme,
      activeTemplate: selectedTemplate.id,
      activeIllustration,
      selectedGeneratedSlidesBySection: {
        ...baseState.selectedGeneratedSlidesBySection,
        [sectionId]: completedSlides[completedSlides.length - 1]?.num ?? 1,
      },
      generatedSlidesBySection: {
        ...baseState.generatedSlidesBySection,
        [sectionId]: completedSlides,
      },
      generationHistoryBySection: nextHistoryBySection,
      latestGenerationSnapshotBySection: {
        ...baseState.latestGenerationSnapshotBySection,
        [sectionId]: null,
      },
      currentGenerationSourceLabelBySection: {
        ...baseState.currentGenerationSourceLabelBySection,
        [sectionId]: null,
      },
      currentGenerationScriptTextBySection: {
        ...baseState.currentGenerationScriptTextBySection,
        [sectionId]: sourceScriptText,
      },
    });
  }

  async function retryMockSlide(slideNum: number) {
    const sectionId = activeSection;
    const targetSlide = previewSlides.find((slide) => slide.num === slideNum);
    if (!targetSlide) return;
    const setting = currentParagraphSettings[slideNum - 1];

    // ロック判定: 採用済みスライドは再生成しない
    if (
      setting?.approvedImagePath &&
      targetSlide.imagePath === setting.approvedImagePath
    ) {
      window.alert(
        "このスライドは採用済みのためロックされています。\n再生成するには、まず「採用解除」を押してください。"
      );
      return;
    }

    const templateForSlide = getTemplateById(setting?.templateId ?? DEFAULT_TEMPLATE_ID);
    const illustrationForSlide = getIllustrationById(
      setting?.illustrationId ?? DEFAULT_ILLUSTRATION_ID
    );

    setGeneratingSections((prev) => ({ ...prev, [sectionId]: true }));
    setSelectedGeneratedSlideForSection(sectionId, slideNum);
    clearApprovalForParagraph(sectionId, targetSlide.paragraphId);
    const nextBaseSlides: GeneratedSlide[] = previewSlides.map((slide) =>
      slide.num === slideNum ? { ...slide, status: "generating", error: undefined } : slide
    );
    setGeneratedSlidesBySection((prev) => ({ ...prev, [sectionId]: nextBaseSlides }));
    updateGeneratedSlidesForSection(sectionId, (prev) =>
      prev.map((item) =>
        item.num === slideNum ? { ...item, status: "generating", error: undefined } : item
      )
    );

    try {
      const imagePath = await generateSlideImage(targetSlide, {
        sectionTitle: `${(currentSection?.title ?? "")} / ${targetSlide.num}枚目`,
        template: templateForSlide.id,
        illustration: illustrationForSlide.label,
        colorTheme,
      });
      const doneSlides: GeneratedSlide[] = nextBaseSlides.map((item) =>
        item.num === slideNum ? { ...item, status: "done", imagePath, error: undefined } : item
      );
      setGeneratedSlidesBySection((prev) => ({ ...prev, [sectionId]: doneSlides }));
      updateGeneratedSlidesForSection(sectionId, (prev) =>
        prev.map((item) =>
          item.num === slideNum
            ? { ...item, status: "done", imagePath, error: undefined }
            : item
        )
      );
      appendSlideHistoryEntry(sectionId, targetSlide.paragraphId, {
        id: Date.now() + slideNum,
        createdAt: new Date().toLocaleString("ja-JP"),
        slide: { ...targetSlide, status: "done", imagePath, error: undefined },
        templateId: templateForSlide.id,
        templateLabel: templateForSlide.label,
        illustrationId: illustrationForSlide.id,
        illustrationLabel: illustrationForSlide.label,
        colorTheme,
      });
      const baseState = workspaceStateRef.current ?? workspaceState;
      await persistWorkspaceStateNow({
        ...baseState,
        activeSection: sectionId,
        colorTheme,
        generatedSlidesBySection: {
          ...baseState.generatedSlidesBySection,
          [sectionId]: doneSlides,
        },
        selectedGeneratedSlidesBySection: {
          ...baseState.selectedGeneratedSlidesBySection,
          [sectionId]: slideNum,
        },
      });
    } catch (error) {
      const failedSlides: GeneratedSlide[] = nextBaseSlides.map((item) =>
        item.num === slideNum
          ? {
              ...item,
              status: "failed",
              imagePath: undefined,
              error: error instanceof Error ? error.message : "生成に失敗しました",
            }
          : item
      );
      setGeneratedSlidesBySection((prev) => ({ ...prev, [sectionId]: failedSlides }));
      updateGeneratedSlidesForSection(sectionId, (prev) =>
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
    setGeneratingSections((prev) => ({ ...prev, [sectionId]: false }));
  }

  // 履歴復元時、採用済みスライド（approvedImagePath が指すもの）はそのまま維持する。
  // - 履歴に同 paragraphId の slide があれば、採用済みの slide で置換する
  // - 履歴に含まれない採用済み paragraphId は、採用済み slide をそのまま追加する
  // これにより「履歴を切り替えても、過去に採用したスライドは必ず残る」を担保する。
  function mergeWithApprovedSlides(
    historySlides: GeneratedSlide[],
    sectionId: number
  ): GeneratedSlide[] {
    const settings = workspaceV2StateRef.current.sections[sectionId]?.paragraphs ?? [];
    const currentSlides = generatedSlidesBySection[sectionId] ?? [];
    const approvedByParagraphId = new Map<string, GeneratedSlide>();
    for (const slide of currentSlides) {
      if (!slide.paragraphId || slide.status !== "done" || !slide.imagePath) continue;
      const setting = settings.find((s) => s.paragraphId === slide.paragraphId);
      if (setting && setting.approvedImagePath === slide.imagePath) {
        approvedByParagraphId.set(slide.paragraphId, slide);
      }
    }
    if (approvedByParagraphId.size === 0) return historySlides;

    // 履歴の slide を走査して、同 paragraphId に採用済みがあれば置換
    const replaced = historySlides.map((slide) => {
      if (!slide.paragraphId) return slide;
      const approved = approvedByParagraphId.get(slide.paragraphId);
      return approved ? { ...approved, num: slide.num } : slide;
    });

    // 履歴に含まれていない採用済み paragraphId を追加
    const historyParagraphIds = new Set(
      historySlides.map((s) => s.paragraphId).filter((id): id is string => !!id)
    );
    const missingApproved: GeneratedSlide[] = [];
    approvedByParagraphId.forEach((slide, paragraphId) => {
      if (!historyParagraphIds.has(paragraphId)) {
        missingApproved.push(slide);
      }
    });

    if (missingApproved.length === 0) return replaced;
    // num 昇順に並べて返す（previewSlides 側で再 merge されるので最終位置はそちらで決まる）
    return [...replaced, ...missingApproved].sort((a, b) => a.num - b.num);
  }

  function restoreHistory(history: GenerationHistory, sourceLabel: string) {
    const sectionId = activeSection;
    if (!latestGenerationSnapshot && !currentGenerationSourceLabel && generatedSlides.length > 0) {
      setLatestGenerationSnapshotBySection((prev) => ({
        ...prev,
        [sectionId]: {
          id: Date.now(),
          createdAt: new Date().toLocaleString("ja-JP"),
          scriptText: currentGenerationScriptText ?? currentScriptText,
          slides: generatedSlides,
          template: activeTemplate,
          illustration: illustrationLabel,
          colorTheme,
        },
      }));
    }
    const mergedSlides = mergeWithApprovedSlides(history.slides, sectionId);
    setGeneratedSlidesBySection((prev) => ({ ...prev, [sectionId]: mergedSlides }));
    setActiveTemplate(history.template);
    setActiveIllustration(history.illustration);
    setColorTheme(history.colorTheme);
    setCurrentGenerationScriptTextBySection((prev) => ({
      ...prev,
      [sectionId]: history.scriptText,
    }));
    setCurrentGenerationSourceLabelBySection((prev) => ({
      ...prev,
      [sectionId]: sourceLabel,
    }));
    setSelectedGeneratedSlideForSection(sectionId, mergedSlides[0]?.num ?? 1);
    setHistoryOpen(false);
  }

  function restoreLatestGeneration() {
    if (!latestGenerationSnapshot) return;
    const sectionId = activeSection;
    const mergedSlides = mergeWithApprovedSlides(latestGenerationSnapshot.slides, sectionId);
    setGeneratedSlidesBySection((prev) => ({
      ...prev,
      [sectionId]: mergedSlides,
    }));
    setActiveTemplate(latestGenerationSnapshot.template);
    setActiveIllustration(latestGenerationSnapshot.illustration);
    setColorTheme(latestGenerationSnapshot.colorTheme);
    setCurrentGenerationScriptTextBySection((prev) => ({
      ...prev,
      [sectionId]: latestGenerationSnapshot.scriptText,
    }));
    setCurrentGenerationSourceLabelBySection((prev) => ({ ...prev, [sectionId]: null }));
    setSelectedGeneratedSlideForSection(sectionId, mergedSlides[0]?.num ?? 1);
    setLatestGenerationSnapshotBySection((prev) => ({ ...prev, [sectionId]: null }));
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

  const bigThemeLabel = contentTheme === "bootcamp" ? "CCブートキャンプ" : "講義スライド";
  const smallThemeLabel = currentSubTheme?.name ?? "";
  const headerTitle = smallThemeLabel
    ? `${bigThemeLabel} / ${smallThemeLabel}`
    : bigThemeLabel;

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f8fafc] text-[#162033]">
      <section
        className="grid h-full w-full"
        style={{ gridTemplateColumns: "292px 360px minmax(460px, 1fr) 390px" }}
        aria-label="4ペイン構成"
      >
        {/* === 1区: 全体ナビ === */}
        <article className="flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-[60px_1fr] items-center gap-3 px-3.5 min-h-[64px] border-b border-slate-200/50 bg-white">
              <img
                src="/addness-logo.png"
                alt="アドネス株式会社"
                className="block w-[60px] max-h-[32px] object-contain"
              />
              <div className="text-[16px] font-black leading-tight truncate text-[#172033]">
                Addness Slide Studio
              </div>
            </div>
            <div className="p-3.5 flex flex-col flex-1 min-h-0 overflow-auto">
            <nav className="grid gap-3 overflow-y-auto pr-1">
              {(["lecture", "bootcamp"] as const).map((themeKey) => {
                const themeLabel = themeKey === "bootcamp" ? "CCブートキャンプ" : "講義スライド";
                const themeSubs =
                  workspaceV2State.navigation.themes[themeKey]?.subThemes ?? [];
                const themeActive = contentTheme === themeKey;
                return (
                  <div key={themeKey} className="grid gap-1">
                    <button
                      type="button"
                      onClick={() => setContentTheme(themeKey)}
                      className={`flex items-center gap-2 min-h-[34px] px-2.5 rounded-[10px] text-left text-[12px] font-extrabold transition-colors ${
                        themeActive
                          ? "bg-slate-100 text-[#0f2f46]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="inline-flex w-4 h-4 rounded-[4px] border border-slate-300 bg-slate-50 items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-sm bg-slate-500" />
                      </span>
                      <span className="truncate">{themeLabel}</span>
                    </button>
                    <div className="grid gap-0.5 pl-3">
                      {themeSubs.map((sub) => {
                        const subActive =
                          themeActive && activeSubThemeId === sub.id;
                        const isRenaming = renamingSubThemeId === sub.id;
                        return (
                          <div
                            key={sub.id}
                            className={`group flex items-center gap-1 min-h-[32px] px-2 rounded-[8px] text-[12px] transition-colors ${
                              subActive
                                ? "bg-[#eef3f8] text-[#0f2f46] font-extrabold"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {isRenaming ? (
                              <input
                                autoFocus
                                defaultValue={sub.name}
                                onBlur={(e) => renameSubTheme(themeKey, sub.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    renameSubTheme(themeKey, sub.id, e.currentTarget.value);
                                  } else if (e.key === "Escape") {
                                    setRenamingSubThemeId(null);
                                  }
                                }}
                                className="flex-1 min-w-0 px-1.5 py-1 border border-[#0f5f7a] rounded text-[12px] bg-white"
                              />
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContentTheme(themeKey);
                                    setActiveSubThemeIdByTheme((prev) => ({
                                      ...prev,
                                      [themeKey]: sub.id,
                                    }));
                                    const firstChapter = sub.chapters[0];
                                    if (firstChapter) setActiveSection(firstChapter.id);
                                  }}
                                  className="flex-1 min-w-0 truncate text-left"
                                >
                                  {sub.name}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRenamingSubThemeId(sub.id)}
                                  aria-label="名前を編集"
                                  className="inline-flex items-center justify-center w-6 h-6 rounded text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:text-[#0f5f7a] hover:bg-white"
                                  title="名前を編集"
                                >
                                  ✎
                                </button>
                                <button
                                  type="button"
                                  onClick={() => requestDeleteSubTheme(themeKey, sub.id)}
                                  aria-label="この小テーマを削除"
                                  className="inline-flex items-center justify-center w-6 h-6 rounded text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:text-red-600 hover:bg-white"
                                  title="削除"
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => addSubTheme(themeKey)}
                        className="flex items-center gap-1.5 min-h-[28px] px-2 rounded-[8px] text-left text-[11px] font-semibold text-slate-400 hover:bg-slate-50 hover:text-[#0f5f7a]"
                      >
                        <span>+</span>
                        <span>小テーマを追加</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </nav>
            </div>
            <footer className="mt-auto min-h-[60px] flex items-center px-4 border-t border-slate-200/50 text-[11px] text-slate-400 leading-[1.6]">
              テーマ内容: {contentTheme === "bootcamp" ? "Claude Code 販売" : "講義"}
            </footer>
          </div>
        </article>

        {/* === 2区: セクション一覧 === */}
        <article className="flex flex-col border-r border-slate-200 bg-white overflow-hidden">
          <header className="px-[18px] min-h-[64px] flex flex-col justify-center border-b border-slate-200/50">
            <h2 className="text-[15px] leading-tight tracking-tight font-bold truncate">
              {headerTitle}
            </h2>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500">
                全体 {sectionTotalApproved}/{sectionTotalSlides}枚
              </p>
              <button
                type="button"
                onClick={handleLaunchPipeline}
                disabled={launchingPipeline}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-bold text-white bg-[#0f5f7a] hover:bg-[#134a60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                title="grill-me から原稿生成まで一気通貫で実行"
              >
                {launchingPipeline ? "起動中..." : "AIで原稿を作る"}
              </button>
            </div>
          </header>
          {workspaceV2State.briefing && (
            <div className="px-[18px] py-2.5 border-b border-slate-200/50 bg-slate-50">
              <div className="text-[9px] font-black tracking-[0.08em] text-slate-500 mb-1">
                案件・目的
              </div>
              <pre className="text-[11px] leading-[1.6] text-slate-600 whitespace-pre-wrap font-sans max-h-32 overflow-auto m-0">
                {workspaceV2State.briefing}
              </pre>
            </div>
          )}
          <div className="px-3.5 py-3 overflow-auto flex-1">
            {currentSubTheme ? (
              <div className="grid gap-1">
                {currentChapters.map((chapter) => {
                  const progress = sectionProgress[chapter.id] ?? { approved: 0, total: 0 };
                  const isComplete = progress.total > 0 && progress.approved >= progress.total;
                  const isActive = activeSection === chapter.id;
                  const isRenaming = renamingChapterId === chapter.id;
                  return (
                    <div
                      key={chapter.id}
                      className={`group grid grid-cols-[1fr_auto] gap-2 items-center min-h-[42px] px-3 py-2 rounded-[10px] transition-colors ${
                        isActive
                          ? "bg-[#eef3f8] text-[#0f2f46] font-extrabold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {isRenaming ? (
                        <input
                          autoFocus
                          defaultValue={chapter.title}
                          onBlur={(e) => renameChapter(chapter.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              renameChapter(chapter.id, e.currentTarget.value);
                            } else if (e.key === "Escape") {
                              setRenamingChapterId(null);
                            }
                          }}
                          className="col-span-2 min-w-0 px-2 py-1 border border-[#0f5f7a] rounded text-[12px] bg-white text-slate-800 font-semibold"
                        />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveSection(chapter.id)}
                            className="min-w-0 text-left text-[12px] truncate leading-[1.7]"
                          >
                            {chapter.title}
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setRenamingChapterId(chapter.id)}
                              aria-label="章タイトルを編集"
                              title="編集"
                              className="inline-flex items-center justify-center w-6 h-6 rounded text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:text-[#0f5f7a] hover:bg-white"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeleteChapter(chapter.id)}
                              aria-label="この章を削除"
                              title="削除"
                              className="inline-flex items-center justify-center w-6 h-6 rounded text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:text-red-600 hover:bg-white"
                            >
                              ×
                            </button>
                            <span
                              className={`text-[11px] leading-[1.7] whitespace-nowrap ${
                                isComplete
                                  ? "text-emerald-600 font-bold"
                                  : isActive
                                    ? "text-[#0f2f46]"
                                    : "text-slate-400"
                              }`}
                            >
                              {progress.approved}/{progress.total}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addChapter}
                  className="flex items-center gap-1.5 mt-1 min-h-[36px] px-3 rounded-[10px] text-left text-[12px] font-semibold text-slate-400 border border-dashed border-slate-300 hover:bg-slate-50 hover:text-[#0f5f7a] hover:border-[#0f5f7a]"
                >
                  <span>+</span>
                  <span>章を追加</span>
                </button>
              </div>
            ) : (
              <div className="rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-[12px] leading-[1.7] text-slate-500 text-center">
                小テーマがまだありません。
                <br />
                1区から「+ 小テーマを追加」してください。
              </div>
            )}
          </div>
          <footer className="mt-auto min-h-[60px] flex flex-col justify-center px-4 border-t border-slate-200/50 text-[12px] text-slate-500 leading-[1.6]">
            <span>進捗 {sectionTotalApproved}/{sectionTotalSlides}枚</span>
            <span>想定時間 12/15分</span>
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
                {(currentSection?.title ?? "")}
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
                <div className="relative min-h-[520px] select-none">
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
                      <button
                        type="button"
                        onClick={() => jumpToParagraph(block.num)}
                        disabled={isMockGenerating}
                        aria-label={`段落${block.num}にカーソルを移動`}
                        className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-black leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          selectedGeneratedSlide === block.num
                            ? "border-[#0f5f7a] bg-[#0f5f7a] text-white"
                            : "border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {block.num}
                      </button>
                      {nextMetric && (
                        <span
                          className="pointer-events-none absolute left-1/2 top-[34px] w-px -translate-x-1/2 bg-slate-200"
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
            <div className="flex items-center justify-between min-h-[60px] border-t border-slate-200/60 bg-white px-8 text-[11px] text-slate-400">
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
            {/* 選択中スライド設定 */}
            <div
              className={`border border-slate-200 rounded-xl bg-white p-3.5 transition-opacity ${
                isMockGenerating ? "opacity-55 pointer-events-none" : ""
              }`}
              aria-disabled={isMockGenerating}
            >
              <div className="flex justify-between gap-2 mb-2.5 text-slate-700 text-[13px] font-black">
                <span>選択中スライド設定</span>
                <span className="text-[11px] text-slate-400">
                  {selectedParagraphSetting ? `スライド${selectedGeneratedSlide}` : "-"}
                </span>
              </div>
              <div className="grid gap-2.5">
                <div className="flex items-center justify-between gap-2.5 px-3 py-2.5 border border-slate-200 rounded-[10px] bg-slate-50">
                  <div className="min-w-0">
                    <span className="block truncate text-slate-700 text-[13px] font-black">
                      {selectedTemplate.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold text-slate-400">
                      {selectedParagraphSetting?.templateSource === "manual"
                        ? "手動設定"
                        : "AIおすすめ"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateModalTargetSlide(selectedGeneratedSlide);
                      setTemplateModalOpen(true);
                    }}
                    className="min-h-[30px] px-2.5 border border-slate-200 rounded-lg bg-white text-slate-600 text-[12px] font-extrabold hover:bg-slate-50"
                  >
                    変更
                  </button>
                </div>
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
                    onClick={() => updateSelectedSlideIllustration(opt.id)}
                    className={`grid gap-2 p-2 border rounded-[10px] text-[11px] font-extrabold text-center transition-colors ${
                      selectedIllustration.id === opt.id
                        ? "border-[#0f5f7a] bg-cyan-50 text-[#0f5f7a]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-200 to-white" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] font-bold text-slate-400">
                {selectedParagraphSetting?.illustrationSource === "manual"
                  ? "このスライドの手動設定"
                  : "このスライドのAIおすすめ"}
              </p>
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
                    ? `各条件で${currentScript.length}枚再生成`
                    : `各条件で${currentScript.length}枚生成`}
              </button>
              <button
                type="button"
                onClick={() => retryMockSlide(selectedGeneratedSlide)}
                disabled={isMockGenerating || !displaySelectedSlide}
                className="mt-2 w-full min-h-[38px] rounded-lg border border-slate-200 bg-white text-[12px] font-extrabold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                選択中の1枚だけ生成
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
                {previewSlides.map((slide) => {
                  const setting = currentParagraphSettings[slide.num - 1];
                  const isApproved =
                    slide.status === "done" &&
                    !!slide.imagePath &&
                    setting?.approvedImagePath === slide.imagePath;
                  const isSelected = selectedGeneratedSlide === slide.num;
                  const isFailed = slide.status === "failed";
                  const classes = isSelected
                    ? isFailed
                      ? "border-red-600 bg-red-600 text-white"
                      : isApproved
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-[#0f5f7a] bg-[#0f5f7a] text-white"
                    : isFailed
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : isApproved
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100";
                  return (
                    <button
                      key={slide.num}
                      type="button"
                      onClick={() => jumpToParagraph(slide.num)}
                      aria-label={`スライド${slide.num}を選択${isApproved ? "（採用済み・ロック中）" : ""}`}
                      className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-black transition-colors ${classes}`}
                    >
                      {slide.num}
                      {isApproved && (
                        <span
                          className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow"
                          aria-hidden="true"
                          title="採用済み・ロック中"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-2.5 w-2.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1a4 4 0 0 0-4 4v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 7V5a2 2 0 1 0-4 0v3h4Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
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
                  <>
                    <img
                      src={displaySelectedSlide.imagePath}
                      alt={`生成スライド ${displaySelectedSlide.num}`}
                      className="h-full w-full object-cover"
                    />
                    {selectedParagraphSetting?.approvedImagePath ===
                      displaySelectedSlide.imagePath && (
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 1a4 4 0 0 0-4 4v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V5a4 4 0 0 0-4-4Zm2 7V5a2 2 0 1 0-4 0v3h4Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        採用済み（ロック中）
                      </span>
                    )}
                  </>
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
              {displaySelectedSlide?.status === "done" && displaySelectedSlide.imagePath ? (
                (() => {
                  const isApprovedSelected =
                    selectedParagraphSetting?.approvedImagePath ===
                    displaySelectedSlide.imagePath;
                  return (
                    <button
                      type="button"
                      onClick={toggleApprovedForSelected}
                      disabled={isMockGenerating}
                      className={`mt-3 w-full min-h-[40px] rounded-lg text-[13px] font-extrabold transition-colors disabled:opacity-50 ${
                        isApprovedSelected
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "border border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
                      }`}
                    >
                      {isApprovedSelected ? "採用解除" : "これに決定"}
                    </button>
                  );
                })()
              ) : null}
              <p className="mt-3 text-[11px] text-slate-500 leading-[1.6]">
                選択中: {displaySelectedSlide ? `${displaySelectedSlide.num}枚目` : "-"}
                {selectedParagraphSetting?.approvedImagePath &&
                displaySelectedSlide?.imagePath === selectedParagraphSetting.approvedImagePath
                  ? "（採用済み）"
                  : displaySelectedSlide?.status === "done"
                    ? "（未採用）"
                    : ""}
              </p>
              {(() => {
                const remaining = Math.max(0, sectionTotalSlides - sectionTotalApproved);
                const canExport =
                  sectionTotalSlides > 0 && remaining === 0 && exportStatus !== "exporting";
                return (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={downloadApprovedSlides}
                      disabled={!canExport}
                      className={`w-full min-h-[44px] rounded-lg text-[13px] font-extrabold transition-colors ${
                        canExport
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {exportStatus === "exporting"
                        ? "ZIPを書き出し中..."
                        : remaining === 0 && sectionTotalSlides > 0
                          ? `採用済み${sectionTotalApproved}枚をZIPダウンロード`
                          : `あと${remaining}枚決定するとダウンロードできます`}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </article>
      </section>

      {/* === テンプレート選択モーダル === */}
      {templateModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setTemplateModalOpen(false);
            setTemplateModalTargetSlide(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-[1200px] max-h-[85vh] overflow-auto p-6 w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-3 border-b border-slate-200">
              <h2 className="text-xl font-black">
                スライド{templateModalTargetSlide ?? selectedGeneratedSlide}のテンプレートを選ぶ
              </h2>
              <button
                type="button"
                onClick={() => {
                  setTemplateModalOpen(false);
                  setTemplateModalTargetSlide(null);
                }}
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
                    updateSelectedSlideTemplate(tmpl.id);
                  }}
                  className={`border rounded-xl p-2 hover:border-[#0f5f7a] hover:shadow-md transition-all bg-white ${
                    selectedTemplate.id === tmpl.id ? "border-[#0f5f7a]" : "border-slate-200"
                  }`}
                >
                  <img
                    src={tmpl.src}
                    alt={tmpl.id}
                    className="w-full rounded-lg"
                  />
                  <div className="mt-2 text-[12px] font-bold text-slate-700 text-left px-1">
                    {tmpl.label}
                    <span className="ml-1 text-[10px] text-slate-400">{tmpl.id}</span>
                  </div>
                  <div className="mt-1 px-1 text-left text-[10px] leading-[1.4] text-slate-400">
                    {tmpl.description}
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

      {/* === 削除確認ダイアログ === */}
      {confirmState && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmState(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-[440px] w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[16px] font-black text-slate-800 mb-2">
              {confirmState.title}
            </h2>
            <p className="text-[13px] leading-[1.7] text-slate-600 mb-5">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-2">
              {confirmState.onConfirm ? (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmState(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 text-[12px] font-extrabold hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={confirmState.onConfirm}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-[12px] font-extrabold hover:bg-red-700"
                  >
                    {confirmState.confirmLabel ?? "削除する"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="px-4 py-2 rounded-lg bg-[#0f5f7a] text-white text-[12px] font-extrabold hover:bg-[#0d4f66]"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === ローカルパス設定モーダル (初回のみ) === */}
      {pathSetupOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPathSetupOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-[560px] w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[16px] font-black text-slate-800 mb-1">
              ローカル環境のパスを設定してください
            </h2>
            <p className="text-[12px] leading-[1.7] text-slate-600 mb-4">
              「AIで原稿を作る」を使うには、あなたのPC内の <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">demo-04-slide-workspace</code> フォルダの絶対パスが必要です。<span className="font-bold">一度設定すれば次回からは自動です。</span>
            </p>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 mb-4">
              <p className="text-[12px] font-black text-slate-700 mb-2">パスの調べ方</p>

              <div className="grid gap-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">macOS の場合</p>
                  <ol className="text-[11px] leading-[1.7] text-slate-600 list-decimal list-inside space-y-1.5">
                    <li>「ターミナル.app」または「iTerm」を開く（Finder → アプリケーション → ユーティリティ）</li>
                    <li>
                      <span>下記コマンドで clone した場所に移動 </span>
                      <span className="inline-flex items-center gap-1 ml-1">
                        <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">cd ~/Desktop/demo-04-slide-workspace</code>
                        <button
                          type="button"
                          onClick={() => copyPathHint("cd ~/Desktop/demo-04-slide-workspace", "mac-cd")}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-500 hover:text-[#0f5f7a]"
                        >
                          {pathCopiedKey === "mac-cd" ? "✓ コピー済み" : "コピー"}
                        </button>
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">（場所が違う人は適宜変更）</span>
                    </li>
                    <li>
                      <span>絶対パスを表示 </span>
                      <span className="inline-flex items-center gap-1 ml-1">
                        <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">pwd</code>
                        <button
                          type="button"
                          onClick={() => copyPathHint("pwd", "mac-pwd")}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-500 hover:text-[#0f5f7a]"
                        >
                          {pathCopiedKey === "mac-pwd" ? "✓ コピー済み" : "コピー"}
                        </button>
                      </span>
                    </li>
                    <li>表示された結果（<code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">/Users/...</code> で始まる行）をコピー</li>
                    <li>下の入力欄に貼り付け</li>
                  </ol>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">Windows の場合</p>
                  <ol className="text-[11px] leading-[1.7] text-slate-600 list-decimal list-inside space-y-1.5">
                    <li>エクスプローラーで <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">demo-04-slide-workspace</code> フォルダを開く</li>
                    <li>アドレスバーをクリック → 表示されたパスをコピー（例: <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">C:\Users\...\demo-04-slide-workspace</code>）</li>
                    <li>下の入力欄に貼り付け</li>
                  </ol>
                </div>
              </div>
            </div>

            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              絶対パス
            </label>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pathInput.trim()) handleSavePath();
              }}
              placeholder="/Users/yourname/Desktop/demo-04-slide-workspace"
              autoFocus
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-[12px] font-mono mb-4 focus:outline-none focus:border-[#0f5f7a]"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPathSetupOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 text-[12px] font-extrabold hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSavePath}
                disabled={!pathInput.trim()}
                className="px-4 py-2 rounded-lg bg-[#0f5f7a] text-white text-[12px] font-extrabold hover:bg-[#0d4f66] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存して起動
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
