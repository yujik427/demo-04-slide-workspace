// .env.local を Node.js で直接読んで、各行のキー名・値の長さ・先頭12文字を表示する診断スクリプト
const fs = require("fs");
const path = "/Users/yujikubo/Desktop/Reviatro-HQ/projects/portfolio-demo/demo-04-slide-workspace/.env.local";
const content = fs.readFileSync(path, "utf-8");

console.log("=== ファイル全体の長さ:", content.length, "bytes ===");
console.log("=== 先頭10バイト（不可視文字含む、Unicode エスケープで表示）===");
console.log(JSON.stringify(content.slice(0, 10)));
console.log("");

const lines = content.split(/\r?\n/);
console.log("=== 各行 ===");
lines.forEach((line, i) => {
  if (line.trim() === "") {
    console.log("line", i, "(empty)");
    return;
  }
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) {
    console.log("line", i, "NO EQUALS:", JSON.stringify(line.slice(0, 50)));
    return;
  }
  const key = line.slice(0, eqIdx);
  const val = line.slice(eqIdx + 1);
  console.log(
    "line", i,
    "key=" + JSON.stringify(key),
    "val_len=" + val.length,
    "val_prefix=" + JSON.stringify(val.slice(0, 12)),
    "val_suffix=" + JSON.stringify(val.slice(-4))
  );
});
