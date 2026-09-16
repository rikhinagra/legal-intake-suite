import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

const TITLE = "Staff Sign In";
const DESCRIPTION = "Agent and attorney access to the case intake system.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Internal staff tool — no reason for this to show up in search results.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    url: "/login",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/login/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/login/opengraph-image"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
