import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://wjh-makers-learning-blog.vercel.app"),
  title: {
    default: "万佳泓的学习日志",
    template: "%s | 万佳泓的学习日志",
  },
  description: "记录 Java 全栈、Git、AI、系统、算法与每天学习成果的个人博客。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <nav className="nav">
            <Link className="brand" href="/">WJH Learning</Link>
            <div className="nav-links">
              <Link href="/posts">文章</Link>
              <Link href="/tags">标签</Link>
              <a href="https://github.com/WJH-makers" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <span>© {new Date().getFullYear()} WJH-makers</span>
          <span>Built with Next.js · Deployed on Vercel</span>
        </footer>
      </body>
    </html>
  );
}
