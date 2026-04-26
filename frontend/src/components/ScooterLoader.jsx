import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScooterLoader = ({ isVisible, text = 'Preparing your sweet order...' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-md h-64 flex flex-col items-center justify-center overflow-hidden">
            {/* Road */}
            <div className="absolute bottom-16 left-0 right-0 h-[2px] bg-border/50" />
            
            {/* Scooter Animation */}
            <div className="scooter-drive relative">
              <div className="relative text-6xl">
                🛵
                {/* Wheels spin effect using circles if emoji isn't enough, but let's use motion on the whole thing */}
              </div>
              
              {/* Smoke trail */}
              <motion.div 
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.8],
                  x: [-20, -40],
                  y: [-5, -15]
                }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute -left-4 bottom-2 text-xl"
              >
                💨
              </motion.div>
            </div>

            {/* Progress Text */}
            <motion.p 
              key={text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-lg font-black text-primary tracking-tight text-center px-4"
            >
              {text}
            </motion.p>
            
            <p className="mt-2 text-xs font-bold text-muted uppercase tracking-[0.3em]">Packing Happiness</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScooterLoader;
