"use client";

const PARTICLES = Array.from({ length: 16 }, (_, index) => index);

export default function BackgroundParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((index) => {
        const size = 6 + (index % 5) * 6;
        const left = `${(index * 7) % 100}%`;
        const top = `${(index * 13) % 100}%`;
        const delay = `${index * 0.6}s`;
        const duration = `${10 + (index % 6) * 4}s`;

        return (
          <span
            key={index}
            className="absolute rounded-full bg-[#0070f3]/30 blur-[1px]"
            style={{
              width: size,
              height: size,
              left,
              top,
              animation: `floaty ${duration} ease-in-out ${delay} infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
