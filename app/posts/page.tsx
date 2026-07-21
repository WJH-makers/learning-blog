import Link from "next/link";
import { getAllPublishedPosts } from "@/lib/posts";

export const metadata = {
  title: "全部文章",
  description: "学习记录文章列表。",
};

export const revalidate = 3600;
export const runtime = "nodejs";

const PAGE_SIZE = 6;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const posts = await getAllPublishedPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const rawPage = parseInt(searchParams.page ?? "1", 10);
  const page = Math.max(1, Math.min(totalPages, isNaN(rawPage) ? 1 : rawPage));
  const slice = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-shell narrow">
      <div className="page-title">
        <p className="eyebrow">Archive Desk</p>
        <h1>全部文章</h1>
        <p>按时间倒序整理每日学习成果。</p>
      </div>

      <div className="post-list">
        {slice.length > 0 ? slice.map((post) => (
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
        )) : (
          <div className="empty-state">
            <p className="eyebrow">No Articles</p>
            <h3>归档还没有文章。</h3>
            <Link className="button primary" href="/write">去写第一篇</Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="pagination">
          {page > 1 && <Link className="pagination-prev" href={`/posts?page=${page - 1}`}>← 上一页</Link>}
          <span className="pagination-info">{page} / {totalPages}</span>
          {page < totalPages && <Link className="pagination-next" href={`/posts?page=${page + 1}`}>下一页 →</Link>}
        </nav>
      )}
    </div>
  );
}
