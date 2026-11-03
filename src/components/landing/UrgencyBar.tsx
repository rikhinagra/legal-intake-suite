"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LANDING_URGENCY } from "@/lib/site-config";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeftThisMonth(): TimeLeft {
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  let total = Math.max(Math.floor((monthEnd.getTime() - now.getTime()) / 1000), 0);
  const days = Math.floor(total / 86400);
  total %= 86400;
  const hours = Math.floor(total / 3600);
  total %= 3600;
  const minutes = Math.floor(total / 60);
  return { days, hours, minutes, seconds: total % 60 };
}

const pad = (value: number) => String(value).padStart(2, "0");

export default function UrgencyBar() {
  const t = useTranslations("landing.urgency");
  // Rendered only after mount: the countdown depends on the visitor's clock,
  // so it can't match the server-rendered HTML.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeftThisMonth());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!LANDING_URGENCY.enabled) return null;

  const { monthlyCapacity, casesFilled } = LANDING_URGENCY;
  const spotsLeft = Math.max(monthlyCapacity - casesFilled, 0);
  const filledPercent = Math.min((casesFilled / monthlyCapacity) * 100, 100);

  const units: [number | undefined, string][] = [
    [timeLeft?.days, t("days")],
    [timeLeft?.hours, t("hours")],
    [timeLeft?.minutes, t("minutes")],
    [timeLeft?.seconds, t("seconds")],
  ];

  return (
    <div role="status" className="bg-[#08122f] text-[13px] text-[#C9CFE0]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-2.5 sm:justify-between">
        <p className="text-center sm:text-left">
          {spotsLeft === 0
            ? t("full")
            : t.rich("summary", {
                filled: casesFilled,
                left: spotsLeft,
                strong: (chunks) => <strong className="font-semibold text-green">{chunks}</strong>,
              })}
        </p>
        <div className="flex gap-1.5 tabular-nums" aria-label={t("timerLabel")}>
          {units.map(([value, label]) => (
            <span
              key={label}
              className="min-w-[46px] rounded-md bg-white/10 px-2 py-0.5 text-center font-semibold text-white"
            >
              {value === undefined ? "00" : pad(value)}
              <small className="ml-1 text-[10px] font-normal text-[#9FB0C6]">{label}</small>
            </span>
          ))}
        </div>
      </div>
      <div className="h-[3px] bg-white/10">
        <div
          className="h-full bg-green transition-[width] duration-1000"
          style={{ width: `${filledPercent}%` }}
        />
      </div>
    </div>
  );
}
