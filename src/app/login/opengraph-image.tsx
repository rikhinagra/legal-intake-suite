import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BRAND_COLORS, SITE_NAME } from "@/lib/site-config";

export const alt = "Staff Sign In — Case Intake";
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
          background: `linear-gradient(180deg, ${BRAND_COLORS.ink} 0%, ${BRAND_COLORS.inkDeep} 100%)`,
        }}
      >
        {/* Same shield-checkmark mark used in the app's own staff nav (src/components/staff/Logo.tsx) */}
        <svg width="88" height="88" viewBox="0 0 32 32" style={{ marginBottom: 28 }}>
          <rect width="32" height="32" rx="8" fill={BRAND_COLORS.blue} />
          <path
            d="M16 6.5L23 9V15C23 20 20 23.5 16 25.5C12 23.5 9 20 9 15V9L16 6.5Z"
            fill="none"
            stroke={BRAND_COLORS.paper}
            strokeWidth="1.6"
          />
          <path
            d="M12.5 15.3L15 17.8L19.8 12.8"
            fill="none"
            stroke={BRAND_COLORS.green}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>

        <div
          style={{
            display: "flex",
            fontFamily: "Plex Mono",
            fontSize: 22,
            letterSpacing: 4,
            color: BRAND_COLORS.mist,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Inter",
            fontSize: 72,
            lineHeight: 1.15,
            color: BRAND_COLORS.paper,
            textAlign: "center",
          }}
        >
          Staff Sign In
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontFamily: "Inter",
            fontSize: 27,
            color: BRAND_COLORS.mist,
            textAlign: "center",
            maxWidth: 760,
          }}
        >
          Agent and attorney access to the case intake system.
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
