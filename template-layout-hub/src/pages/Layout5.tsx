import { EmailForm } from "@/components/EmailForm";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { Lightbulb, Target, Zap } from "lucide-react";

const Layout5 = () => {
  const cards = [
    { icon: Lightbulb, title: "Smart Strategies", desc: "Learn proven techniques" },
    { icon: Target, title: "Clear Goals", desc: "Achieve your vision" },
    { icon: Zap, title: "Fast Results", desc: "See immediate impact" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
        {/* Gallery Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="bg-gradient-primary w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 bg-card p-10 rounded-2xl shadow-elegant">
          <h2 className="text-3xl font-bold">Get Our Full Guide</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master these skills and more
          </p>
          
          <div className="max-w-xl mx-auto space-y-4">
            <EmailForm variant="hero" />
            <PrivacyNotice className="justify-center" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout5;
