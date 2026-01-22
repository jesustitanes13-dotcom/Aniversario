import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { startDate } from '../data/mockData';

const TimeCounter = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 text-center z-10">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg">
            {value.toString().padStart(2, '0')}
          </span>
          <span className="text-xs md:text-sm uppercase tracking-widest text-cream opacity-90">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background with Ken Burns effect */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/images/portada.jpg')",
          scale: scale,
        }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          repeatType: "reverse", 
          ease: "easeInOut" 
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </motion.div>

      {/* Header that fades out */}
      <motion.header 
        style={{ opacity }}
        className="absolute top-0 w-full p-6 flex justify-between items-center z-20 text-white"
      >
        <h1 className="text-2xl font-serif italic">N & J</h1>
        <span className="text-sm tracking-widest uppercase">26 . 01 . 24</span>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-white text-lg md:text-xl tracking-[0.2em] uppercase mb-4">Desde aquel día</h2>
          <TimeCounter />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/80"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-sm uppercase tracking-widest">Descubre Nuestra Historia</span>
      </motion.div>
    </div>
  );
};

export default HeroSection;
