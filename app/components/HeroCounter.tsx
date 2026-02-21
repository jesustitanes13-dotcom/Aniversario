"use client";

import { useEffect, useMemo, useState } from "react";

type HeroCounterProps = {
  startDate: string;
};

type CounterValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const getDiff = (start: number): CounterValue => {
  const now = Date.now();
  const diff = Math.max(0, now - start);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
};

export default function HeroCounter({ startDate }: HeroCounterProps) {
  const start = useMemo(() => new Date(startDate).getTime(), [startDate]);
  const [isClientReady, setIsClientReady] = useState(false);
  const [value, setValue] = useState<CounterValue | null>(null);

  useEffect(() => {
    const kickoff = window.setTimeout(() => {
      setIsClientReady(true);
      setValue(getDiff(start));
    }, 0);

    const id = window.setInterval(() => {
      setValue(getDiff(start));
    }, 1000);

    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(id);
    };
  }, [start]);

  if (!isClientReady || !value) {
    return (
      <div className="grid w-full max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
        {["Dias", "Horas", "Min", "Seg"].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur"
          >
            <div className="h-8 animate-pulse rounded-md bg-white/10" />
            <div className="mt-3 text-xs uppercase tracking-[0.25em] text-[#0070f3]">
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { label: "Dias", value: value.days },
    { label: "Horas", value: value.hours },
    { label: "Min", value: value.minutes },
    { label: "Seg", value: value.seconds },
  ];

  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur"
        >
          <div className="text-2xl font-semibold text-white sm:text-3xl">
            {item.value.toString().padStart(2, "0")}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-[#0070f3]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
