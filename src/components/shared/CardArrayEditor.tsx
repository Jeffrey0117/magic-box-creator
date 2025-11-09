import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconSelector } from "./IconSelector";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { FeatureCard } from "@/types/template-config";

interface CardArrayEditorProps {
  cards: FeatureCard[];
  onChange: (cards: FeatureCard[]) => void;
  minCards?: number;
  maxCards?: number;
  title?: string;
}

export const CardArrayEditor = ({
  cards,
  onChange,
  minCards = 3,
  maxCards = 5,
  title = "特色卡片"
}: CardArrayEditorProps) => {

  const addCard = () => {
    if (cards.length >= maxCards) return;

    onChange([
      ...cards,
      {
        icon: "Star",
        title: "新卡片標題",
        description: "新卡片描述"
      }
    ]);
  };

  const removeCard = (index: number) => {
    if (cards.length <= minCards) return;
    onChange(cards.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: keyof FeatureCard, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Label className="text-base text-gray-100">{title}</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {cards.length} / {maxCards} 張卡片
          </span>
          <Button
            type="button"
            onClick={addCard}
            disabled={cards.length >= maxCards}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增卡片
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="p-5 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4"
          >
            {/* 卡片標題與刪除按鈕 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-300">
                  卡片 {index + 1}
                </span>
              </div>
              <Button
                type="button"
                onClick={() => removeCard(index)}
                disabled={cards.length <= minCards}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* 圖示選擇器 */}
            <IconSelector
              value={card.icon}
              onChange={(icon) => updateCard(index, "icon", icon)}
              label="圖示"
            />

            {/* 標題輸入 */}
            <div className="space-y-2">
              <Label className="text-gray-200">標題</Label>
              <Input
                value={card.title}
                onChange={(e) => updateCard(index, "title", e.target.value)}
                placeholder="輸入卡片標題"
                className="bg-gray-900 border-gray-700"
              />
            </div>

            {/* 描述輸入 */}
            <div className="space-y-2">
              <Label className="text-gray-200">描述</Label>
              <Textarea
                value={card.description}
                onChange={(e) => updateCard(index, "description", e.target.value)}
                placeholder="輸入卡片描述"
                rows={2}
                className="bg-gray-900 border-gray-700 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {cards.length < maxCards && (
        <div className="text-center pt-2">
          <Button
            type="button"
            onClick={addCard}
            variant="outline"
            className="border-gray-700 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            再新增一張卡片
          </Button>
        </div>
      )}
    </div>
  );
};
