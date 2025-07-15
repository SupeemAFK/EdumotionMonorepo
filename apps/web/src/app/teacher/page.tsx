import Navbar from "../components/Navbar";
import TeacherFlowBuilder from "../components/TeacherFlowBuilder";

export default function TeacherPage() {
  return (
    <div className="w-screen h-screen bg-gray-950 relative">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[size:24px_24px] opacity-20"></div>
      
      {/* Subtle accent glow - only for special emphasis */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <Navbar />
      <div className="relative z-10 pt-16 h-full overflow-hidden">
        <TeacherFlowBuilder />
      </div>
    </div>
  );
} 