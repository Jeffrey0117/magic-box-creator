import { Shield } from "lucide-react";

export const PrivacyNotice = ({ className = "" }: { className?: string }) => {
  return (
    <p className={`text-sm text-muted-foreground flex items-center gap-2 ${className}`}>
      <Shield className="w-4 h-4" />
      We respect your privacy. Unsubscribe at any time.
    </p>
  );
};
