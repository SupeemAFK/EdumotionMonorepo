'use client'

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FaPlay, FaCheck, FaLock, FaTrophy, FaFire, FaStar, FaCalendar, 
  FaClock, FaChevronRight, FaBookOpen, FaGraduationCap, FaLightbulb,
  FaRocket, FaHeart, FaUsers, FaMedal, FaChartLine, FaBullseye,
  FaArrowUp, FaArrowDown, FaCircle, FaUser
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

interface Skill {
  id: string;
  title: string;
  category: string;
  description: string;
  creator: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  lastAccessed: string;
  streak: number;
  achievements: string[];
  thumbnail: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// Mock data for learning journey
const mockSkills: Skill[] = [
  {
    id: "1",
    title: "Basic Circuit Building",
    category: "Electronics",
    description: "Learn to build simple electronic circuits with LEDs, resistors, and batteries",
    creator: "Dr. Sarah Electronics",
    totalSteps: 6,
    completedSteps: 3,
    currentStep: 4,
    difficulty: "Beginner",
    estimatedTime: "2h 30m",
    progress: 50,
    status: "in-progress",
    lastAccessed: "2 hours ago",
    streak: 5,
    achievements: ["First Circuit", "LED Master"],
    thumbnail: "/placeholder.jpg"
  },
  {
    id: "2",
    title: "Guitar Chord Mastery",
    category: "Music",
    description: "Master essential guitar chords and strumming patterns",
    creator: "Jake Martinez",
    totalSteps: 5,
    completedSteps: 5,
    currentStep: 5,
    difficulty: "Beginner",
    estimatedTime: "3h 15m",
    progress: 100,
    status: "completed",
    lastAccessed: "1 day ago",
    streak: 12,
    achievements: ["Chord Master", "First Song", "Rhythm King"],
    thumbnail: "/placeholder.jpg"
  },
  {
    id: "3",
    title: "Digital Art Fundamentals",
    category: "Art",
    description: "Create stunning digital artwork using drawing tablets and software",
    creator: "Emma Creative",
    totalSteps: 5,
    completedSteps: 1,
    currentStep: 2,
    difficulty: "Intermediate",
    estimatedTime: "4h 45m",
    progress: 20,
    status: "in-progress",
    lastAccessed: "3 days ago",
    streak: 2,
    achievements: ["Digital Setup"],
    thumbnail: "/placeholder.jpg"
  },
  {
    id: "4",
    title: "Chemistry Lab Experiments",
    category: "Science",
    description: "Conduct safe and exciting chemistry experiments",
    creator: "Prof. Michael Lab",
    totalSteps: 6,
    completedSteps: 0,
    currentStep: 1,
    difficulty: "Intermediate",
    estimatedTime: "2h 10m",
    progress: 0,
    status: "not-started",
    lastAccessed: "Never",
    streak: 0,
    achievements: [],
    thumbnail: "/placeholder.jpg"
  }
];

const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Started your first skill",
    icon: FaRocket,
    color: "from-blue-500 to-blue-600",
    unlocked: true,
    unlockedAt: "2 weeks ago"
  },
  {
    id: "2",
    title: "Streak Master",
    description: "Maintained a 7-day learning streak",
    icon: FaFire,
    color: "from-orange-500 to-red-600",
    unlocked: true,
    unlockedAt: "1 week ago"
  },
  {
    id: "3",
    title: "Skill Completionist",
    description: "Completed your first skill",
    icon: FaTrophy,
    color: "from-yellow-500 to-yellow-600",
    unlocked: true,
    unlockedAt: "3 days ago"
  },
  {
    id: "4",
    title: "Multi-Disciplinary",
    description: "Started skills in 3 different categories",
    icon: FaGraduationCap,
    color: "from-purple-500 to-purple-600",
    unlocked: true,
    unlockedAt: "2 days ago"
  },
  {
    id: "5",
    title: "Speed Learner",
    description: "Complete 5 skills in one month",
    icon: FaLightbulb,
    color: "from-green-500 to-green-600",
    unlocked: false
  },
  {
    id: "6",
    title: "Master Learner",
    description: "Reach 1000 total learning minutes",
    icon: FaMedal,
    color: "from-indigo-500 to-indigo-600",
    unlocked: false
  }
];

export default function LearningJourneyPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"overview" | "skills" | "achievements">("overview");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Calculate statistics
  const totalSkills = mockSkills.length;
  const completedSkills = mockSkills.filter(skill => skill.status === "completed").length;
  const inProgressSkills = mockSkills.filter(skill => skill.status === "in-progress").length;
  const totalProgress = Math.round(mockSkills.reduce((sum, skill) => sum + skill.progress, 0) / totalSkills);
  const currentStreak = Math.max(...mockSkills.map(skill => skill.streak));
  const unlockedAchievements = mockAchievements.filter(achievement => achievement.unlocked).length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600 bg-green-100";
      case "Intermediate": return "text-yellow-600 bg-yellow-100";
      case "Advanced": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "not-started": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const handleSkillClick = (skill: Skill) => {
    if (skill.status !== "not-started") {
      router.push(`/learn/${skill.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-100 rounded-full opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-100 rounded-full opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-yellow-100 rounded-full opacity-25 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-blue-100 rounded-full opacity-35 animate-blob"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(59,130,246,0.08)_1px,_transparent_0)] bg-[size:24px_24px] opacity-50"></div>
      </div>

      <Navbar />

      <div className="relative z-10 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FaRocket className="text-4xl text-blue-500 animate-bounce-gentle" />
              <FaChartLine className="text-3xl text-green-500 animate-pulse-soft" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
              Your Learning
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Journey</span>
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Track your progress, celebrate achievements, and continue building amazing skills!
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <div className="edu-card p-6 text-center animate-scale-in">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBookOpen className="text-xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{totalProgress}%</h3>
              <p className="text-gray-600">Overall Progress</p>
            </div>
            <div className="edu-card p-6 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{completedSkills}</h3>
              <p className="text-gray-600">Skills Completed</p>
            </div>
            <div className="edu-card p-6 text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFire className="text-xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{currentStreak}</h3>
              <p className="text-gray-600">Day Streak</p>
            </div>
            <div className="edu-card p-6 text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{unlockedAchievements}</h3>
              <p className="text-gray-600">Achievements</p>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center mb-8"
          >
            <div className="flex bg-white rounded-xl p-2 shadow-lg border border-gray-200">
              {[
                { id: "overview", label: "Overview", icon: FaChartLine },
                { id: "skills", label: "Skills", icon: FaBookOpen },
                { id: "achievements", label: "Achievements", icon: FaTrophy }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                      ${selectedTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="text-sm" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {selectedTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Progress Overview */}
                <div className="edu-card p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaBullseye className="text-blue-500" />
                    Learning Progress
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Skills by Category</h3>
                      <div className="space-y-4">
                        {["Electronics", "Music", "Art", "Science"].map((category) => {
                          const categorySkills = mockSkills.filter(skill => skill.category === category);
                          const avgProgress = categorySkills.reduce((sum, skill) => sum + skill.progress, 0) / categorySkills.length;
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-gray-600">{category}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${avgProgress}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{Math.round(avgProgress)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {mockSkills
                          .filter(skill => skill.status !== "not-started")
                          .sort((a, b) => a.lastAccessed.localeCompare(b.lastAccessed))
                          .slice(0, 3)
                          .map((skill) => (
                            <div key={skill.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className={`w-2 h-2 rounded-full ${skill.status === "completed" ? "bg-green-500" : "bg-blue-500"}`}></div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{skill.title}</p>
                                <p className="text-sm text-gray-600">{skill.lastAccessed}</p>
                              </div>
                              <div className="text-sm text-gray-500">{skill.progress}%</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Learning */}
                <div className="edu-card p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaPlay className="text-green-500" />
                    Continue Learning
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockSkills
                      .filter(skill => skill.status === "in-progress")
                      .map((skill) => (
                        <motion.div
                          key={skill.id}
                          className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSkillClick(skill)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-gray-800 mb-2">{skill.title}</h3>
                              <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FaClock className="text-xs" />
                                <span>{skill.estimatedTime}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{skill.progress}%</div>
                              <div className="text-xs text-gray-500">Step {skill.currentStep}/{skill.totalSteps}</div>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(skill.difficulty)}`}>
                              {skill.difficulty}
                            </span>
                            <motion.button
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaPlay className="text-xs" />
                              Continue
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === "skills" && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {mockSkills.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="edu-card p-6 cursor-pointer group relative overflow-hidden"
                    onClick={() => handleSkillClick(skill)}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4">
                      {skill.status === "completed" && <FaCheck className="text-green-500 text-xl" />}
                      {skill.status === "in-progress" && <FaPlay className="text-blue-500 text-xl" />}
                      {skill.status === "not-started" && <FaLock className="text-gray-400 text-xl" />}
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {skill.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {skill.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <FaUser className="text-xs" />
                        <span>{skill.creator}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-700">{skill.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            skill.status === "completed" ? "bg-green-500" : "bg-blue-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{skill.completedSteps}/{skill.totalSteps} steps</span>
                      <span>{skill.estimatedTime}</span>
                    </div>

                    {/* Difficulty and streak */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(skill.difficulty)}`}>
                        {skill.difficulty}
                      </span>
                      {skill.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <FaFire className="text-xs" />
                          <span className="text-sm font-medium">{skill.streak}</span>
                        </div>
                      )}
                    </div>

                    {/* Achievements */}
                    {skill.achievements.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 flex-wrap">
                          <FaTrophy className="text-yellow-500 text-sm" />
                          {skill.achievements.map((achievement, i) => (
                            <span key={i} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {selectedTab === "achievements" && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {mockAchievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className={`
                        edu-card p-6 text-center cursor-pointer group relative overflow-hidden
                        ${achievement.unlocked ? "bg-white" : "bg-gray-50 opacity-60"}
                      `}
                      onClick={() => achievement.unlocked && setShowAchievementModal(true)}
                      whileHover={achievement.unlocked ? { scale: 1.02 } : {}}
                    >
                      {/* Achievement icon */}
                      <div className={`
                        w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                        ${achievement.unlocked 
                          ? `bg-gradient-to-r ${achievement.color}` 
                          : "bg-gray-300"
                        }
                      `}>
                        <Icon className={`text-2xl ${achievement.unlocked ? "text-white" : "text-gray-500"}`} />
                      </div>

                      {/* Achievement details */}
                      <h3 className={`text-lg font-bold mb-2 ${achievement.unlocked ? "text-gray-800" : "text-gray-500"}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-4 ${achievement.unlocked ? "text-gray-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>

                      {/* Unlock status */}
                      {achievement.unlocked ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <FaCheck className="text-sm" />
                          <span className="text-sm font-medium">Unlocked {achievement.unlockedAt}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <FaLock className="text-sm" />
                          <span className="text-sm font-medium">Locked</span>
                        </div>
                      )}

                      {/* Shine effect for unlocked achievements */}
                      {achievement.unlocked && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 