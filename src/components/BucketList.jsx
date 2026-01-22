import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2 } from 'lucide-react';
import { initialBucketList } from '../data/mockData';

const BucketList = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('bucketList');
    return saved ? JSON.parse(saved) : initialBucketList;
  });
  
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    localStorage.setItem('bucketList', JSON.stringify(items));
  }, [items]);

  const toggleComplete = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const newItem = {
      id: Date.now(),
      text: newItemText,
      completed: false
    };
    
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id) => {
      setItems(items.filter(item => item.id !== id));
  }

  return (
    <section className="py-24 px-4 bg-cream">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif text-gray-800 mb-2">Bucket List</h2>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Nuestras Metas</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
          {/* Add New Item */}
          <form onSubmit={addItem} className="flex gap-2 mb-8">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Nueva meta juntos..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-all"
            />
            <button 
              type="submit"
              className="bg-crimson text-white p-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus size={24} />
            </button>
          </form>

          {/* List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    item.completed ? 'bg-gray-50' : 'bg-white border border-gray-100 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-crimson'
                    }`}
                  >
                    {item.completed && <Check size={14} strokeWidth={3} />}
                  </button>
                  
                  <span className={`flex-1 font-medium font-sans text-lg transition-all ${
                    item.completed ? 'text-gray-400 line-through decoration-2 decoration-green-500/50' : 'text-gray-700'
                  }`}>
                    {item.text}
                  </span>

                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                      <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {items.length === 0 && (
                <p className="text-center text-gray-400 py-8">¡Agrega nuevas aventuras!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BucketList;
