import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { ChevronDown, Play } from "lucide-react";

const Layout8 = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video/Motion Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        {/* Animated overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl space-y-8 animate-fade-in">
          {/* Video Play Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/40 mb-6 animate-glow-pulse hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight animate-scale-in">
            Get Inspired
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Transform your creative vision into reality with our comprehensive guide
          </p>

          {/* Form */}
          <div className="max-w-md mx-auto space-y-4 pt-6">
            <EmailForm 
              variant="glass" 
              buttonText="Send me the guide"
            />
            <PrivacyNotice className="justify-center text-white/80" />
          </div>

          {/* Scroll indicator */}
          <div className="pt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60 mx-auto" />
            <p className="text-white/60 text-sm mt-2">Scroll for more</p>
          </div>
        </div>
      </div>

      {/* Additional content section */}
      <div className="relative z-10 bg-background py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">What You'll Learn</h2>
          <div className="grid md:grid-cols-3 gap-8 pt-8">
            {[
              { title: "Vision", desc: "Clarify your creative goals" },
              { title: "Strategy", desc: "Build actionable plans" },
              { title: "Execution", desc: "Bring ideas to life" }
            ].map((item, idx) => (
              <div key={idx} className="p-6">
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout8;
