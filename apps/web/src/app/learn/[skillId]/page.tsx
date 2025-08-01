'use client'

import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Navbar from "../../components/Navbar";
import SkillLearningFlow from "../../components/SkillLearningFlow";
import { useParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/api';

export default function SkillLearningPage() {
  const params = useParams<{ skillId: string; }>()
  const { data: session } = authClient.useSession();
  
  // Use the skillId from params (this is the learningId)
  const learningId = params.skillId;

  // Fetch learning data
  const { data: learningData, isLoading: isLoadingLearning } = useQuery({
    queryKey: ['learning', learningId],
    queryFn: async () => {
      const response = await api.get(`/learning/${learningId}/graph`);
      console.log('🎥 Learning data received:', response.data);
      
      // Log video data for each node
      if (response.data?.learning?.nodes) {
        response.data.learning.nodes.forEach((node: any, index: number) => {
          console.log(`🎬 Node ${index + 1} (${node.title}):`, {
            id: node.id,
            type: node.type,
            video: node.video,
            materials: node.materials,
            hasVideo: !!node.video,
            videoType: typeof node.video,
            videoLength: node.video?.length || 0
          });
        });
      }
      
      return response.data;
    },
    enabled: !!learningId,
  });

  // Create or update learn progress mutation
  const createProgressMutation = useMutation({
    mutationFn: async (data: { userId: string; learningId: string; currentNode: string }) => {
      const response = await api.post('/learnprogress/create-or-update', data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Learn progress created/updated successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to create/update learn progress:', error);
    },
  });

  // Create learn progress when user visits the page
  useEffect(() => {
    if (session?.user?.id && learningId && learningData?.learning?.nodes?.length > 0) {
      // Sort nodes by creation date to maintain order
      const sortedNodes = [...learningData.learning.nodes].sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // Find the first learning node (not start or end)
      const firstLearningNode = sortedNodes.find((node: any) => 
        node.type !== 'start' && node.type !== 'end'
      );
      
      if (firstLearningNode) {
        console.log('Creating learn progress for user:', session.user.id, 'learning:', learningId, 'node:', firstLearningNode.id);
        createProgressMutation.mutate({
          userId: session.user.id,
          learningId: learningId,
          currentNode: firstLearningNode.id,
        });
      }
    }
  }, [session?.user?.id, learningId, learningData]);

  if (isLoadingLearning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading learning content...</p>
        </div>
      </div>
    );
  }

  if (!learningData || !learningId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Learning content not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        {/* Floating educational elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-100 rounded-full opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-100 rounded-full opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-blue-100 rounded-full opacity-25 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-purple-100 rounded-full opacity-35 animate-blob"></div>
        
        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_rgba(59,130,246,0.15)_2px,_transparent_0)] bg-[size:32px_32px] opacity-60"></div>
        
        {/* Gradient overlays for depth */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-indigo-50/50 to-transparent"></div>
      </div>
      
      <Navbar />
      <div className="relative z-10 pt-16 h-screen overflow-hidden">
        <SkillLearningFlow skillId={learningId} learningData={learningData} />
      </div>
    </div>
  );
} 