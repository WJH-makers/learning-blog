---
title: "全栈命令 · 指令速查大全（导航页）"
date: 2026-07-15
summary: "按主题拆分为独立文章，快速定位所需命令。"
tags: ["命令速查", "Linux", "Git", "Docker", "MySQL", "Redis", "Java", "Markdown", "HTML"]
---

# 全栈指令速查 · 导航

> 原 156KB 超长文章已按主题拆分为以下独立文章，加载更快、检索更方便：

| 文章 | 内容 |
|------|------|
| [Linux & Windows](/posts/2026-07-21-linux-windows-cheatsheet) | Shell 高频命令、文件操作、进程管理、WSL |
| [Git + Docker + SSH](/posts/2026-07-21-git-docker-cheatsheet) | 版本控制、容器部署、远程免密登录 |
| [MySQL & Redis](/posts/2026-07-21-mysql-redis-cheatsheet) | SQL 增删改查、索引优化、缓存五大数据类型 |
| [Java JVM + 排障 + Spring/Maven](/posts/2026-07-21-java-jvm-cheatsheet) | JVM 调优、CPU/OOM 排查、Spring Boot、Maven |
| [Markdown + HTML](/posts/2026-07-21-markdown-html-cheatsheet) | 写作语法全解、HTML5 标签速查 |

---

## 投前必会 S 包

**部署 / Linux**
- [ ] `ls cd pwd mkdir rm cp mv cat grep tail chmod ps kill ss curl`
- [ ] `tar` `nohup java -jar ... &` `tail -f app.log`
- [ ] `docker ps/run/logs/exec` `docker compose up -d`

**Git / 构建**
- [ ] `git status add commit push pull clone branch`
- [ ] `mvn clean package` `java -jar`

**数据**
- [ ] MySQL：`SELECT/INSERT/UPDATE/DELETE` `EXPLAIN`
- [ ] Redis：`GET/SET/DEL/EXPIRE` 缓存三连

**Java 排障**
- [ ] `jps -l` `jstack` `jmap`

**Spring / MyBatis**
- [ ] `@RestController` `@Autowired` `@Transactional`
- [ ] `#{}` vs `${}` 事务失效 3 条

**分布式口述**
- [ ] 缓存穿透/击穿/雪崩 分布式锁 接口幂等