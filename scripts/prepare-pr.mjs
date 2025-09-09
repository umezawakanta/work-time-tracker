#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";

const diff = execSync("git diff --staged --name-status || true", {
    encoding: "utf8",
});

const template = `## 概要
- 目的:
- 関連Issue: #

## 変更点
${diff
        .split("\n")
        .filter(Boolean)
        .map((l) => `- ${l}`)
        .join("\n")}

## 受け入れ条件
- [ ] ESLint/TS 0
- [ ] test:ci OK
- [ ] iPhone SE 表示 OK
- プレビュー: <自動URL>

## 動作確認
## リスク & ロールバック
`;

fs.writeFileSync(".github/PULL_REQUEST_AUTO.md", template);
console.log("Wrote .github/PULL_REQUEST_AUTO.md");
