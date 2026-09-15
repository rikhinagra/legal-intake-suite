import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    en: SITE_URL,
    es: `${SITE_URL}/es`,
  };

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/es`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
  ];
}
