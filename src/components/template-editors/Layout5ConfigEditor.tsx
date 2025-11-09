import { CardArrayEditor } from "../shared/CardArrayEditor";
import type { Layout5Config } from "@/types/template-config";
import { DEFAULT_LAYOUT5_CONFIG } from "@/types/template-config";

interface Layout5ConfigEditorProps {
  value: Layout5Config;
  onChange: (config: Layout5Config) => void;
}

export const Layout5ConfigEditor = ({ value, onChange }: Layout5ConfigEditorProps) => {
  // 確保有預設值
  const config = value || DEFAULT_LAYOUT5_CONFIG;

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
        特色網格卡片
      </h4>
      <div className="pl-4 border-l-2 border-green-500/30">
        <CardArrayEditor
          cards={config.features}
          onChange={(features) => onChange({ features })}
          minCards={3}
          maxCards={5}
          title="特色項目"
        />
      </div>
    </div>
  );
};
