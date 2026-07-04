# 万佳泓的学习日志

这是一个部署到 Vercel 的个人学习博客，用来记录每天学习 Java 全栈、Git、MySQL、AI、系统与工程配置的成果。

## 技术栈

- Next.js App Router
- TypeScript
- 本地 Markdown 内容：`content/posts/*.md`
- 无数据库、无 CMS、无额外 Markdown 依赖

## 常用命令

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## 新增文章

在 `content/posts` 下新建 Markdown 文件：

```md
---
title: 文章标题
date: 2026-07-04
summary: 一句话摘要
tags: Java, Git, MySQL
---

## 今天学了什么

正文内容...
```

## Vercel 部署

推荐流程：

1. 把仓库推送到 GitHub：`WJH-makers/learning-blog`
2. Vercel 导入该 GitHub 仓库
3. Framework 选择 Next.js
4. Build Command 使用 `npm run build`
5. 如需固定站点地址，在 Vercel 环境变量设置：

```text
NEXT_PUBLIC_SITE_URL=https://你的域名
```

## 目录

- `/` 首页
- `/posts` 全部文章
- `/posts/[slug]` 文章详情
- `/tags` 标签
- `/rss.xml` RSS
- `/sitemap.xml` Sitemap
