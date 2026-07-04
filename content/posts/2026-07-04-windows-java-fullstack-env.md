---
title: Windows Java 全栈环境整理复盘
date: 2026-07-04
summary: 记录今天对 Windows 开发环境、Git、Node、Java、MySQL 和终端配置的系统化整理。
tags: Windows, Java, Git, MySQL, 环境配置
---

## 今天完成了什么

- 统一了 GitHub 连接方式：优先使用 SSH，避免在 remote URL 中出现 token。
- 梳理了 Node/NVM/opencode 的命令来源，目标是所有命令都走一个明确入口。
- Java 选择 GraalVM JDK 25.0.3，Maven 和 Gradle 走独立官方目录。
- MySQL 与 mycli 使用 login-path/DSN，避免明文密码。
- 给 `tldr git`、`tldr mysql`、`tldr java`、`tldr gh` 增加了高频命令速查。

## 学到的关键点

> 开发环境不是装得越多越好，而是每个命令都应该知道从哪里来、为什么存在、如何恢复。

Git 的核心工作流可以压缩为：

```text
git status -> git diff -> git add -p -> git commit -> git push
```

遇到问题时优先看：

- `git status --short --branch`
- `git config --show-origin --show-scope --list`
- `where node` / `where java` / `where opencode`
- `tldr git undo`

## 明天继续

- 把个人博客部署到 Vercel。
- 把每天学习内容按标签沉淀下来。
- 继续把 Java / MySQL / Git 的实战命令整理成可复用模板。
