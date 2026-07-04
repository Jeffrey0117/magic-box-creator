-- Add template_config JSONB column to keywords table
-- This column stores template-specific configurations for advanced templates (Layout5-8)

ALTER TABLE keywords
ADD COLUMN IF NOT EXISTS template_config JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN keywords.template_config IS 'Template-specific configuration (features, stats, social links, etc.) for advanced templates';

-- Create index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_keywords_template_config ON keywords USING GIN (template_config);

-- Example configurations for each template type:
--
-- Layout5 (特色網格):
-- {
--   "layout5": {
--     "features": [
--       {"icon": "Lightbulb", "title": "智慧策略", "description": "學習經過驗證的技巧"},
--       {"icon": "Target", "title": "明確目標", "description": "實現你的願景"},
--       {"icon": "Zap", "title": "快速成果", "description": "看見立即影響"}
--     ]
--   }
-- }
--
-- Layout6 (對比分欄):
-- {
--   "layout6": {
--     "stats": [
--       {"value": "10K+", "label": "活躍用戶", "color": "orange"},
--       {"value": "95%", "label": "成功率", "color": "blue"}
--     ]
--   }
-- }
--
-- Layout7 (多段落長頁):
-- {
--   "layout7": {
--     "brand": {"logo_icon": "Star", "name": "KeyBox"},
--     "features": [
--       {"icon": "Users", "title": "社群導向", "description": "加入充滿活力的創作者社群"}
--     ],
--     "learning_points": [
--       {"title": "願景", "description": "釐清你的創意目標"}
--     ],
--     "social_links": [
--       {"platform": "Twitter", "url": "https://twitter.com"}
--     ]
--   }
-- }
--
-- Layout8 (視訊風格):
-- {
--   "layout8": {
--     "learning_points": [
--       {"title": "願景", "description": "釐清你的創意目標"}
--     ]
--   }
-- }
