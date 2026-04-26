import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Confetti = ({ count = 50 }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ['#3B1A0F', '#6B2D14', '#C47A52', '#D4A017', '#4A7C59'];
    const newPieces = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 100,
      size: 5 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      rotate: Math.random() * 360
    }));
    setPieces(newPieces);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: `${p.y}%`, left: `${p.x}%`, opacity: 1, rotate: 0 }}
          animate={{ 
            top: '120%', 
            left: `${p.x + (Math.random() * 20 - 10)}%`,
            rotate: p.rotate + 720
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay, 
            ease: "easeIn",
            repeat: Infinity 
          }}
          className="absolute"
          style={{ 
            width: p.size, 
            height: p.size, 
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
