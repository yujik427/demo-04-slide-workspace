#!/bin/bash
# .env.local を A 側 .env と cc-slides .env からシングルクォート付きで再生成するスクリプト
# シングルクォートで囲むことで、dotenv の変数展開（$VAR）を防ぐ
set -e

T="/Users/yujikubo/Desktop/Reviatro-HQ/projects/portfolio-demo/demo-04-slide-workspace/.env.local"
A_ENV="/Users/yujikubo/Desktop/Reviatro-HQ/projects/crowdworks/deliverables/2026-05-09_cc-slide-generator-task/cc-slide-generator/.env"
CCS_ENV="/Users/yujikubo/Desktop/Reviatro-HQ/knowledge/tools/cc-slides/.env"

echo "1. 値を抽出（引用符を剥がす）"
ANT_VAL=$(grep '^ANTHROPIC_API_KEY=' "$A_ENV" | cut -d= -f2- | sed 's/^"//; s/"$//; s/^'\''//; s/'\''$//')
OAI_VAL=$(grep '^OPENAI_API_KEY=' "$CCS_ENV" | cut -d= -f2- | sed 's/^"//; s/"$//; s/^'\''//; s/'\''$//')

echo "   ANTHROPIC 値の長さ: ${#ANT_VAL} 文字"
echo "   OPENAI 値の長さ: ${#OAI_VAL} 文字"

echo ""
echo "2. .env.local をシングルクォート付きで再生成"
> "$T"
printf "ANTHROPIC_API_KEY='%s'\n" "$ANT_VAL" >> "$T"
printf "OPENAI_API_KEY='%s'\n" "$OAI_VAL" >> "$T"

echo ""
echo "3. Node.js から見た中身"
node /Users/yujikubo/Desktop/Reviatro-HQ/projects/portfolio-demo/demo-04-slide-workspace/diagnose-env.js

echo ""
echo "DONE"
