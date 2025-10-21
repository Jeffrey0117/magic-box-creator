import { Button } from "@/components/ui/button";
import { Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnlockSuccessViewProps {
  result: string;
  onReset: () => void;
  isLoggedIn?: boolean;
}

export const UnlockSuccessView = ({ 
  result, 
  onReset, 
  isLoggedIn = false 
}: UnlockSuccessViewProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card glow">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
          <Unlock className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-accent mb-2">
          ✅ 解鎖成功！
        </h2>
        <p className="text-muted-foreground">這是您的專屬內容：</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 mb-6">
        <p className="text-lg break-all whitespace-pre-line">{result}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onReset}
          className="flex-1 gradient-magic"
        >
          重新查詢
        </Button>
        <Button
          onClick={() => navigate(isLoggedIn ? "/creator" : "/login")}
          variant="outline"
          className="flex-1"
        >
          {isLoggedIn ? "前往創作者面板 →" : "註冊 KeyBox 創建資料包 →"}
        </Button>
      </div>
    </div>
  );
};