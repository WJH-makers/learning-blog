#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function argValue(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length).trim() : fallback;
}

function positionalTitle() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  return args.join(" ").trim();
}

function slugify(value) {
  const ascii = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "daily-learning";
}

function uniqueFilePath(date, slug) {
  let index = 1;
  while (true) {
    const suffix = index === 1 ? "" : `-${index}`;
    const filePath = path.join(postsDir, `${date}-${slug}${suffix}.md`);
    if (!fs.existsSync(filePath)) return filePath;
    index += 1;
  }
}

const title = positionalTitle() || argValue("title", "今日学习复盘");
const date = argValue("date", today());
const summary = argValue("summary", "记录今天的学习目标、过程、命令、结果和复盘。");
const tags = argValue("tags", "学习方法, 复盘");
const slug = slugify(argValue("slug", title));
const filePath = uniqueFilePath(date, slug);

fs.mkdirSync(postsDir, { recursive: true });

const content = `---
title: ${title}
date: ${date}
summary: ${summary}
tags: ${tags}
---

## 今日目标

- 

## 学习过程

- 

## 关键命令 / 代码

\`\`\`bash
# 写下今天真正用过的命令
\`\`\`

## 遇到的问题

- 

## 解决方案

- 

## 今日收获

- 

## 明日计划

- 
`;

fs.writeFileSync(filePath, content, "utf8");
console.log(path.relative(root, filePath).replaceAll("\\", "/"));
