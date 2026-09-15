import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BRAND_COLORS, SITE_TITLE } from "@/lib/site-config";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const assetsDir = join(process.cwd(), "src/assets");
  const [interBold, plexMono] = await Promise.all([
    readFile(join(assetsDir, "Inter-SemiBold.ttf")),
    readFile(join(assetsDir, "PlexMono-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 96px",
          background: `linear-gradient(180deg, ${BRAND_COLORS.ink} 0%, ${BRAND_COLORS.inkDeep} 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: `1.5px solid rgba(6,214,75,0.45)`,
            borderRadius: 999,
            padding: "12px 26px",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: BRAND_COLORS.green,
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              fontFamily: "Plex Mono",
              fontSize: 22,
              letterSpacing: 4,
              color: BRAND_COLORS.green,
              textTransform: "uppercase",
            }}
          >
            Free Confidential Case Review
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 68,
            lineHeight: 1.18,
            color: BRAND_COLORS.paper,
            textAlign: "center",
          }}
        >
          Tell us what happened.
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 68,
            lineHeight: 1.18,
            color: BRAND_COLORS.green,
            textAlign: "center",
          }}
        >
          We&rsquo;ll take it from here.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 34,
            fontFamily: "Inter",
            fontSize: 27,
            color: BRAND_COLORS.mist,
            textAlign: "center",
            maxWidth: 840,
          }}
        >
          No cost, no obligation, and no pressure, just a clear next step.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interBold, style: "normal", weight: 600 },
        { name: "Plex Mono", data: plexMono, style: "normal", weight: 500 },
      ],
    }
  );
}
