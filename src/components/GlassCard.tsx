import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glow = false 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.02 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        backdrop-blur-xl bg-slate-800/30 border border-teal-400/20 rounded-2xl
        ${glow ? 'shadow-lg shadow-teal-400/10' : ''}
        ${hover ? 'hover:bg-slate-800/40 hover:border-teal-400/30' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;