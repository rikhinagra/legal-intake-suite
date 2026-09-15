import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // English is always the default for every visitor, regardless of their
  // browser/device language settings. Spanish is only ever shown when
  // someone explicitly chooses it (the toggle button) or visits /es directly.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
