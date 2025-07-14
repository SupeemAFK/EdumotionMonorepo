import Navbar from "../components/Navbar";
import TeacherFlowBuilder from "../components/TeacherFlowBuilder";

export default function TeacherPage() {
  return (
    <div className="w-screen h-screen">
        <Navbar />
        <div>
            <TeacherFlowBuilder />
        </div>
    </div>
  );
} 