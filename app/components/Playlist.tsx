"use client";

import { Play, Sparkles } from "lucide-react";
import type { PlaylistGroup } from "../data/anniversaryData";

type PlaylistProps = {
  groups: PlaylistGroup[];
};

export default function Playlist({ groups }: PlaylistProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div
          key={group.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7ac4ff]">
                Playlist
              </p>
              <h3 className="text-2xl font-semibold text-white">
                {group.label}
              </h3>
            </div>
            <div className="rounded-full bg-white/10 p-2 text-[#7ac4ff]">
              <Play size={18} />
            </div>
          </div>
          <div className="space-y-3">
            {group.songs.map((song) => (
              <a
                key={song.url}
                href={song.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-[#0070f3] hover:bg-white/10"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {song.title}
                  </p>
                  <p className="text-xs text-white/60">{song.artist}</p>
                </div>
                {song.isStart ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#7ac4ff]">
                    <Sparkles size={14} /> Inicio de todo
                  </span>
                ) : (
                  <span className="text-xs text-[#7ac4ff]">YouTube</span>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
