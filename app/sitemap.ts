import type { MetadataRoute } from "next";
import { getAllPosts, siteUrl } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/posts`, lastModified: new Date() },
    { url: `${base}/tags`, lastModified: new Date() },
    ...getAllPosts().map((post) => ({
      url: `${base}/posts/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}
