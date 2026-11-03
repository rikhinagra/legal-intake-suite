"use client";

import { useEffect, useRef, useState } from "react";

// Plays through in order, then loops back to the start: a two-clip
// playlist rather than one video repeating.
const HERO_VIDEO_PLAYLIST = ["/hero-background.mp4", "/hero-background-2.mp4"];

export default function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const playNext = () => setVideoIndex((i) => (i + 1) % HERO_VIDEO_PLAYLIST.length);
    video.addEventListener("ended", playNext);
    return () => video.removeEventListener("ended", playNext);
  }, []);

  useEffect(() => {
    // Changing `src` on a mounted <video> loads the new clip but leaves it
    // paused, since autoPlay only fires on first mount, so each swap needs
    // an explicit play() call.
    videoRef.current?.play().catch(() => {});
  }, [videoIndex]);

  return (
    <>
      <video
        ref={videoRef}
        src={HERO_VIDEO_PLAYLIST[videoIndex]}
        autoPlay
        muted
        playsInline
        poster="/hero-background-poster.jpg"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_900px_500px_at_85%_-10%,rgba(6,214,75,0.14),transparent_60%),linear-gradient(180deg,rgba(11,23,64,0.5)_0%,rgba(20,35,92,0.6)_100%)]" />
    </>
  );
}
