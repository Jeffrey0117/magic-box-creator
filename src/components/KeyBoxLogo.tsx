import { KeyRound } from "lucide-react";

interface KeyBoxLogoProps {
  size?: "sm" | "md";
  className?: string;
}

// KeyBox 品牌 logo：漸層圓角方塊 + 斜置鑰匙 + 雙色字標
export const KeyBoxLogo = ({ size = "md", className = "" }: KeyBoxLogoProps) => {
  const isMd = size === "md";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${
          isMd ? "w-9 h-9 rounded-xl" : "w-7 h-7 rounded-lg"
        } relative bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0`}
      >
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent" />
        <KeyRound
          className={`${isMd ? "w-5 h-5" : "w-4 h-4"} relative text-white -rotate-45`}
          strokeWidth={2.5}
        />
      </div>
      <span
        className={`${
          isMd ? "text-2xl" : "text-lg"
        } font-extrabold tracking-tight leading-none`}
      >
        <span className="text-emerald-600">Key</span>
        <span className="text-slate-800">Box</span>
      </span>
    </div>
  );
};

export default KeyBoxLogo;
