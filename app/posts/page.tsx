import Link from "next/link";
import { getAllPublishedPosts } from "@/lib/posts";

export const metadata = {
  title: "全部文章",
  description: "万佳泓的每日学习记录文章列表。",
};

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const posts = await getAllPublishedPosts();

  return (
    <div className="page-shell narrow">
      <div className="page-title">
        <p className="eyebrow">:oldfiles</p>
        <h1>全部文章</h1>
        <p>按时间倒序记录每天的学习成果。</p>
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <article className="list-item" key={post.slug}>
            <time>{post.date}</time>
            <div>
              <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
              <p>{post.summary}</p>
              <div className="tags">
                {post.tags.map((tag) => <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>{tag}</Link>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
