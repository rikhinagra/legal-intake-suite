"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

/**
 * The root layout is shared with the English only staff pages, so it always
 * renders lang="en". This keeps the page's language in step with the chosen
 * locale, so screen readers and browser translation treat the Spanish page as
 * Spanish. It puts the language back when the visitor leaves the page.
 */
export default function LangSync() {
  const locale = useLocale();

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = locale;
    return () => {
      html.lang = previous;
    };
  }, [locale]);

  return null;
}
