import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { BookOpen } from "lucide-react";

const Layout1 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-0 shadow-elegant rounded-2xl overflow-hidden animate-fade-in">
        {/* Left: Brand Image */}
        <div className="relative bg-gradient-primary min-h-[400px] lg:min-h-[600px] flex items-center justify-center p-12">
          <div className="text-center text-white animate-scale-in">
            <BookOpen className="w-24 h-24 mx-auto mb-6 animate-glow-pulse" />
            <h2 className="text-4xl font-bold mb-4">Master Your Craft</h2>
            <p className="text-xl opacity-90">Join 10,000+ professionals</p>
          </div>
        </div>

        {/* Right: Content & Form */}
        <div className="bg-card p-12 flex flex-col justify-center">
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">Get Our How-To Guide</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Unlock proven strategies and expert insights. Download your free guide today.
              </p>
            </div>
            
            <EmailForm variant="default" />
            
            <PrivacyNotice />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout1;
