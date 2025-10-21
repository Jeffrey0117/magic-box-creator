import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Rocket } from "lucide-react";

const Layout3 = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full animate-scale-in">
        <div className="bg-card rounded-3xl shadow-glow p-10 space-y-8 border border-border">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 animate-glow-pulse">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Get Our Guide</h1>
            <p className="text-muted-foreground">
              Exclusive insights for ambitious creators
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <EmailForm variant="default" />
            <PrivacyNotice className="justify-center text-center" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout3;
