import Navbar from "../../components/Navbar";
import SkillLearningFlow from "../../components/SkillLearningFlow";

interface SkillLearningPageProps {
  params: {
    skillId: string;
  };
}

export default function SkillLearningPage({ params }: SkillLearningPageProps) {
  return (
    <div className="w-screen h-screen bg-gray-950 relative overflow-hidden">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.1)_1px,_transparent_0)] bg-[size:32px_32px] opacity-30"></div>
      
      {/* Subtle accent glow */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-green-500/3 rounded-full blur-3xl"></div>
      
      <Navbar />
      <div className="relative z-10 pt-16 h-full overflow-hidden">
        <SkillLearningFlow skillId={params.skillId} />
      </div>
    </div>
  );
} 