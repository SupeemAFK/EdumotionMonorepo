'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Clock, Tag, BarChart3, FileText, Plus, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/api';

const CreateLearningSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  tags: z.array(z.string()).min(1, "At least one tag is required").max(10, "Maximum 10 tags allowed"),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    required_error: "Please select a level",
  }),
  estimatedTime: z.number().min(1, "Estimated time must be at least 1 minute").max(600, "Estimated time must be less than 600 minutes"),
});

type CreateLearningSchemaType = z.infer<typeof CreateLearningSchema>;

interface CreateLearningDto { 
  title: string;
  description: string;
  tags: string[];
  level: string;
  rating: number;
  estimatedTime: number;
  creatorId: string;
}

export default function CreateLearningPage() {
  const { mutate } = useMutation({
    mutationFn: async (body: CreateLearningDto) => {
      const res = await api.post('/learning', body)
      return res
    }
  })
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateLearningSchemaType>({
    resolver: zodResolver(CreateLearningSchema),
    defaultValues: {
      tags: [],
    },
  });

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      const newTags = [...tags, currentTag.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Template function for handling form submission - implement your logic here
  const onSubmit: SubmitHandler<CreateLearningSchemaType> = async (formData) => {
    if (!session?.user.id) return;

    setIsSubmitting(true);    

    try {
      console.log('Form data to submit:', formData);
      mutate({
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        level: formData.level,
        rating: 0,
        estimatedTime: formData.estimatedTime,
        creatorId: session.user.id,
      })
      reset();
      setTags([]);
    } 
    catch (error) {
      console.error('Error creating learning:', error);
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-24 px-4">
      <Navbar />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-poppins">
            Create Learning Course
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Share your knowledge and create engaging learning courses
          </p>
        </div>

        {/* Form Card */}
        <div className="edu-card p-8 animate-slide-in-up">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Course Title
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className="edu-input w-full px-4 py-4"
                placeholder="Enter course title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Course Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={4}
                className="edu-input w-full px-4 py-4 resize-none"
                placeholder="Describe what learners will gain from this course"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Tags Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="edu-input flex-1 px-4 py-3"
                  placeholder="Add a tag and press Enter"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="edu-button-primary px-4 py-3 flex items-center gap-2"
                  disabled={!currentTag.trim() || tags.length >= 10}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="edu-badge edu-badge-primary flex items-center gap-2 px-3 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {errors.tags && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.tags.message}
                </p>
              )}
            </div>

            {/* Level Field */}
            <div className="space-y-2">
              <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Difficulty Level
              </label>
              <select
                {...register('level')}
                id="level"
                className="edu-input w-full px-4 py-4"
              >
                <option value="">Select difficulty level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.level && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.level.message}
                </p>
              )}
            </div>

            {/* Estimated Time Field */}
            <div className="space-y-2">
              <label htmlFor="estimatedTime" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated Time (minutes)
              </label>
              <input
                {...register('estimatedTime', { valueAsNumber: true })}
                type="number"
                id="estimatedTime"
                min="1"
                max="600"
                className="edu-input w-full px-4 py-4"
                placeholder="Enter estimated time in minutes"
              />
              {errors.estimatedTime && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.estimatedTime.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="edu-button-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Create Learning Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 