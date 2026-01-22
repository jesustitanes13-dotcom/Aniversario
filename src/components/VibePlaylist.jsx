import React from 'react';
import { motion } from 'framer-motion';
import { Play, Disc } from 'lucide-react';
import { playlist } from '../data/mockData';

const SongCard = ({ song }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`relative group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 overflow-hidden ${song.isTop ? 'border-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : ''}`}
    >
        {song.isTop && (
             <div className="absolute top-0 right-0 bg-gold text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">TOP 1</div>
        )}
      
      {/* Cover Art Placeholder */}
      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
        <Disc className={`text-white/50 ${song.isTop ? 'text-gold' : ''}`} size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate font-sans">{song.title}</h4>
        <p className="text-white/60 text-sm truncate">{song.artist}</p>
      </div>

      <button 
        onClick={() => window.open(song.url, '_blank')}
        className="w-10 h-10 rounded-full bg-crimson flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors z-10"
      >
        <Play size={18} fill="currentColor" className="ml-0.5" />
      </button>
    </motion.div>
  );
};

const VibePlaylist = () => {
  return (
    <section className="py-24 bg-gray-900 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-serif text-white mb-2">Vibes de Nosotros</h2>
                <p className="text-gray-400 text-sm uppercase tracking-widest">Nuestra Playlist</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlist.map((song) => (
                    <SongCard key={song.id} song={song} />
                ))}
            </div>
        </div>
    </section>
  );
};

export default VibePlaylist;
