"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

// Plays through in order, then loops back to the start — a two-clip
// playlist rather than one video repeating.
const HERO_VIDEO_PLAYLIST = ["/hero-background.mp4", "/hero-background-2.mp4"];

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIndex, setVideoIndex] = useState(0);

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "es" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const playNext = () => setVideoIndex((i) => (i + 1) % HERO_VIDEO_PLAYLIST.length);
    video.addEventListener("ended", playNext);
    return () => video.removeEventListener("ended", playNext);
  }, []);

  useEffect(() => {
    // Changing `src` on a mounted <video> loads the new clip but leaves it
    // paused — autoPlay only fires on first mount, so each swap needs an
    // explicit play() call.
    videoRef.current?.play().catch(() => {});
  }, [videoIndex]);

  return (
    <div className="relative overflow-hidden bg-[#0b1740] px-6 pt-14 pb-22 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,#06d64b,transparent)] after:opacity-50">
      <video
        ref={videoRef}
        src={HERO_VIDEO_PLAYLIST[videoIndex]}
        autoPlay
        muted
        playsInline
        poster="/hero-background-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_500px_at_85%_-10%,rgba(6,214,75,0.14),transparent_60%),linear-gradient(180deg,rgba(11,23,64,0.32)_0%,rgba(20,35,92,0.38)_100%)]" />
      <motion.div
        className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center text-center [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
        }}
      >
        <motion.span
          variants={{
            hidden: { opacity: 0, y: -8 },
            show: { opacity: 1, y: 0 },
          }}
          className="mono order-1 mb-7 inline-flex items-center gap-2 rounded-full border border-green/40 bg-ink/25 px-3.5 py-1.5 text-[12px] tracking-[0.14em] text-green uppercase backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_0_3px_rgba(6,214,75,0.2)]" />
          {t("badge")}
        </motion.span>

        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
          }}
          className="order-2 flex flex-wrap justify-center gap-2.5 md:order-4 md:mt-9"
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-[13.5px] text-[#E4E9F5] backdrop-blur-sm"
          >
            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-green" />
            {t("trustResponse")}
          </motion.span>

          <motion.span
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-[13.5px] text-[#E4E9F5] backdrop-blur-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-green" />
            {t("trustNoFee")}
          </motion.span>

          <motion.button
            type="button"
            onClick={toggleLanguage}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-green/40 bg-green/10 px-4 py-2.5 text-[13.5px] font-medium text-green backdrop-blur-sm transition-colors hover:bg-green/20"
          >
            <Languages className="h-3.5 w-3.5 flex-shrink-0 text-green" />
            {locale === "en" ? t("switchToSpanish") : t("switchToEnglish")}
          </motion.button>
        </motion.div>

        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          className="order-3 mt-7 text-[clamp(32px,5.2vw,52px)] leading-[1.08] font-semibold text-[#FBF9F3] md:order-2 md:mt-0"
        >
          {t("headlinePlain")}
          <br />
          <em className="font-medium text-green italic">{t("headlineAccent")}</em>
        </motion.h1>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          className="order-4 mx-auto mt-5 max-w-[520px] text-[17px] text-[#C9CFE0] md:order-3"
        >
          {t("subtext")}
        </motion.p>
      </motion.div>
    </div>
  );
}
