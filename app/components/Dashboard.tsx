"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  CheckSquare,
  Heart,
  ImageIcon,
  Mail,
  MapPin,
  Music2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ElementType } from "react";
import type {
  BucketItem,
  PlaceCard,
  PlayerStats,
  PlaylistGroup,
  StoryMoment,
} from "../data/anniversaryData";
import type { GallerySection } from "./PhotoGallery";
import BackgroundParticles from "./BackgroundParticles";
import BucketList from "./BucketList";
import HeroCounter from "./HeroCounter";
import LoveLetter from "./LoveLetter";
import PhotoGallery from "./PhotoGallery";
import PlacesGrid from "./PlacesGrid";
import Playlist from "./Playlist";
import StatsVersus from "./StatsVersus";

type DashboardProps = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    startDate: string;
    backgroundImage: string;
  };
  storyParagraphs: string[];
  storyMoments: StoryMoment[];
  players: PlayerStats[];
  places: PlaceCard[];
  galleryIntro: string;
  gallerySections: GallerySection[];
  playlistGroups: PlaylistGroup[];
  bucketList: BucketItem[];
  loveLetter: string[];
};

type SectionId =
  | "historia"
  | "stats"
  | "recuerdos"
  | "playlist"
  | "metas"
  | "carta";

const SECTIONS: {
  id: SectionId;
  label: string;
  description: string;
  icon: ElementType;
  size?: string;
}[] = [
  {
    id: "historia",
    label: "Nuestra Historia",
    description: "El inicio, los detalles y los momentos que nos marcaron.",
    icon: Heart,
    size: "sm:col-span-2",
  },
  {
    id: "stats",
    label: "Stats Center",
    description: "Niveles legendarios con energia azul.",
    icon: Activity,
  },
  {
    id: "recuerdos",
    label: "Recuerdos Pro",
    description: "Mapa de lugares + galeria interactiva.",
    icon: ImageIcon,
    size: "sm:row-span-2",
  },
  {
    id: "playlist",
    label: "Playlist",
    description: "Canciones que nos recuerdan a todo.",
    icon: Music2,
  },
  {
    id: "metas",
    label: "Metas",
    description: "Checklist de metas juntos.",
    icon: CheckSquare,
  },
  {
    id: "carta",
    label: "Carta",
    description: "Cierre final con amor y gratitud.",
    icon: Mail,
    size: "sm:col-span-2",
  },
];

export default function Dashboard({
  hero,
  storyParagraphs,
  storyMoments,
  players,
  places,
  galleryIntro,
  gallerySections,
  playlistGroups,
  bucketList,
  loveLetter,
}: DashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const activeMeta = SECTIONS.find((section) => section.id === activeSection);

  const activeContent = useMemo(() => {
    switch (activeSection) {
      case "historia":
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70 shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {storyMoments.map((moment) => (
                <div
                  key={moment.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-[#7ac4ff]">
                    Momento
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {moment.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">
                    {moment.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case "stats":
        return <StatsVersus players={players} />;
      case "recuerdos":
        return (
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[#7ac4ff]">
                <MapPin size={18} />
                <p className="text-xs uppercase tracking-[0.3em]">
                  Mapa de recuerdos
                </p>
              </div>
              <PlacesGrid places={places} />
            </div>
            <div>
              <div className="mb-4 flex items-center gap-2 text-[#7ac4ff]">
                <ImageIcon size={18} />
                <p className="text-xs uppercase tracking-[0.3em]">
                  Galeria interactiva
                </p>
              </div>
              <PhotoGallery sections={gallerySections} intro={galleryIntro} />
            </div>
          </div>
        );
      case "playlist":
        return <Playlist groups={playlistGroups} />;
      case "metas":
        return <BucketList initialItems={bucketList} />;
      case "carta":
        return <LoveLetter paragraphs={loveLetter} />;
      default:
        return null;
    }
  }, [
    activeSection,
    bucketList,
    galleryIntro,
    gallerySections,
    loveLetter,
    places,
    players,
    playlistGroups,
    storyMoments,
    storyParagraphs,
  ]);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <BackgroundParticles />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8">
        <section
          className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-[0_0_40px_rgba(0,112,243,0.3)] backdrop-blur"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${hero.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#7ac4ff]">
                {hero.eyebrow}
              </p>
              <h1 className="font-display text-4xl font-semibold sm:text-5xl">
                {hero.title}
              </h1>
              <p className="max-w-xl text-sm leading-7 text-white/70">
                {hero.subtitle}
              </p>
            </div>
            <HeroCounter startDate={hero.startDate} />
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7ac4ff]">
                Hub principal
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Selecciona una seccion
              </h2>
            </div>
            {activeSection ? (
              <button
                type="button"
                onClick={() => setActiveSection(null)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-[#0070f3]"
              >
                <ArrowLeft size={14} /> Volver al hub
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_0_30px_rgba(0,112,243,0.15)] transition hover:border-[#0070f3] hover:bg-white/10 ${
                    section.size ?? ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-2xl border border-white/10 bg-white/5 p-2 text-[#7ac4ff]">
                      <Icon size={18} />
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                      Abrir
                    </span>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white">
                      {section.label}
                    </h3>
                    <p className="mt-2 text-sm text-white/60">
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.section
              key={activeSection}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(0,112,243,0.25)] backdrop-blur"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full bg-white/10 p-2 text-[#7ac4ff]">
                  {activeMeta ? <activeMeta.icon size={16} /> : null}
                </span>
                <h3 className="text-xl font-semibold text-white">
                  {activeMeta?.label ?? ""}
                </h3>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                {activeContent}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
