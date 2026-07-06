import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkDatabaseConnection, createDatabasePost, databaseProviderLabel, hasDatabaseConfig } from "@/lib/db";
import WriteEditorClient from "./WriteEditorClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function safeErrorForUrl(error: unknown): string {
  const raw = error instanceof Error ? error.message : "unknown-error";
  return raw
    .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb$1://<redacted>@")
    .replace(/(password=)[^&\s]+/gi, "$1<redacted>")
    .slice(0, 180);
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
    redirect(`/write?error=${encodeURIComponent(safeErrorForUrl(error))}` as Route);
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
  const dbStatus = dbReady ? await checkDatabaseConnection() : { ok: false, message: "Missing MONGODB_URI or DATABASE_URL" };
  const tokenReady = Boolean(process.env.BLOG_ADMIN_TOKEN?.trim());
  const publishingReady = dbStatus.ok && tokenReady;
  const message = errorMessage(error);

  return (
    <div className="page-shell editor-shell">
      <div className="page-title">
        <p className="eyebrow">Editorial Desk</p>
        <h1>写今日头条</h1>
        <p>
          这里是部署在 Vercel 上的每日经验写作台。提交后文章会直连写入 MongoDB Atlas 的 <code>learning_posts</code> collection，并立即出现在首页、文章列表、标签页和 RSS 中。
        </p>
      </div>

      <section className={publishingReady ? "db-status ok" : "db-status warn"}>
        <strong>{publishingReady ? `Publishing Desk Ready：${databaseProviderLabel()}` : "写作发布尚未就绪"}</strong>
        <span>
          {publishingReady
            ? `可以提交。连接检查：${dbStatus.message}`
            : `当前还不能发布。数据库：${dbStatus.message}；写入密钥：${tokenReady ? "BLOG_ADMIN_TOKEN 已配置" : "缺少 BLOG_ADMIN_TOKEN"}。请检查 MONGODB_URI（或 DATABASE_URL）、Atlas 用户、Network Access 白名单和 Vercel 环境变量。`}
        </span>
      </section>

      {message ? <p className="form-error">E42: {message}</p> : null}

      <WriteEditorClient initialDate={today} publishAction={publishPost} />
    </div>
  );
}
