import Link from "next/link";
import { getAllPosts, getAllTags } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const latest = posts.slice(0, 4);

  return (
    <div className="page-shell">
      <section className="hero">
        <p className="eyebrow">Daily Learning Journal</p>
        <h1>把每天学到的东西沉淀成可复用的工程资产。</h1>
        <p className="hero-text">
          这里记录 Java 全栈、Git、数据库、AI、系统与工程化配置。每篇文章都尽量包含目标、过程、命令、坑点和复盘。
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/posts">开始阅读</Link>
          <Link className="button" href="/tags">按标签查找</Link>
        </div>
      </section>

      <section className="stats-grid" aria-label="博客统计">
        <div><strong>{posts.length}</strong><span>篇学习记录</span></div>
        <div><strong>{tags.length}</strong><span>个知识标签</span></div>
        <div><strong>∞</strong><span>持续迭代</span></div>
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Latest</p>
          <h2>最新学习成果</h2>
        </div>
        <Link href="/posts">查看全部 →</Link>
      </section>

      <div className="post-grid">
        {latest.map((post) => (
          <article className="card" key={post.slug}>
            <p className="date">{post.date} · {post.readingMinutes} min</p>
            <h3><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
            <p>{post.summary}</p>
            <div className="tags">
              {post.tags.map((tag) => <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>{tag}</Link>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
