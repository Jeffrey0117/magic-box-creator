import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Flame } from "lucide-react";

const Layout6 = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Dark Section */}
      <div className="bg-gradient-dark text-white p-12 lg:p-20 flex items-center justify-center animate-fade-in">
        <div className="max-w-lg space-y-6">
          <Flame className="w-16 h-16 text-accent animate-glow-pulse" />
          <h1 className="text-5xl font-bold leading-tight">
            Master Your Skills
          </h1>
          <p className="text-xl opacity-90">
            Join thousands of professionals who've transformed their careers with our proven methodology.
          </p>
          <div className="flex gap-8 pt-6">
            <div>
              <div className="text-4xl font-bold text-accent">10K+</div>
              <div className="text-sm opacity-80">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-glow">95%</div>
              <div className="text-sm opacity-80">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Light Form Section */}
      <div className="bg-background p-12 lg:p-20 flex items-center justify-center animate-fade-in-up">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-3">Get Started</h2>
            <p className="text-muted-foreground text-lg">
              Enter your email to receive your free comprehensive guide
            </p>
          </div>
          
          <div className="space-y-4">
            <EmailForm variant="default" />
            <PrivacyNotice />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout6;
