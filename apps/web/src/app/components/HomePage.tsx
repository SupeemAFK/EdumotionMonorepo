"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaPlay, FaPlus, FaSearch, FaUser, FaVideo, FaClock, FaStar, FaChevronRight, FaBookOpen, FaGraduationCap, FaLightbulb } from "react-icons/fa";
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
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming language with hands-on examples",
    creator: "John Doe",
    duration: "2h 30m",
    difficulty: "Beginner",
    rating: 4.8,
    thumbnail: "/placeholder.jpg",
    tags: ["Programming", "Web Development", "JavaScript"],
    steps: 8,
    enrolled: 1234
  },
  {
    id: "2",
    title: "React Component Design",
    description: "Master the art of creating reusable and maintainable React components",
    creator: "Jane Smith",
    duration: "3h 15m",
    difficulty: "Intermediate",
    rating: 4.9,
    thumbnail: "/placeholder.jpg",
    tags: ["React", "Frontend", "Components"],
    steps: 12,
    enrolled: 856
  },
  {
    id: "3",
    title: "Python Data Analysis",
    description: "Analyze data using Python libraries like Pandas and NumPy",
    creator: "Mike Johnson",
    duration: "4h 45m",
    difficulty: "Advanced",
    rating: 4.7,
    thumbnail: "/placeholder.jpg",
    tags: ["Python", "Data Science", "Analytics"],
    steps: 15,
    enrolled: 678
  },
  {
    id: "4",
    title: "UI/UX Design Principles",
    description: "Learn fundamental design principles for creating user-friendly interfaces",
    creator: "Sarah Wilson",
    duration: "2h 10m",
    difficulty: "Beginner",
    rating: 4.6,
    thumbnail: "/placeholder.jpg",
    tags: ["Design", "UI/UX", "Principles"],
    steps: 6,
    enrolled: 943
  },
  {
    id: "5",
    title: "Node.js Backend Development",
    description: "Build scalable backend applications using Node.js and Express",
    creator: "Alex Brown",
    duration: "5h 20m",
    difficulty: "Intermediate",
    rating: 4.8,
    thumbnail: "/placeholder.jpg",
    tags: ["Node.js", "Backend", "API"],
    steps: 18,
    enrolled: 567
  },
  {
    id: "6",
    title: "Machine Learning Basics",
    description: "Introduction to machine learning concepts and practical implementation",
    creator: "Dr. Emily Chen",
    duration: "6h 30m",
    difficulty: "Advanced",
    rating: 4.9,
    thumbnail: "/placeholder.jpg",
    tags: ["Machine Learning", "AI", "Python"],
    steps: 20,
    enrolled: 789
  }
];

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const router = useRouter();

  const categories = ["All", "Programming", "Design", "Data Science", "Web Development", "AI/ML"];

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
      case "Beginner": return "text-green-500";
      case "Intermediate": return "text-yellow-500";
      case "Advanced": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleStartLearning = (skillId: string) => {
    // Navigate to skill learning page (we'll use the existing SkillPage for now)
    router.push(`/learn/${skillId}`);
  };

  const handleCreateSkill = () => {
    router.push("/video-editor");
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* Header Section */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Discover & Create Skills
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Learn from expert-created skill paths or create your own interactive learning experiences
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center gap-4 mb-8"
          >
            <motion.button
              onClick={handleCreateSkill}
              className="flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors duration-200 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="text-sm" />
              Create New Skill
            </motion.button>
            <motion.button
              className="flex items-center gap-3 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBookOpen className="text-sm" />
              My Learning
            </motion.button>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 items-center"
          >
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-200 cursor-pointer group"
                onClick={() => handleSkillSelect(skill)}
                whileHover={{ scale: 1.02 }}
              >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {skill.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {skill.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar className="text-xs" />
                    <span className="text-sm font-medium">{skill.rating}</span>
                  </div>
                </div>

                {/* Skill Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <FaUser className="text-xs" />
                    <span>{skill.creator}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock className="text-xs" />
                    <span>{skill.duration}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getDifficultyColor(skill.difficulty)}`}>
                    <FaGraduationCap className="text-xs" />
                    <span>{skill.difficulty}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {skill.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {skill.steps} steps • {skill.enrolled} enrolled
                  </div>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartLearning(skill.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaPlay className="text-xs" />
                    Start Learning
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredSkills.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FaLightbulb className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No skills found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or create a new skill to get started
              </p>
              <motion.button
                onClick={handleCreateSkill}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create First Skill
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-2xl border border-gray-700/50 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedSkill.title}</h2>
                  <p className="text-gray-400">{selectedSkill.description}</p>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Creator</div>
                  <div className="text-white font-medium">{selectedSkill.creator}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Duration</div>
                  <div className="text-white font-medium">{selectedSkill.duration}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Difficulty</div>
                  <div className={`font-medium ${getDifficultyColor(selectedSkill.difficulty)}`}>
                    {selectedSkill.difficulty}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Rating</div>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-sm" />
                    <span className="text-white font-medium">{selectedSkill.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">What you'll learn</h3>
                <div className="space-y-2">
                  {selectedSkill.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-300">
                      <FaChevronRight className="text-purple-500 text-xs" />
                      <span>Master {tag} concepts and practical applications</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => handleStartLearning(selectedSkill.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaPlay className="text-sm" />
                  Start Learning
                </motion.button>
                <motion.button
                  onClick={() => setSelectedSkill(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
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