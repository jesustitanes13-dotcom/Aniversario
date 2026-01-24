import { Heart } from "lucide-react";

type LoveLetterProps = {
  paragraphs: string[];
};

export default function LoveLetter({ paragraphs }: LoveLetterProps) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_0_40px_rgba(0,112,243,0.25)] backdrop-blur">
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-white/10 p-3 text-[#7ac4ff]">
          <Heart size={18} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#7ac4ff]">
            Carta de amor
          </p>
          <h3 className="text-2xl font-semibold text-white">
            Carta de agradecimiento
          </h3>
        </div>
      </div>
      <div className="space-y-4 text-sm leading-7 text-white/70">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
