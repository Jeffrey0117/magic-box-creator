import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";

interface BoxUnlockFormProps {
  boxData: {
    required_fields: { nickname?: boolean } | null;
  };
  keyword: string;
  setKeyword: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  extraData: { nickname: string };
  setExtraData: (v: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  variant?: 'default' | 'minimal';
  isCreatorPreview?: boolean;
}

export const BoxUnlockForm = ({
  boxData,
  keyword,
  setKeyword,
  email,
  setEmail,
  extraData,
  setExtraData,
  onSubmit,
  loading,
  variant = 'default',
  isCreatorPreview = false
}: BoxUnlockFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* 關鍵字欄位 */}
      <div>
        <Label htmlFor="keyword" className="text-sm font-medium mb-2 block">
          關鍵字
        </Label>
        <Input
          id="keyword"
          placeholder="輸入關鍵字..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          required
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 請向創作者索取關鍵字（不分大小寫）
        </p>
      </div>

      {/* Nickname 欄位 (如果需要) */}
      {boxData?.required_fields && (boxData.required_fields as any).nickname && (
        <div>
          <Label htmlFor="nickname" className="text-sm font-medium mb-2 block">
            稱呼 / 暱稱
          </Label>
          <Input
            id="nickname"
            placeholder="請輸入您的稱呼"
            value={extraData.nickname}
            onChange={(e) => setExtraData({ nickname: e.target.value })}
            required
            className="w-full"
          />
        </div>
      )}

      {/* Email 欄位 */}
      <div>
        <Label htmlFor="email" className="text-sm font-medium mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">
          🔒 僅創作者可見
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || isCreatorPreview}
        className={
          variant === 'minimal'
            ? "w-full"
            : "w-full gradient-magic hover:opacity-90 transition-opacity font-medium gap-2"
        }
        title={isCreatorPreview ? "創作者無法領取自己的資料包" : ""}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            解鎖中...
          </div>
        ) : isCreatorPreview ? (
          <>
            <Key className="w-5 h-5" />
            創作者無法領取
          </>
        ) : (
          <>
            <Key className="w-5 h-5" />
            立即解鎖 🔓
          </>
        )}
      </Button>
    </form>
  );
};