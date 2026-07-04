import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type Props = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `标签：${decoded}`,
    description: `浏览 ${decoded} 相关学习记录。`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  return (
    <div className="page-shell narrow">
      <Link className="back-link" href="/tags">← 返回标签</Link>
      <div className="page-title">
        <p className="eyebrow">Tag</p>
        <h1>{decoded}</h1>
        <p>{posts.length} 篇相关学习记录。</p>
      </div>
      <div className="post-list">
        {posts.map((post) => (
          <article className="list-item" key={post.slug}>
            <time>{post.date}</time>
            <div>
              <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
              <p>{post.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
