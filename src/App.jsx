import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes (Placeholders por ahora)
import HeroSection from './components/HeroSection';
import StoryTimeline from './components/StoryTimeline';
import DuoCards from './components/DuoCards';
import MemoriesMap from './components/MemoriesMap';
import ChapterGallery from './components/ChapterGallery';
import VibePlaylist from './components/VibePlaylist';
import BucketList from './components/BucketList';
import FooterLetter from './components/FooterLetter';

function App() {
  return (
    <div className="min-h-screen bg-cream selection:bg-crimson selection:text-white">
      <AnimatePresence mode="wait">
        <main className="flex flex-col gap-0">
          <HeroSection />
          <StoryTimeline />
          <DuoCards />
          <MemoriesMap />
          <ChapterGallery />
          <VibePlaylist />
          <BucketList />
          <FooterLetter />
        </main>
      </AnimatePresence>
    </div>
  );
}

export default App;
