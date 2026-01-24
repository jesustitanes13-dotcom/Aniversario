"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import type { MouseEvent } from "react";
import type { PlayerStats } from "../data/anniversaryData";

type StatsVersusProps = {
  players: PlayerStats[];
};

type TiltCardProps = {
  player: PlayerStats;
};

const TiltCard = ({ player }: TiltCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(offsetX);
    y.set(offsetY);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(0,112,243,0.25)] backdrop-blur"
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#0070f3]">
          Player Stats
        </p>
        <h3 className="text-2xl font-semibold text-white">
          {player.name}
        </h3>
        <p className="text-sm text-white/70">{player.subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {player.stats.map((stat, index) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#6aa8ff]">
              {stat.label}
            </p>
            <p className="text-base font-semibold text-white">
              {stat.value}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0070f3] to-[#7ac4ff]"
                style={{ width: `${70 + (index % 5) * 6}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function StatsVersus({ players }: StatsVersusProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {players.map((player) => (
        <TiltCard key={player.name} player={player} />
      ))}
    </div>
  );
}
