import React from 'react';
import { motion } from 'framer-motion';
import { Eye, User, Flame, Trophy, Heart } from 'lucide-react';
import { storyPoints } from '../data/mockData';

const IconMap = {
  Eye: Eye,
  User: User,
  Flame: Flame,
  Trophy: Trophy,
  Heart: Heart
};

const TimelineItem = ({ item, index }) => {
  const Icon = IconMap[item.icon] || Heart;
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`flex items-center justify-between mb-24 w-full ${isEven ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Content Side */}
      <div className="w-5/12 text-right">
        <div className={`p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl ${isEven ? 'text-left' : 'text-right'}`}>
          <span className="text-crimson font-serif font-bold text-xl block mb-2">{item.date}</span>
          <h3 className="text-2xl md:text-3xl font-serif text-gray-800 mb-4">{item.title}</h3>
          <p className="text-gray-600 font-sans leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Center Line & Icon */}
      <div className="w-2/12 flex flex-col items-center justify-center relative">
        <div className="w-px h-full bg-crimson/30 absolute top-0 bottom-0" />
        <div className="w-12 h-12 bg-crimson rounded-full flex items-center justify-center z-10 shadow-[0_0_20px_rgba(220,20,60,0.4)]">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Image/Visual Side */}
      <div className="w-5/12">
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
           {/* Placeholder for images based on ID */}
           <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
              <span className="text-4xl">Image {item.id}</span>
           </div>
           {/* If real images exist: <img src={`/images/story-${item.id}.jpg`} alt={item.title} className="object-cover w-full h-full" /> */}
        </div>
      </div>
    </motion.div>
  );
};

const StoryTimeline = () => {
  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-24"
      >
        <h2 className="text-4xl md:text-5xl font-serif text-crimson mb-6">Cómo me enamoré</h2>
        <p className="text-gray-500 font-sans uppercase tracking-widest text-sm">Nuestra Historia</p>
      </motion.div>

      <div className="relative">
        {/* Continuous Line Background */}
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-crimson/20 to-transparent" />
        
        {storyPoints.map((item, index) => (
          <TimelineItem key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
};

export default StoryTimeline;
