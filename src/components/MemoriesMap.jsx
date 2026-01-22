import React from 'react';
import { motion } from 'framer-motion';
import { memories } from '../data/mockData';
import { Film, Music, MapPin } from 'lucide-react';

const IconMap = {
  Film: Film,
  Music: Music,
  Stadium: MapPin // Usar MapPin como fallback visual para Stadium si no existe
};

const MemoryCard = ({ memory }) => {
  const Icon = IconMap[memory.icon] || MapPin;

  return (
    <motion.div
      className="relative h-64 md:h-80 bg-gray-100 rounded-2xl overflow-hidden cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-gray-300 group-hover:scale-110 transition-transform duration-700">
        {/* <img src={`/images/place-${memory.id}.jpg`} alt={memory.title} className="w-full h-full object-cover" /> */}
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
            <Icon className="w-16 h-16 text-white/50" />
        </div>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-300 flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-2xl font-serif text-white font-bold mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {memory.title}
        </h3>
        <p className="text-white/90 font-sans text-sm md:text-base opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
          {memory.description}
        </p>
      </div>
    </motion.div>
  );
};

const MemoriesMap = () => {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-crimson mb-4">Mapa de Recuerdos</h2>
          <p className="text-gray-500 uppercase tracking-widest text-sm">Lugares Sagrados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemoriesMap;
