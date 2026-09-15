/**
 * Set NEXT_PUBLIC_SITE_URL once this project has its own Vercel deployment
 * URL or custom domain. Everything below (Open Graph tags, sitemap.xml,
 * robots.txt, canonical URLs) is generated from this one value, so once
 * a real domain is connected, update it here and nowhere else.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "Case Intake";

export const SITE_TITLE = "Free Confidential Case Review";

export const SITE_DESCRIPTION =
  "Tell us what happened in a few minutes and our team will review your case at no cost and with no obligation.";

export const BRAND_COLORS = {
  ink: "#0b1740",
  inkDeep: "#14235c",
  blue: "#0b4cf5",
  green: "#06d64b",
  paper: "#fbf9f3",
  mist: "#c9cfe0",
} as const;
