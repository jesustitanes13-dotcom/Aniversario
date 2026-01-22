import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUp } from 'lucide-react';

const letterText = `Gracias por cada momento, cada risa y cada aventura juntos.
Eres mi persona favorita en el mundo y no puedo esperar a vivir mil aventuras más contigo.
Te amo infinitamente, Nataly.`;

const FooterLetter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-24 px-4 bg-white text-center relative">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
            <Heart className="w-12 h-12 text-crimson mx-auto mb-6 animate-pulse" fill="currentColor" />
            
            <div className="font-serif text-2xl md:text-3xl text-gray-800 leading-relaxed italic">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.05 }}
                >
                    {letterText.split("").map((char, index) => (
                        <motion.span
                            key={index}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1 }
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>
            </div>
            
            <p className="mt-8 text-gray-500 font-handwriting text-lg">- Jesús</p>
        </div>

        <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 mx-auto text-crimson hover:text-red-700 transition-colors"
        >
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                <ArrowUp size={24} />
            </div>
            <span className="text-sm tracking-widest uppercase font-medium">Volver arriba</span>
        </button>

        <div className="mt-16 text-xs text-gray-300">
            Hecho con ❤️ para nuestro Aniversario
        </div>
      </div>
    </footer>
  );
};

export default FooterLetter;
