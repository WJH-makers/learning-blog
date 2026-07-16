import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createDatabasePost, databaseProviderLabel, hasDatabaseConfig } from "@/lib/db";
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
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("blog_admin_token")?.value?.trim();
  const formToken = String(formData.get("token") ?? "").trim();
  const token = formToken || cookieToken || "";

  if (!expectedToken) {
    redirect("/write?error=missing-token-env" as Route);
  }

  if (token !== expectedToken) {
    redirect("/write?error=bad-token" as Route);
  }

  if (!cookieToken) {
    cookieStore.set("blog_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
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

async function checkAuth(): Promise<boolean> {
  const expected = process.env.BLOG_ADMIN_TOKEN?.trim();
  if (!expected) return false;
  const cookieStore = await cookies();
  return cookieStore.get("blog_admin_token")?.value?.trim() === expected;
}

export default async function WritePage({ searchParams }: Props) {
  const { error } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const dbReady = hasDatabaseConfig();
  const tokenReady = Boolean(process.env.BLOG_ADMIN_TOKEN?.trim());
  const publishingReady = dbReady && tokenReady;
  const message = errorMessage(error);
  const isAuthenticated = await checkAuth();

  return (
    <div className="page-shell editor-shell">
      <div className="page-title">
        <p className="eyebrow">Editorial Desk</p>
        <h1>知识卡片写作台</h1>
        <p>
          聚焦标题、证据和下一步。发布后会写入 MongoDB Atlas，并同步出现在首页、文章、标签和 RSS。
        </p>
      </div>

      <section className={publishingReady ? "db-status ok" : "db-status warn"}>
        <strong>{publishingReady ? `Publishing Desk Ready：${databaseProviderLabel()}` : "写作发布尚未就绪"}</strong>
        <span>
          {publishingReady
            ? "数据库和密钥均已配置，可以提交。"
            : `数据库：${dbReady ? "已配置" : "未配置 MONGODB_URI"}；密钥：${tokenReady ? "BLOG_ADMIN_TOKEN 已配置" : "缺少 BLOG_ADMIN_TOKEN"}。`}
        </span>
      </section>

      {message ? <p className="form-error">E42: {message}</p> : null}

      <WriteEditorClient initialDate={today} publishAction={publishPost} isAuthenticated={isAuthenticated} />
    </div>
  );
}
