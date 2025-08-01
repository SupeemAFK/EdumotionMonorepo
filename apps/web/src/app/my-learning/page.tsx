'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Tag, BarChart3, Edit, Trash2, Eye, Users, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Type definition for learning content
type LearningContent = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
};

export default function MyLearningPage() {
  const queryClient = useQueryClient();
  
  const { data: learningList = [], isLoading } = useQuery({ 
    queryKey: ['learning'], 
    queryFn: async () => {
      const res = await api.get('/learning')
      return res.data as LearningContent[]
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (learningId: string) => {
      const response = await api.delete(`/learning/${learningId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the learning list
      queryClient.invalidateQueries({ queryKey: ['learning'] });
    },
    onError: (error: any) => {
      console.error('Delete failed:', error);
      alert('Failed to delete learning course. Please try again.');
    }
  });

  const [selectedLearning, setSelectedLearning] = useState<string | null>(null);

  // Template function to handle editing learning course
  const handleEdit = (learningId: string) => {
    // TODO: Implement your edit logic here
    console.log('Edit learning course with ID:', learningId);
    
    // You could navigate to an edit page:
    // router.push(`/edit-learning/${learningId}`);
    
    // Or open a modal for editing
    setSelectedLearning(learningId);
  };

  // Handle deleting learning course
  const handleDelete = async (learningId: string) => {
    if (!confirm('Are you sure you want to delete this learning course? This will permanently delete the course and all associated graph data (nodes and edges).')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(learningId);
      alert('Learning course deleted successfully!');
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

// Template function to handle viewing course analytics
const handleViewAnalytics = (learningId: string) => {
  // TODO: Implement your analytics view logic here
  console.log('View analytics for learning course with ID:', learningId);
  
  // You could navigate to an analytics page:
  // router.push(`/learning-analytics/${learningId}`);
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner': return 'text-green-600 bg-green-100';
    case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
    case 'Advanced': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading your learning courses...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-24 px-4">
      <Navbar />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
            My Learning Courses
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Manage and track your created learning courses
          </p>
          
          {/* Create New Button */}
          <Link href="/create-learning">
            <button className="edu-button-primary flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              Create New Course
            </button>
          </Link>
        </div>

        {/* Learning Content Grid */}
        {learningList.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Learning Courses Yet</h3>
            <p className="text-gray-500 mb-6">Start creating your first learning course!</p>
            <Link href="/create-learning">
              <button className="edu-button-primary flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Course
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningList.map((learning) => (
              <div key={learning.id} className="edu-card p-6 animate-slide-in-up">
                {/* Header with Stats */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`edu-badge ${getLevelColor(learning.level)} text-xs px-2 py-1`}>
                      {learning.level}
                    </span>
                    {learning.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{learning.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {learning.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {learning.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {learning.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="edu-badge edu-badge-primary text-xs px-2 py-1">
                      {tag}
                    </span>
                  ))}
                  {learning.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{learning.tags.length - 3} more</span>
                  )}
                </div>

                {/* Time and Date */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{learning.estimatedTime} min</span>
                  </div>
                  <span>Updated {new Date(learning.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Link href={`/teacher/${learning.id}/graph`} className="flex-1">
                      <button className="w-full edu-button-primary py-2 text-sm flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </Link>
                    <button
                      onClick={() => handleEdit(learning.id)}
                      className="flex-1 edu-button-secondary py-2 text-sm flex items-center justify-center gap-2 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewAnalytics(learning.id)}
                      className="flex-1 edu-button-secondary py-2 text-sm flex items-center justify-center gap-2 hover:bg-green-50"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </button>
                    <button
                      onClick={() => handleDelete(learning.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {learningList.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="edu-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {learningList.length}
              </div>
              <div className="text-sm text-gray-600">Total Content</div>
            </div>
            <div className="edu-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round(learningList.reduce((sum, item) => sum + (item.rating || 0), 0) / learningList.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="edu-card p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {learningList.reduce((sum, item) => sum + item.estimatedTime, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Minutes</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 