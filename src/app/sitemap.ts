import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://chronostrap.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/custom-strap`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
