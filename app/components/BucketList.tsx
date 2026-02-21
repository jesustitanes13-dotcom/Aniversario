"use client";

import { CheckCircle2, Circle, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BucketItem } from "../data/anniversaryData";

type BucketListProps = {
  initialItems: BucketItem[];
};

const STORAGE_KEY = "aniversario-bucket-list";

export default function BucketList({ initialItems }: BucketListProps) {
  const [items, setItems] = useState<BucketItem[]>(() => {
    if (typeof window === "undefined") return initialItems;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialItems;
    try {
      const parsed = JSON.parse(saved) as BucketItem[];
      return Array.isArray(parsed) ? parsed : initialItems;
    } catch {
      return initialItems;
    }
  });
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const completedCount = useMemo(
    () => items.filter((item) => item.done).length,
    [items],
  );

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  };

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    const id = `${trimmed.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    setItems((prev) => [...prev, { id, label: trimmed, done: false }]);
    setNewItem("");
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7ac4ff]">
            Bucket List
          </p>
          <h3 className="text-2xl font-semibold text-white">
            Metas juntas
          </h3>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#7ac4ff]">
          {completedCount}/{items.length} hechas
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleItem(item.id)}
            className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
              item.done
                ? "border-[#0070f3]/50 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/70 hover:border-[#0070f3]"
            }`}
          >
            {item.done ? (
              <CheckCircle2 size={18} className="mt-0.5 text-[#7ac4ff]" />
            ) : (
              <Circle size={18} className="mt-0.5 text-white/30" />
            )}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <input
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          placeholder="Agregar nueva meta"
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none transition focus:border-[#0070f3]"
        />
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0070f3] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0059c1]"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>
    </div>
  );
}
