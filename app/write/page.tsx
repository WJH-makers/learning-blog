import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createDatabasePost, databaseProviderLabel, hasDatabaseConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "写今日心得",
  description: "从网页直接写入每日学习心得到 MongoDB Atlas 云数据库。",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

function parseTags(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function publishPost(formData: FormData) {
  "use server";

  const expectedToken = process.env.BLOG_ADMIN_TOKEN?.trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!expectedToken) {
    redirect("/write?error=missing-token-env" as Route);
  }

  if (token !== expectedToken) {
    redirect("/write?error=bad-token" as Route);
  }

  let slug: string;
  try {
    const post = await createDatabasePost({
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      tags: parseTags(formData.get("tags")),
      content: String(formData.get("content") ?? ""),
      date: String(formData.get("date") ?? ""),
    });
    slug = post.slug;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown-error";
    redirect(`/write?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/tags");
  revalidatePath("/rss.xml");
  revalidatePath("/sitemap.xml");
  redirect(`/posts/${slug}` as Route);
}

function errorMessage(code?: string): string | undefined {
  if (!code) return undefined;
  if (code === "missing-token-env") return "缺少 BLOG_ADMIN_TOKEN：为了安全，网页写入必须先配置写入密钥。";
  if (code === "bad-token") return "写入密钥不正确。";
  return decodeURIComponent(code);
}

export default async function WritePage({ searchParams }: Props) {
  const { error } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const dbReady = hasDatabaseConfig();
  const message = errorMessage(error);

  return (
    <div className="page-shell editor-shell">
      <div className="page-title">
        <p className="eyebrow">:write</p>
        <h1>写今日心得</h1>
        <p>
          这里是 MongoDB Atlas 云数据库写入入口。提交后文章会进入 <code>learning_posts</code> collection，并立即出现在首页、文章列表、标签页和 RSS 中。
        </p>
      </div>

      <section className={dbReady ? "db-status ok" : "db-status warn"}>
        <strong>{dbReady ? `数据库配置已发现：${databaseProviderLabel()}` : "MongoDB Atlas 尚未配置"}</strong>
        <span>
          {dbReady
            ? "可以提交。若连接失败，请检查 Atlas 用户名/密码、Network Access 白名单、数据库名和 Vercel 环境变量。"
            : "当前只能显示静态 Markdown。请配置 MONGODB_URI；线上推荐使用 MongoDB Atlas M0 免费集群。"}
        </span>
      </section>

      {message ? <p className="form-error">E42: {message}</p> : null}

      <form className="vim-form" action={publishPost}>
        <label>
          <span>写入密钥 BLOG_ADMIN_TOKEN</span>
          <input name="token" type="password" autoComplete="current-password" required />
        </label>

        <div className="form-grid">
          <label>
            <span>日期</span>
            <input name="date" type="date" defaultValue={today} required />
          </label>
          <label>
            <span>标签（英文逗号分隔）</span>
            <input name="tags" defaultValue="Java, Git, MySQL, 复盘" />
          </label>
        </div>

        <label>
          <span>标题</span>
          <input name="title" placeholder="例如：MySQL 连接池与 Server Action 复盘" required />
        </label>

        <label>
          <span>摘要</span>
          <input name="summary" placeholder="一句话说明今天沉淀了什么" />
        </label>

        <label>
          <span>正文 Markdown</span>
          <textarea
            name="content"
            rows={18}
            required
            defaultValue={`## 今天学了什么\n\n- \n\n## 关键命令\n\n\`\`\`bash\n\n\`\`\`\n\n## 遇到的问题\n\n> \n\n## 验证证据\n\n- \n\n## 明天继续\n\n- `}
          />
        </label>

        <div className="hero-actions">
          <button className="button primary" type="submit">:wq 保存并发布</button>
          <a className="button" href="/posts">:q 返回文章</a>
        </div>
      </form>
    </div>
  );
}
