import fs from "fs";
import path from "path";
import Dashboard from "./components/Dashboard";
import type { GallerySection } from "./components/PhotoGallery";
import {
  bucketList,
  galleryTexts,
  heroContent,
  loveLetter,
  places,
  playerStats,
  playlistGroups,
  storyMoments,
  storyParagraphs,
} from "./data/anniversaryData";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

const BASE_SECTIONS: Omit<GallerySection, "images">[] = [
  {
    id: "risas",
    title: "Risas",
    description: galleryTexts.risas,
    variant: "collage",
  },
  {
    id: "familiares",
    title: "Familiares",
    description: galleryTexts.familiares,
    variant: "warm",
  },
  {
    id: "regalos",
    title: "Regalos",
    description: galleryTexts.regalos,
    variant: "default",
  },
  {
    id: "mejores",
    title: "Mejores fotos",
    description: galleryTexts.mejores,
    variant: "default",
  },
];

const getSectionImages = (sectionId: string, title: string) => {
  const publicDir = path.join(process.cwd(), "public");
  const directory = path.join(publicDir, "fotos", sectionId);

  const toPublicUrl = (filePath: string) =>
    `/${path.relative(publicDir, filePath).split(path.sep).join("/")}`;

  const collectImages = (dir: string): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectImages(fullPath);
      }
      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) {
          return [fullPath];
        }
      }
      return [];
    });
  };

  try {
    return collectImages(directory).map((filePath, index) => ({
      src: toPublicUrl(filePath),
      alt: `${title} ${index + 1}`,
    }));
  } catch {
    return [];
  }
};

export default function Home() {
  const sections: GallerySection[] = BASE_SECTIONS.map((section) => ({
    ...section,
    images: getSectionImages(section.id, section.title),
  }));

  return (
    <Dashboard
      hero={heroContent}
      storyParagraphs={storyParagraphs}
      storyMoments={storyMoments}
      players={playerStats}
      places={places}
      galleryIntro={galleryTexts.intro}
      gallerySections={sections}
      playlistGroups={playlistGroups}
      bucketList={bucketList}
      loveLetter={loveLetter}
    />
  );
}
