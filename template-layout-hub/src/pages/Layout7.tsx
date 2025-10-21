import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Menu, Star, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout7 = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border px-6 py-4 animate-fade-in">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">BrandName</span>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Section 1: Introduction */}
        <div className="bg-card rounded-2xl p-8 shadow-card animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-4">Transform Your Business</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Discover the strategies that helped over 10,000 businesses scale their operations and increase revenue.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Community</h4>
                <p className="text-sm text-muted-foreground">Join 10K+ members</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Growth</h4>
                <p className="text-sm text-muted-foreground">Average 300% ROI</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Proven</h4>
                <p className="text-sm text-muted-foreground">5-star rated guide</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Form Section */}
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-white shadow-elegant animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-3xl font-bold mb-3">Get the Guide</h2>
          <p className="text-lg opacity-90 mb-8">
            Enter your email to receive your free comprehensive business growth guide
          </p>
          <div className="space-y-4">
            <EmailForm variant="default" />
            <PrivacyNotice className="text-white/80" />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 pb-4 animate-fade-in">
          <p>© 2024 BrandName. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout7;
