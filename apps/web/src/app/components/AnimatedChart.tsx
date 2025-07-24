"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Trophy, Gamepad2, Star, Award } from "lucide-react";

const AnimatedChart = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Sample data for learning progress
  const chartData = [
    { month: "Jan", value: 25, label: "Guitar Basics" },
    { month: "Feb", value: 50, label: "Circuit Design" },
    { month: "Mar", value: 75, label: "Fitness Training" },
    { month: "Apr", value: 85, label: "Art & Drawing" },
    { month: "May", value: 95, label: "Cooking Skills" },
    { month: "Jun", value: 100, label: "Photography" },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Chart Container */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">AI-Powered Learning Progress</h3>
          <p className="text-gray-300">Your fun, gamified skill development journey</p>
        </motion.div>

        {/* Chart */}
        <div className="relative h-80 px-4">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 25, 50, 75, 100].map((value) => (
              <motion.div
                key={value}
                className="h-px bg-white/10"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-sm text-gray-400 -ml-8">
            {[100, 75, 50, 25, 0].map((value) => (
              <motion.span
                key={value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {value}%
              </motion.span>
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-between px-4">
            {chartData.map((item, index) => (
              <div key={item.month} className="flex flex-col items-center flex-1 mx-1">
                {/* Bar */}
                <motion.div
                  className="relative w-full max-w-12 mb-4"
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxValue) * 100}%` }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.2,
                    ease: "easeOut"
                  }}
                >
                  {/* Gradient bar */}
                  <div className="w-full h-full bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-t-lg relative overflow-hidden">
                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        duration: 2,
                        delay: index * 0.2 + 1,
                        ease: "easeInOut"
                      }}
                    />
                  </div>

                  {/* Value label */}
                  <motion.div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white font-semibold text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 1.5 }}
                  >
                    {item.value}%
                  </motion.div>
                </motion.div>

                {/* Month label */}
                <motion.span
                  className="text-gray-300 text-sm font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                >
                  {item.month}
                </motion.span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          {chartData.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{
                  background: `linear-gradient(45deg, 
                    hsl(${220 + index * 30}, 70%, 60%), 
                    hsl(${250 + index * 30}, 70%, 70%))`
                }}
              />
              <span className="text-gray-300">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating gaming elements around the chart */}
      <motion.div
        className="absolute -top-6 -right-6 text-yellow-400"
        animate={{ 
          rotate: 360,
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity }
        }}
      >
        <Trophy className="w-8 h-8" />
      </motion.div>

      <motion.div
        className="absolute -bottom-6 -left-6 text-purple-400"
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.7, 1, 0.7],
          rotate: [0, 15, -15, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Gamepad2 className="w-6 h-6" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 -right-10 text-pink-400"
        animate={{ 
          x: [0, 15, 0],
          rotate: [0, 360]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Star className="w-5 h-5" />
      </motion.div>

      <motion.div
        className="absolute top-1/4 -left-8 text-green-400"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -360]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Award className="w-6 h-6" />
      </motion.div>
    </div>
  );
};

export default AnimatedChart; 