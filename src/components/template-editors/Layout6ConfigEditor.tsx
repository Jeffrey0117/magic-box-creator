import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Layout6Config, StatCard } from "@/types/template-config";
import { DEFAULT_LAYOUT6_CONFIG } from "@/types/template-config";

interface Layout6ConfigEditorProps {
  value: Layout6Config;
  onChange: (config: Layout6Config) => void;
}

export const Layout6ConfigEditor = ({ value, onChange }: Layout6ConfigEditorProps) => {
  // 確保有預設值
  const config = value || DEFAULT_LAYOUT6_CONFIG;

  const addStat = () => {
    if (config.stats.length >= 4) return;
    onChange({
      stats: [
        ...config.stats,
        { value: "100%", label: "新數據", color: "blue" }
      ]
    });
  };

  const removeStat = (index: number) => {
    if (config.stats.length <= 2) return;
    onChange({
      stats: config.stats.filter((_, i) => i !== index)
    });
  };

  const updateStat = (index: number, field: keyof StatCard, val: string) => {
    const updated = [...config.stats];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ stats: updated });
  };

  const colorOptions: Array<StatCard['color']> = ['orange', 'blue', 'green', 'purple', 'red', 'yellow'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          數據展示卡片
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {config.stats.length} / 4 張卡片
          </span>
          <Button
            type="button"
            onClick={addStat}
            disabled={config.stats.length >= 4}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增數據
          </Button>
        </div>
      </div>

      <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
        {config.stats.map((stat, index) => (
          <div
            key={index}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">數據 {index + 1}</span>
              <Button
                type="button"
                onClick={() => removeStat(index)}
                disabled={config.stats.length <= 2}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-200">數值</Label>
                <Input
                  value={stat.value}
                  onChange={(e) => updateStat(index, "value", e.target.value)}
                  placeholder="10K+"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">標籤</Label>
                <Input
                  value={stat.label}
                  onChange={(e) => updateStat(index, "label", e.target.value)}
                  placeholder="活躍用戶"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-200">顏色</Label>
                <Select
                  value={stat.color}
                  onValueChange={(val) => updateStat(index, "color", val)}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color!}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                          {color}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {config.stats.length < 4 && (
        <div className="text-center pt-2">
          <Button
            type="button"
            onClick={addStat}
            variant="outline"
            className="border-gray-700 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            再新增一個數據
          </Button>
        </div>
      )}
    </div>
  );
};
