"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaPlay, FaPlus, FaSearch, FaUser, FaClock, FaStar, FaChevronRight, FaBookOpen, FaGraduationCap, FaLightbulb, FaTrophy, FaFire, FaUsers } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  title: string;
  description: string;
  creator: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  thumbnail: string;
  tags: string[];
  steps: number;
  enrolled: number;
}

const mockSkills: Skill[] = [
  {
    id: "1",
    title: "Basic Circuit Building",
    description: "Learn to build simple electronic circuits with LEDs, resistors, and batteries through hands-on projects",
    creator: "Dr. Sarah Electronics",
    duration: "2h 30m",
    difficulty: "Beginner",
    rating: 4.8,
    thumbnail: "/placeholder.jpg",
    tags: ["Electronics", "Circuits", "Hands-on"],
    steps: 8,
    enrolled: 1234
  },
  {
    id: "2",
    title: "Guitar Chord Mastery",
    description: "Master essential guitar chords and strumming patterns with interactive video lessons and practice exercises",
    creator: "Jake Martinez",
    duration: "3h 15m",
    difficulty: "Beginner",
    rating: 4.9,
    thumbnail: "/placeholder.jpg",
    tags: ["Music", "Guitar", "Chords"],
    steps: 12,
    enrolled: 856
  },
  {
    id: "3",
    title: "Digital Art Fundamentals",
    description: "Create stunning digital artwork using drawing tablets and software with step-by-step tutorials",
    creator: "Emma Creative",
    duration: "4h 45m",
    difficulty: "Intermediate",
    rating: 4.7,
    thumbnail: "/placeholder.jpg",
    tags: ["Art", "Digital Drawing", "Creative"],
    steps: 15,
    enrolled: 678
  },
  {
    id: "4",
    title: "Chemistry Lab Experiments",
    description: "Conduct safe and exciting chemistry experiments to understand chemical reactions and properties",
    creator: "Prof. Michael Lab",
    duration: "2h 10m",
    difficulty: "Intermediate",
    rating: 4.6,
    thumbnail: "/placeholder.jpg",
    tags: ["Science", "Chemistry", "Experiments"],
    steps: 6,
    enrolled: 943
  },
  {
    id: "5",
    title: "Home Workout Routines",
    description: "Build strength and fitness with guided workout routines that require no equipment",
    creator: "Coach Alex Fit",
    duration: "1h 20m",
    difficulty: "Beginner",
    rating: 4.8,
    thumbnail: "/placeholder.jpg",
    tags: ["Fitness", "Exercise", "Health"],
    steps: 10,
    enrolled: 567
  },
  {
    id: "6",
    title: "Arduino Programming",
    description: "Learn to program Arduino microcontrollers to create interactive electronic projects and robots",
    creator: "Dr. Tech Innovator",
    duration: "6h 30m",
    difficulty: "Advanced",
    rating: 4.9,
    thumbnail: "/placeholder.jpg",
    tags: ["Electronics", "Programming", "Arduino"],
    steps: 20,
    enrolled: 789
  },
  {
    id: "7",
    title: "Watercolor Painting Basics",
    description: "Discover the art of watercolor painting with techniques for blending, layering, and creating beautiful landscapes",
    creator: "Artist Luna Colors",
    duration: "3h 45m",
    difficulty: "Beginner",
    rating: 4.7,
    thumbnail: "/placeholder.jpg",
    tags: ["Art", "Painting", "Watercolor"],
    steps: 14,
    enrolled: 432
  },
  {
    id: "8",
    title: "Physics Lab Mechanics",
    description: "Explore fundamental physics concepts through hands-on experiments with motion, forces, and energy",
    creator: "Dr. Physics Pro",
    duration: "4h 00m",
    difficulty: "Advanced",
    rating: 4.8,
    thumbnail: "/placeholder.jpg",
    tags: ["Science", "Physics", "Mechanics"],
    steps: 16,
    enrolled: 321
  },
  {
    id: "9",
    title: "Yoga for Beginners",
    description: "Learn basic yoga poses and breathing techniques to improve flexibility, strength, and mindfulness",
    creator: "Yogi Zen Master",
    duration: "2h 30m",
    difficulty: "Beginner",
    rating: 4.9,
    thumbnail: "/placeholder.jpg",
    tags: ["Fitness", "Yoga", "Wellness"],
    steps: 12,
    enrolled: 876
  },
  {
    id: "10",
    title: "3D Printing Design",
    description: "Design and create your own 3D printed objects using CAD software and 3D printing techniques",
    creator: "Designer Tech Maker",
    duration: "5h 15m",
    difficulty: "Intermediate",
    rating: 4.6,
    thumbnail: "/placeholder.jpg",
    tags: ["Technology", "3D Design", "Making"],
    steps: 18,
    enrolled: 654
  }
];

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const router = useRouter();

  const categories = ["All", "Electronics", "Music", "Art", "Science", "Fitness", "Technology"];

  const filteredSkills = mockSkills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || 
                           skill.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "text-green-600";
      case "Intermediate": return "text-yellow-600";
      case "Advanced": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-700";
      case "Intermediate": return "bg-yellow-100 text-yellow-700";
      case "Advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleStartLearning = (skillId: string) => {
    router.push(`/learn/${skillId}`);
  };

  const handleCreateSkill = () => {
    router.push("/create-learning");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <FaGraduationCap className="text-4xl text-blue-500 animate-bounce-gentle" />
              <FaTrophy className="text-3xl text-yellow-500 animate-pulse-soft" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4 leading-tight">
              Master Real-World
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Skills</span>
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Learn through hands-on interactive experiences! Build circuits, play guitar, create art, 
              conduct science experiments, and develop practical skills with expert guidance.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="edu-card text-center p-6 animate-scale-in">
              <FaUsers className="text-3xl text-blue-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-800 mb-1">5,000+</h3>
              <p className="text-gray-600">Hands-on Learners</p>
            </div>
            <div className="edu-card text-center p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <FaBookOpen className="text-3xl text-green-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-800 mb-1">200+</h3>
              <p className="text-gray-600">Interactive Skills</p>
            </div>
            <div className="edu-card text-center p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <FaFire className="text-3xl text-red-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-800 mb-1">92%</h3>
              <p className="text-gray-600">Skill Mastery Rate</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          >
            <motion.button
              onClick={handleCreateSkill}
              className="edu-button-primary flex items-center gap-3 px-8 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="text-lg" />
              Create Interactive Skill
            </motion.button>
            <motion.button
              onClick={() => router.push('/journey')}
              className="edu-button-secondary flex items-center gap-3 px-8 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBookOpen className="text-lg" />
              My Skill Journey
            </motion.button>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col lg:flex-row gap-6 items-center justify-center"
          >
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search interactive skills, experiments, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="edu-input w-full pl-12 pr-4 py-4 text-lg"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="edu-card p-6 cursor-pointer group relative overflow-hidden"
              onClick={() => handleSkillSelect(skill)}
              whileHover={{ scale: 1.02 }}
            >
              {/* Skill Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {skill.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                  <FaStar className="text-yellow-500 text-sm" />
                  <span className="text-sm font-bold text-yellow-700">{skill.rating}</span>
                </div>
              </div>

              {/* Difficulty Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getDifficultyBg(skill.difficulty)}`}>
                  <FaGraduationCap className="text-xs" />
                  {skill.difficulty}
                </span>
              </div>

              {/* Skill Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <FaUser className="text-xs" />
                  <span>{skill.creator}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="text-xs" />
                  <span>{skill.duration}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {skill.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats and Action */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{skill.steps}</span> steps • 
                  <span className="font-medium"> {skill.enrolled}</span> enrolled
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartLearning(skill.id);
                  }}
                  className="edu-button-primary flex items-center gap-2 px-4 py-2 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlay className="text-xs" />
                  Start Learning
                </motion.button>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FaLightbulb className="text-6xl text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No interactive skills found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Try adjusting your search or explore different categories. Or create your own hands-on learning experience!
            </p>
            <motion.button
              onClick={handleCreateSkill}
              className="edu-button-primary px-8 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your First Interactive Skill
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 pr-4">
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">{selectedSkill.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{selectedSkill.description}</p>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-light"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-600 font-medium mb-1">Creator</div>
                  <div className="text-gray-800 font-bold">{selectedSkill.creator}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-600 font-medium mb-1">Duration</div>
                  <div className="text-gray-800 font-bold">{selectedSkill.duration}</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="text-sm text-yellow-600 font-medium mb-1">Difficulty</div>
                  <div className={`font-bold ${getDifficultyColor(selectedSkill.difficulty)}`}>
                    {selectedSkill.difficulty}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-600 font-medium mb-1">Rating</div>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="text-gray-800 font-bold">{selectedSkill.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">What you'll master</h3>
                <div className="space-y-3">
                  {selectedSkill.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-700">
                      <FaChevronRight className="text-blue-500 text-sm" />
                      <span>Hands-on {tag} skills through interactive practice</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => handleStartLearning(selectedSkill.id)}
                  className="edu-button-primary flex-1 flex items-center justify-center gap-3 px-6 py-4 text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaPlay className="text-lg" />
                  Start Learning
                </motion.button>
                <motion.button
                  onClick={() => setSelectedSkill(null)}
                  className="edu-button-secondary px-6 py-4 text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage; 