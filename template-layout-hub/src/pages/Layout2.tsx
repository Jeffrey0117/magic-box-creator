import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Sparkles } from "lucide-react";

const Layout2 = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-primary min-h-[60vh] flex items-center justify-center text-center px-6 animate-fade-in">
        <div className="max-w-3xl text-white space-y-6 animate-scale-in">
          <Sparkles className="w-16 h-16 mx-auto mb-4 animate-glow-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold">Get Our Free Guide</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Transform your skills with expert knowledge delivered straight to your inbox
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto -mt-16 px-6 pb-20 animate-fade-in-up">
        <div className="bg-card p-8 md:p-12 rounded-2xl shadow-elegant space-y-6">
          <EmailForm variant="hero" buttonText="Send me the guide" />
          <PrivacyNotice className="justify-center" />
        </div>
      </div>
    </div>
  );
};

export default Layout2;
