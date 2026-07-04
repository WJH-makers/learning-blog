import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export const metadata = {
  title: "标签",
  description: "按主题浏览学习记录。",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="page-shell narrow">
      <div className="page-title">
        <p className="eyebrow">Topics</p>
        <h1>标签</h1>
        <p>用主题把每天的学习记录串起来。</p>
      </div>
      <div className="tag-cloud">
        {tags.map(({ tag, count }) => (
          <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>{tag}<span>{count}</span></Link>
        ))}
      </div>
    </div>
  );
}
