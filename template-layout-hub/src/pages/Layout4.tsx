import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Trophy } from "lucide-react";

const Layout4 = () => {
  return (
    <div 
      className="min-h-screen relative flex items-center justify-center px-6 py-12"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95)), url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1920')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Semi-transparent Form Card */}
      <div className="max-w-lg w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-10 shadow-glow animate-scale-in">
        <div className="text-center text-white space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 animate-glow-pulse">
            <Trophy className="w-10 h-10" />
          </div>
          
          <h1 className="text-4xl font-bold">Get Our Guide</h1>
          <p className="text-lg opacity-90 mb-8">
            Discover strategies used by top performers worldwide
          </p>

          <div className="space-y-4">
            <EmailForm 
              variant="glass" 
              buttonText="Download Now"
            />
            <PrivacyNotice className="justify-center text-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout4;
