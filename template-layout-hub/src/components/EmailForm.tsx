import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EmailFormProps {
  variant?: "default" | "hero" | "glass";
  buttonText?: string;
  placeholder?: string;
}

export const EmailForm = ({ 
  variant = "default",
  buttonText = "Send me the guide",
  placeholder = "Enter your email"
}: EmailFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      toast.success("Guide sent! Check your inbox.");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  const variantClasses = {
    default: "flex flex-col sm:flex-row gap-3",
    hero: "flex flex-col sm:flex-row gap-3 w-full max-w-md",
    glass: "flex flex-col gap-3 backdrop-blur-sm bg-white/10 p-6 rounded-xl"
  };

  return (
    <form onSubmit={handleSubmit} className={variantClasses[variant]}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
        disabled={loading}
      />
      <Button 
        type="submit" 
        className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Sending..." : buttonText}
      </Button>
    </form>
  );
};
