import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconSelector } from "../shared/IconSelector";
import { CardArrayEditor } from "../shared/CardArrayEditor";
import { Plus, Trash2 } from "lucide-react";
import type { Layout7Config, LearningPoint, SocialLink } from "@/types/template-config";
import { DEFAULT_LAYOUT7_CONFIG } from "@/types/template-config";

interface Layout7ConfigEditorProps {
  value: Layout7Config;
  onChange: (config: Layout7Config) => void;
}

export const Layout7ConfigEditor = ({ value, onChange }: Layout7ConfigEditorProps) => {
  // 確保有預設值
  const config = value || DEFAULT_LAYOUT7_CONFIG;

  // 品牌設定更新
  const updateBrand = (field: "logo_icon" | "name", val: string) => {
    onChange({
      ...config,
      brand: { ...config.brand, [field]: val }
    });
  };

  // 學習要點更新
  const updateLearningPoints = (points: LearningPoint[]) => {
    onChange({ ...config, learning_points: points });
  };

  const addLearningPoint = () => {
    if (config.learning_points.length >= 5) return;
    updateLearningPoints([
      ...config.learning_points,
      { title: "新要點", description: "描述內容" }
    ]);
  };

  const removeLearningPoint = (index: number) => {
    if (config.learning_points.length <= 3) return;
    updateLearningPoints(config.learning_points.filter((_, i) => i !== index));
  };

  const updateLearningPoint = (index: number, field: keyof LearningPoint, val: string) => {
    const updated = [...config.learning_points];
    updated[index] = { ...updated[index], [field]: val };
    updateLearningPoints(updated);
  };

  // 社群連結更新
  const updateSocialLinks = (links: SocialLink[]) => {
    onChange({ ...config, social_links: links });
  };

  const addSocialLink = () => {
    if (config.social_links.length >= 5) return;
    updateSocialLinks([
      ...config.social_links,
      { platform: "Twitter", url: "https://twitter.com" }
    ]);
  };

  const removeSocialLink = (index: number) => {
    if (config.social_links.length <= 1) return;
    updateSocialLinks(config.social_links.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, val: any) => {
    const updated = [...config.social_links];
    updated[index] = { ...updated[index], [field]: val };
    updateSocialLinks(updated);
  };

  return (
    <div className="space-y-10">
      {/* 1. 品牌設定 */}
      <div className="space-y-5">
        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          品牌設定
        </h4>
        <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
          <IconSelector
            value={config.brand.logo_icon}
            onChange={(icon) => updateBrand("logo_icon", icon)}
            label="品牌 Logo 圖示"
          />
          <div className="space-y-2">
            <Label className="text-gray-200">品牌名稱</Label>
            <Input
              value={config.brand.name}
              onChange={(e) => updateBrand("name", e.target.value)}
              placeholder="輸入品牌名稱"
              className="bg-gray-900 border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* 2. 特色卡片 */}
      <div className="space-y-5">
        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
          特色卡片
        </h4>
        <div className="pl-4 border-l-2 border-green-500/30">
          <CardArrayEditor
            cards={config.features}
            onChange={(features) => onChange({ ...config, features })}
            minCards={3}
            maxCards={6}
            title="特色項目"
          />
        </div>
      </div>

      {/* 3. 學習要點 */}
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
      </div>

      {/* 4. 社群連結 */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
            社群連結
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {config.social_links.length} / 5 個連結
            </span>
            <Button
              type="button"
              onClick={addSocialLink}
              disabled={config.social_links.length >= 5}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增連結
            </Button>
          </div>
        </div>

        <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
          {config.social_links.map((link, index) => (
            <div
              key={index}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">連結 {index + 1}</span>
                <Button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  disabled={config.social_links.length <= 1}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-gray-200">平台</Label>
                  <Select
                    value={link.platform}
                    onValueChange={(val) => updateSocialLink(index, "platform", val as SocialLink['platform'])}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="GitHub">GitHub</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">網址</Label>
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                    placeholder="https://..."
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
