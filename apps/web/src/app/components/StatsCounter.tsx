"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";

interface StatsCounterProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const StatsCounter = ({ 
  icon, 
  value, 
  label, 
  suffix = "", 
  duration = 2 
}: StatsCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const increment = value / (duration * 60); // 60 FPS
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  return (
    <motion.div
      className="text-center group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      onViewportEnter={() => setIsVisible(true)}
    >
      <motion.div
        className="relative inline-block mb-4"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Icon container with gradient background */}
        <div className="relative p-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl border border-white/20 backdrop-blur-sm group-hover:border-white/40 transition-all duration-300">
          <div className="text-blue-400 group-hover:text-white transition-colors duration-300">
            {icon}
          </div>
          
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.05 }}
          />
        </div>

        {/* Floating particles around icon */}
        <motion.div
          className="absolute -top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div
          className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-purple-400 rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </motion.div>

      {/* Counter */}
      <motion.div
        className="text-4xl lg:text-5xl font-bold text-white mb-2"
        initial={{ scale: 0.5 }}
        whileInView={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 10,
          delay: 0.2 
        }}
        viewport={{ once: true }}
      >
        <motion.span
          key={count}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {count.toLocaleString()}
        </motion.span>
        <span className="text-blue-400">{suffix}</span>
      </motion.div>

      {/* Label */}
      <motion.p
        className="text-gray-300 font-medium text-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        {label}
      </motion.p>

      {/* Progress bar animation */}
      <motion.div
        className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 2, delay: 0.8 }}
          viewport={{ once: true }}
        />
      </motion.div>
    </motion.div>
  );
};

export default StatsCounter; 