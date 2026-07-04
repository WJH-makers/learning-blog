import mysql, { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import type { Post } from "@/lib/posts";

type NewDatabasePost = {
  title: string;
  summary: string;
  tags: string[];
  content: string;
  date: string;
};

type DatabasePostRow = RowDataPacket & {
  slug: string;
  title: string;
  summary: string;
  tags: string;
  content: string;
  published_at: Date | string;
};

let pool: mysql.Pool | undefined;
let schemaReady = false;

export function hasDatabaseConfig(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
      (process.env.MYSQL_HOST && process.env.MYSQL_DATABASE && process.env.MYSQL_USER),
  );
}

function getPool(): mysql.Pool {
  if (pool) return pool;

  if (process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.DATABASE_URL);
    return pool;
  }

  if (!hasDatabaseConfig()) {
    throw new Error("缺少数据库配置：请设置 DATABASE_URL，或 MYSQL_HOST/MYSQL_PORT/MYSQL_DATABASE/MYSQL_USER/MYSQL_PASSWORD。");
  }

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD ?? "",
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    charset: "utf8mb4",
    timezone: "Z",
  });
  return pool;
}

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS learning_posts (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      slug VARCHAR(220) NOT NULL,
      title VARCHAR(220) NOT NULL,
      summary VARCHAR(500) NOT NULL DEFAULT '',
      tags VARCHAR(500) NOT NULL DEFAULT '',
      content MEDIUMTEXT NOT NULL,
      published_at DATE NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_learning_posts_slug (slug),
      KEY idx_learning_posts_published_at (published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  schemaReady = true;
}

function parseDate(value: Date | string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function estimateReadingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const cjk = (content.match(/[\u4e00-\u9fff]/g) ?? []).length;
  return Math.max(1, Math.ceil((words + cjk / 2) / 220));
}

function rowToPost(row: DatabasePostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    date: parseDate(row.published_at),
    summary: row.summary,
    tags: parseTags(row.tags),
    readingMinutes: estimateReadingMinutes(row.content),
    content: row.content,
  };
}

export async function getDatabasePosts(): Promise<Post[]> {
  if (!hasDatabaseConfig()) return [];
  await ensureSchema();
  const [rows] = await getPool().query<DatabasePostRow[]>(
    `SELECT slug, title, summary, tags, content, published_at
     FROM learning_posts
     ORDER BY published_at DESC, id DESC`,
  );
  return rows.map(rowToPost);
}

export async function getDatabasePost(slug: string): Promise<Post | undefined> {
  if (!hasDatabaseConfig()) return undefined;
  await ensureSchema();
  const [rows] = await getPool().execute<DatabasePostRow[]>(
    `SELECT slug, title, summary, tags, content, published_at
     FROM learning_posts
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  );
  return rows[0] ? rowToPost(rows[0]) : undefined;
}

function slugify(input: string): string {
  return input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function uniqueSlug(base: string): Promise<string> {
  const safeBase = base || "daily-note";
  let slug = safeBase;
  for (let i = 2; i < 1000; i += 1) {
    const existing = await getDatabasePost(slug);
    if (!existing) return slug;
    slug = `${safeBase}-${i}`;
  }
  throw new Error("无法生成唯一 slug，请换一个标题。");
}

export async function createDatabasePost(input: NewDatabasePost): Promise<Post> {
  if (!hasDatabaseConfig()) {
    throw new Error("当前博客没有数据库配置，不能从网页写入。请先配置 MySQL 环境变量。");
  }

  const title = input.title.trim();
  const content = input.content.trim();
  const summary = input.summary.trim() || content.slice(0, 120);
  const date = input.date.trim() || new Date().toISOString().slice(0, 10);
  const tags = input.tags.map((tag) => tag.trim()).filter(Boolean);

  if (!title) throw new Error("标题不能为空。");
  if (!content) throw new Error("正文不能为空。");

  await ensureSchema();
  const slug = await uniqueSlug(`${date}-${slugify(title)}`);

  await getPool().execute<ResultSetHeader>(
    `INSERT INTO learning_posts (slug, title, summary, tags, content, published_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [slug, title, summary, tags.join(", "), content, date],
  );

  return {
    slug,
    title,
    summary,
    date,
    tags,
    content,
    readingMinutes: estimateReadingMinutes(content),
  };
}
