import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tabs = ["Risas", "Familiares", "Regalos & Fotos"];

const RisasGallery = () => {
  // Mock items imitating scattered polaroids
  const items = [1, 2, 3, 4, 5];
  
  return (
    <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden">
      {items.map((item, index) => {
        const randomRotate = Math.random() * 20 - 10;
        const randomX = Math.random() * 100 - 50;
        const randomY = Math.random() * 100 - 50;

        return (
          <motion.div
            key={item}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: randomRotate, x: randomX, y: randomY }}
            transition={{ delay: index * 0.1 }}
            className="absolute w-48 h-60 bg-white p-3 shadow-lg transform hover:z-50 hover:scale-110 transition-all duration-300 cursor-pointer"
          >
            <div className="w-full h-40 bg-gray-200 mb-2 overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">Foto</div>
            </div>
            <div className="text-center font-handwriting text-gray-600 text-sm">Jajaja {item}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

const FamiliaresGallery = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-3xl text-center mb-12">
        <h3 className="text-3xl font-serif text-gray-800 italic mb-6">"La familia es donde la vida comienza y el amor nunca termina."</h3>
        <p className="text-gray-600">Un agradecimiento especial a la familia Gomez Ibarra por todo el cariño.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {[1, 2].map((i) => (
          <div key={i} className="aspect-video bg-warm-gray-100 rounded-lg overflow-hidden shadow-md border-4 border-white">
             <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Foto Familiar {i}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RegalosGallery = () => {
  return (
    <div className="flex overflow-x-auto space-x-6 p-8 pb-12 snap-x">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div 
            key={i} 
            className="flex-shrink-0 w-72 h-96 bg-white rounded-xl shadow-lg overflow-hidden snap-center"
            whileHover={{ y: -10 }}
        >
           <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
             Highlight {i}
           </div>
        </motion.div>
      ))}
    </div>
  );
};

const ChapterGallery = () => {
  const [selectedTab, setSelectedTab] = useState(Tabs[0]);

  return (
    <section className="py-24 bg-cream/50 min-h-screen">
       <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-800 mb-8">Nuestros Capítulos</h2>
            
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 bg-white/50 p-2 rounded-full inline-flex backdrop-blur-sm">
                {Tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                            selectedTab === tab ? 'text-white' : 'text-gray-600 hover:text-crimson'
                        }`}
                    >
                        {selectedTab === tab && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute inset-0 bg-crimson rounded-full shadow-lg"
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{tab}</span>
                    </button>
                ))}
            </div>
          </div>

          <div className="bg-white/30 rounded-3xl p-6 min-h-[600px] backdrop-blur-sm border border-white/40">
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {selectedTab === "Risas" && <RisasGallery />}
                    {selectedTab === "Familiares" && <FamiliaresGallery />}
                    {selectedTab === "Regalos & Fotos" && <RegalosGallery />}
                </motion.div>
            </AnimatePresence>
          </div>
       </div>
    </section>
  );
};

export default ChapterGallery;
