# 万佳泓的学习日志

这是一个部署到 Vercel 的个人学习博客，用来记录每天学习 Java 全栈、Git、MySQL、AI、系统与工程配置的成果。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/WJH-makers/learning-blog&project-name=wjh-makers-learning-blog&repository-name=learning-blog)

## 技术栈

- Next.js App Router
- TypeScript
- 本地 Markdown 内容：`content/posts/*.md`
- 可选 MySQL 直连写入：`/write`
- 无 ORM / 无 CMS：只使用 `mysql2` 驱动直连

## 常用命令

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run post:new -- "今天学到的主题" --tags="Java, MySQL, 复盘"
```

## 为什么之前不能在网页里直接写心得？

之前这个博客是纯静态 Markdown 架构：

- 文章只从 `content/posts/*.md` 读取。
- 没有数据库驱动。
- 没有 API / Server Action 写入入口。
- Vercel 的文件系统不能当作持久写入空间，网页表单不能直接把 Markdown 永久写回仓库。

现在新增了可选 MySQL 写入链路：如果配置了数据库环境变量，就可以打开 `/write`，把每天心得直接写入 `learning_posts` 表。

## MySQL 配置

复制环境变量模板：

```bash
copy .env.example .env.local
```

创建本地数据库和账号（先把 `change_me` 改成你自己的强密码）：

```bash
mysql -u root -p < scripts/schema.sql
```

`.env.local` 至少需要：

```text
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=learning_blog
MYSQL_USER=learning_blog_user
MYSQL_PASSWORD=你的密码
BLOG_ADMIN_TOKEN=一个很长的写入密钥
```

也可以只用一条：

```text
DATABASE_URL=mysql://learning_blog_user:你的密码@127.0.0.1:3306/learning_blog
BLOG_ADMIN_TOKEN=一个很长的写入密钥
```

启动后访问：

```text
http://localhost:3000/write
```

线上 Vercel 也要在 Project Settings → Environment Variables 中设置同样的变量；不要把真实 `.env.local` 提交到 Git。

## 新增文章

方式一：用脚本生成每日学习记录：

```bash
npm run post:new -- "Git bisect 实战复盘" --tags="Git, 调试, 复盘"
```

方式二：在 `content/posts` 下手动新建 Markdown 文件：

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

推荐流程一：网页一键导入

1. 点击上面的 **Deploy with Vercel**。
2. 用你的 Vercel 账号登录。
3. 选择 GitHub 仓库 `WJH-makers/learning-blog`。
4. Project Name 建议使用 `wjh-makers-learning-blog`，避免和别人已有的 `learning-blog.vercel.app` 冲突。
5. Framework Preset 保持 `Next.js`。
6. Build Command 使用 `npm run build`。
7. 点击 Deploy。

推荐流程二：Vercel CLI

```bash
npx vercel@latest login
npx vercel@latest --prod
```

如需固定站点地址，在 Vercel 环境变量设置：

```text
NEXT_PUBLIC_SITE_URL=https://你的域名
```

如果使用默认项目名，推荐设置为：

```text
NEXT_PUBLIC_SITE_URL=https://wjh-makers-learning-blog.vercel.app
```

## 目录

- `/` 首页
- `/posts` 全部文章
- `/posts/[slug]` 文章详情
- `/tags` 标签
- `/write` 网页写入心得（需要 MySQL + BLOG_ADMIN_TOKEN）
- `/rss.xml` RSS
- `/sitemap.xml` Sitemap
