"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp,
  Play,
  Sparkles,
  Zap,
  Target,
  Brain,
  Music,
  Cpu,
  Dumbbell,
  Palette,
  ChefHat,
  Camera,
  Gamepad2,
  Trophy,
  Star
} from "lucide-react";
import AnimatedChart from "./AnimatedChart";
import StatsCounter from "./StatsCounter";

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating gaming elements */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {i % 4 === 0 && <Star className="w-4 h-4 text-yellow-400" />}
            {i % 4 === 1 && <Trophy className="w-4 h-4 text-orange-400" />}
            {i % 4 === 2 && <Gamepad2 className="w-4 h-4 text-purple-400" />}
            {i % 4 === 3 && <div className="w-3 h-3 bg-blue-400 rounded-full" />}
          </motion.div>
        ))}

        {/* Interactive gradient that follows mouse */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.3), transparent 40%)`,
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo with animation */}
              <motion.div
                className="flex justify-center lg:justify-start mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.5 }}
              >
                <div className="relative">
                  <Image
                    src="/EduLogo.png"
                    alt="EduMotion Logo"
                    width={120}
                    height={120}
                    className="drop-shadow-2xl"
                  />
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Master Skills with
                <motion.span
                  className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent ml-4"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  EduMotion
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-300 mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Master any skill through AI-powered, fun interactive learning. From playing guitar 
                to building circuits, fitness routines to creative arts - learn by doing with 
                gamified experiences and intelligent real-time feedback.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link href="/">
                  <motion.button
                    className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-3 hover:shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                <Link href="/">
                  <motion.button
                    className="group border-2 border-blue-400 text-blue-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-400 hover:text-white transition-all duration-300 flex items-center gap-3"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Explore Skills
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Animated Chart */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <AnimatedChart />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <StatsCounter
              icon={<Users className="w-8 h-8" />}
              value={75000}
              label="Skill Learners"
              suffix="+"
            />
            <StatsCounter
              icon={<BookOpen className="w-8 h-8" />}
              value={500}
              label="Interactive Skills"
              suffix="+"
            />
            <StatsCounter
              icon={<Award className="w-8 h-8" />}
              value={95}
              label="Skill Mastery Rate"
              suffix="%"
            />
            <StatsCounter
              icon={<TrendingUp className="w-8 h-8" />}
              value={180}
              label="Countries Reached"
              suffix="+"
            />
          </motion.div>
        </div>
      </section>

      {/* Skills Categories Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent ml-4">
                Learning Path
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore diverse skills with AI-powered, gamified learning that makes practice fun and engaging
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {[
              {
                                 icon: <Music className="w-16 h-16" />,
                 title: "Music & Audio",
                 skills: ["Guitar Hero Mode", "Piano Challenges", "Drum Battles", "Beat Creation"],
                 color: "from-pink-500 to-rose-500"
              },
              {
                                 icon: <Cpu className="w-16 h-16" />,
                 title: "Electronics",
                 skills: ["Circuit Puzzles", "Arduino Quests", "Robot Building", "IoT Adventures"],
                 color: "from-blue-500 to-cyan-500"
              },
              {
                                 icon: <Dumbbell className="w-16 h-16" />,
                 title: "Fitness & Health",
                 skills: ["Workout Games", "Yoga Challenges", "Nutrition Quests", "Sports Training"],
                 color: "from-green-500 to-emerald-500"
              },
              {
                                 icon: <Palette className="w-16 h-16" />,
                 title: "Arts & Design",
                 skills: ["Drawing Battles", "Paint Challenges", "Digital Art Quests", "3D Adventures"],
                 color: "from-purple-500 to-violet-500"
              },
              {
                                 icon: <ChefHat className="w-16 h-16" />,
                 title: "Culinary Arts",
                 skills: ["Cooking Competitions", "Baking Challenges", "Food Art", "Recipe Mastery"],
                 color: "from-orange-500 to-red-500"
              },
              {
                                 icon: <Camera className="w-16 h-16" />,
                 title: "Photography",
                 skills: ["Photo Missions", "Composition Games", "Edit Battles", "Light Mastery"],
                 color: "from-indigo-500 to-blue-500"
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div
                  className={`inline-flex p-6 rounded-3xl bg-gradient-to-r ${category.color} mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="text-white">
                    {category.icon}
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">{category.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.span
                      key={skillIndex}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300 border border-white/20"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              How We Make
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent ml-4">
                Learning Better
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              AI-powered technology meets gamified learning methods for fun, engaging skill development
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12" />,
                title: "AI-Powered Learning",
                description: "Smart algorithms adapt to your style, making guitar, fitness, and arts learning personalized and fun",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Zap className="w-12 h-12" />,
                title: "Gamified Practice",
                description: "Turn skill-building into an addictive game with points, levels, and challenges",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Target className="w-12 h-12" />,
                title: "Fun Skill Mastery",
                description: "Level up from beginner to expert through engaging, game-like progression",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "Social Learning",
                description: "Compete and collaborate with friends in fun learning challenges and tournaments",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: <Award className="w-12 h-12" />,
                title: "Rewards & Badges",
                description: "Unlock achievements, collect badges, and celebrate milestones in your learning journey",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "Smart Feedback",
                description: "AI analyzes your performance and gives encouraging, actionable feedback to keep you motivated",
                color: "from-teal-500 to-blue-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Master Your Next Skill?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of learners mastering guitar, circuits, fitness, arts, and more through AI-powered, gamified practice that makes learning addictively fun
            </p>
            <Link href="/">
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-6 rounded-full font-bold text-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-4"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-6 h-6" />
                Begin Learning Today
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 