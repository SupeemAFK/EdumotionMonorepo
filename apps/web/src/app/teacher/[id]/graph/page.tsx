"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import GraphCreationChoice from "@/app/components/GraphCreationChoice";
import { Loader2 } from "lucide-react";

interface GraphData {
  learning: {
    id: string;
    title: string;
    description: string;
    nodes: any[];
    edges: any[];
  };
  hasGraph: boolean;
  nodeCount: number;
  edgeCount: number;
}

export default function GraphPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showChoice, setShowChoice] = useState(false);

  const { data: graphData, isLoading, error } = useQuery<GraphData>({
    queryKey: ['learning-graph', params.id],
    queryFn: async () => {
      const response = await api.get(`/learning/${params.id}/graph`);
      return response.data;
    },
  });

  useEffect(() => {
    if (graphData && !isLoading) {
      if (graphData.hasGraph) {
        // Graph exists, redirect to teacher flow builder
        router.push(`/teacher/${params.id}`);
      } else {
        // No graph exists, show creation choices
        setShowChoice(true);
      }
    }
  }, [graphData, isLoading, router, params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Checking learning graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Learning Not Found</h2>
          <p className="text-gray-600 mb-4">The learning course you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/my-learning')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  if (showChoice && graphData) {
    return (
      <GraphCreationChoice
        learningId={params.id}
        learningTitle={graphData.learning.title}
        onClose={() => router.push('/my-learning')}
      />
    );
  }

  return null;
}