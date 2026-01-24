"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export type GalleryImage = {
  src: string;
  alt: string;
};

export type GallerySection = {
  id: string;
  title: string;
  description: string;
  variant?: "default" | "collage" | "warm";
  images: GalleryImage[];
};

const COLLAGE_SPANS = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

type PhotoGalleryProps = {
  sections: GallerySection[];
  intro?: string;
};

const getVariantClasses = (variant?: GallerySection["variant"]) => {
  if (variant === "warm") {
    return "rounded-3xl border border-[#7ac4ff]/40 bg-white/5 p-6 shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur";
  }

  return "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur";
};

const getTitleClasses = (variant?: GallerySection["variant"]) => {
  if (variant === "warm") {
    return "text-white";
  }

  return "text-white";
};

const getDescriptionClasses = (variant?: GallerySection["variant"]) => {
  if (variant === "warm") {
    return "text-white/70";
  }

  return "text-white/70";
};

export default function PhotoGallery({ sections, intro }: PhotoGalleryProps) {
  const [activeFilter, setActiveFilter] = useState("todas");

  const filters = useMemo(
    () => [
      { id: "todas", label: "Todas" },
      ...sections.map((section) => ({
        id: section.id,
        label: section.title,
      })),
    ],
    [sections],
  );

  const visibleSections = useMemo(() => {
    if (activeFilter === "todas") {
      return sections;
    }

    return sections.filter((section) => section.id === activeFilter);
  }, [activeFilter, sections]);

  return (
    <section className="flex flex-col gap-8">
      {intro ? (
        <p className="max-w-3xl text-sm leading-7 text-white/70">{intro}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = filter.id === activeFilter;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-[#0070f3] bg-[#0070f3] text-white shadow-sm"
                  : "border-white/15 bg-white/5 text-white/70 hover:border-[#0070f3] hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-12">
        {visibleSections.map((section) => (
          <article
            key={section.id}
            className={`flex flex-col gap-5 ${getVariantClasses(section.variant)}`}
          >
            <div className="flex flex-col gap-2">
              <h2
                className={`text-2xl font-semibold ${getTitleClasses(
                  section.variant,
                )}`}
              >
                {section.title}
              </h2>
              <p
                className={`max-w-2xl text-sm leading-6 ${getDescriptionClasses(
                  section.variant,
                )}`}
              >
                {section.description}
              </p>
            </div>

            {section.images.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
                Agrega tus fotos en{" "}
                <span className="font-semibold">
                  public/fotos/{section.id}
                </span>{" "}
                y aparecerán aquí automáticamente.
              </div>
            ) : section.variant === "collage" ? (
              <div className="grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[160px] sm:grid-cols-4">
                {section.images.map((image, index) => (
                  <div
                    key={image.src}
                    className={`relative overflow-hidden rounded-2xl shadow-sm ${
                      COLLAGE_SPANS[index % COLLAGE_SPANS.length]
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition duration-300 ease-out hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {section.images.map((image) => (
                  <div
                    key={image.src}
                    className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-300 ease-out hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
