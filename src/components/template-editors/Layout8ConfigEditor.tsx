import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { Layout8Config, LearningPoint } from "@/types/template-config";
import { DEFAULT_LAYOUT8_CONFIG } from "@/types/template-config";

interface Layout8ConfigEditorProps {
  value: Layout8Config;
  onChange: (config: Layout8Config) => void;
}

export const Layout8ConfigEditor = ({ value, onChange }: Layout8ConfigEditorProps) => {
  // 確保有預設值
  const config = value || DEFAULT_LAYOUT8_CONFIG;

  const addLearningPoint = () => {
    if (config.learning_points.length >= 5) return;
    onChange({
      learning_points: [
        ...config.learning_points,
        { title: "新要點", description: "描述內容" }
      ]
    });
  };

  const removeLearningPoint = (index: number) => {
    if (config.learning_points.length <= 3) return;
    onChange({
      learning_points: config.learning_points.filter((_, i) => i !== index)
    });
  };

  const updateLearningPoint = (index: number, field: keyof LearningPoint, val: string) => {
    const updated = [...config.learning_points];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ learning_points: updated });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          學習要點
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {config.learning_points.length} / 5 個要點
          </span>
          <Button
            type="button"
            onClick={addLearningPoint}
            disabled={config.learning_points.length >= 5}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增要點
          </Button>
        </div>
      </div>

      <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
        {config.learning_points.map((point, index) => (
          <div
            key={index}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">要點 {index + 1}</span>
              <Button
                type="button"
                onClick={() => removeLearningPoint(index)}
                disabled={config.learning_points.length <= 3}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">標題</Label>
              <Input
                value={point.title}
                onChange={(e) => updateLearningPoint(index, "title", e.target.value)}
                placeholder="要點標題"
                className="bg-gray-900 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200">描述</Label>
              <Textarea
                value={point.description}
                onChange={(e) => updateLearningPoint(index, "description", e.target.value)}
                placeholder="要點描述"
                rows={2}
                className="bg-gray-900 border-gray-700 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {config.learning_points.length < 5 && (
        <div className="text-center pt-2">
          <Button
            type="button"
            onClick={addLearningPoint}
            variant="outline"
            className="border-gray-700 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            再新增一個要點
          </Button>
        </div>
      )}
    </div>
  );
};
