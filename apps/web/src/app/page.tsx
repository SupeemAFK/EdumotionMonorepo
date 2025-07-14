import Navbar from "./components/Navbar";
import SkillPage from "./components/SkillPage";

export default function Home() {
  return (
    <div className="font-poppins">
      <Navbar />
      <div>
        <SkillPage />
      </div>
    </div>
  );
}
