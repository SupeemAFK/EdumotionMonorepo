import Navbar from "../../components/Navbar";
import SkillLearningFlow from "../../components/SkillLearningFlow";

interface SkillLearningPageProps {
  params: {
    skillId: string;
  };
}

export default async function SkillLearningPage({ params }: SkillLearningPageProps) {
  const { skillId } = await params;
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
        <SkillLearningFlow skillId={skillId} />
      </div>
    </div>
  );
} 