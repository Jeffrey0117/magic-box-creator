import { useState } from "react";
import { AVAILABLE_ICONS } from "@/types/template-config";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Target,
  Zap,
  Star,
  Users,
  TrendingUp,
  Heart,
  Award,
  Shield,
  Rocket,
  Gift,
  Trophy,
  Sparkles,
  Crown,
  Flame,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Clock,
  LucideIcon
} from "lucide-react";

// 圖示映射表
const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  Target,
  Zap,
  Star,
  Users,
  TrendingUp,
  Heart,
  Award,
  Shield,
  Rocket,
  Gift,
  Trophy,
  Sparkles,
  Crown,
  Flame,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Clock,
};

interface IconSelectorProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

export const IconSelector = ({ value, onChange, label = "選擇圖示" }: IconSelectorProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const IconComponent = iconMap[value] || Star;

  return (
    <div className="space-y-3">
      <Label className="text-gray-200">{label}</Label>

      <div className="flex items-center gap-3">
        {/* 當前選中的圖示 */}
        <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
          <IconComponent className="w-7 h-7 text-green-400" />
        </div>

        {/* 切換選擇器按鈕 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(!showPicker)}
          className="border-gray-700"
        >
          {showPicker ? "關閉選擇器" : "更換圖示"}
        </Button>

        <span className="text-sm text-gray-400">{value}</span>
      </div>

      {/* 圖示網格選擇器 */}
      {showPicker && (
        <div className="grid grid-cols-6 gap-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          {AVAILABLE_ICONS.map((iconName) => {
            const Icon = iconMap[iconName];
            const isSelected = value === iconName;

            return (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onChange(iconName);
                  setShowPicker(false);
                }}
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  transition-all duration-200
                  ${isSelected
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-600'
                  }
                `}
                title={iconName}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-green-400' : 'text-gray-300'}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
