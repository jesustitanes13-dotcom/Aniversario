import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { natalyStats, jesusStats } from '../data/mockData';

const ProgressBar = ({ label, value, displayValue, color = "bg-crimson" }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm font-bold text-crimson">{displayValue}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <motion.div 
        className={`h-2.5 rounded-full ${color}`} 
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </div>
  </div>
);

const Card3D = ({ title, stats, type }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        perspective: 1000,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 cursor-pointer relative overflow-hidden group"
    >
      {/* Glossy Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <h3 className="text-3xl font-serif text-center mb-8 text-gray-800">{title}</h3>

      <div className="space-y-6">
        {stats.map((stat, idx) => (
          <div key={idx}>
            {stat.isBadge ? (
              <div className="flex items-center justify-between bg-gold/10 p-4 rounded-xl border border-gold/30">
                <span className="font-medium text-gray-700">{stat.label}</span>
                <span className="bg-gold text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">{stat.displayValue}</span>
              </div>
            ) : stat.label === "Colección de Juguetes" ? (
               <div className="mt-4">
                 <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                    <span className="text-xs text-gray-500">{stat.details}</span>
                 </div>
                 <div className="grid grid-cols-5 gap-2">
                    {[...Array(20)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`aspect-square rounded-md ${i < 12 ? 'bg-crimson' : 'bg-gray-300'}`}
                        title={i < 12 ? "Regalo de Nataly" : "Juguete"}
                      />
                    ))}
                 </div>
               </div>
            ) : (
              <ProgressBar 
                label={stat.label} 
                value={stat.value} 
                displayValue={stat.displayValue}
                color={title === "Nataly" ? "bg-crimson" : "bg-blue-600"}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const DuoCards = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-cream to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-800">The Duo</h2>
          <p className="mt-4 text-gray-500 font-sans tracking-wide">Nuestras Estadísticas</p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-24 items-center perspective-container">
          <Card3D title="Nataly" stats={natalyStats} type="nataly" />
          <Card3D title="Jesús" stats={jesusStats} type="jesus" />
        </div>
      </div>
    </section>
  );
};

export default DuoCards;
