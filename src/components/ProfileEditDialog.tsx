import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tables } from '@/integrations/supabase/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

type UserProfile = Tables<'user_profiles'>;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
}

export function ProfileEditDialog({ open, onOpenChange, userId, userEmail }: ProfileEditDialogProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open, userId]);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const emailPrefix = userEmail.split('@')[0];
          setDisplayName(emailPrefix);
          setBio('');
        } else {
          throw error;
        }
      } else {
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
        setSocialLink(data.social_link || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('載入個人資料失敗');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (displayName.length < 2 || displayName.length > 20) {
      toast.error('暱稱需要 2-20 字元');
      return;
    }

    if (bio && bio.length > 200) {
      toast.error('自我介紹最多 200 字元');
      return;
    }

    if (socialLink && socialLink.length > 200) {
      toast.error('社群連結最多 200 字元');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          display_name: displayName,
          bio: bio || null,
          avatar_url: avatarUrl || null,
          social_link: socialLink || null,
        });

      if (error) throw error;

      toast.success('個人資料已更新！');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 計算字數計數器的色彩狀態
  const getCharCountColor = (length: number, max: number) => {
    if (length === 0) return 'text-gray-400';
    const percentage = length / max;
    if (percentage >= 1) return 'text-red-500';
    if (percentage >= 0.8) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] p-6 sm:p-10 bg-gray-900 border-gray-800 shadow-2xl rounded-2xl flex flex-col [&_.overflow-y-auto]:scrollbar-thin [&_.overflow-y-auto]:scrollbar-thumb-gray-700 [&_.overflow-y-auto]:scrollbar-track-gray-900 [&_.overflow-y-auto]:hover:scrollbar-thumb-gray-600">
        <DialogHeader className="mb-8 flex-shrink-0">
          <DialogTitle className="text-[28px] font-semibold text-white">✏️ 編輯個人資料</DialogTitle>
        </DialogHeader>
        {fetching ? (
          <div className="py-8 text-center text-gray-400">載入中...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 overflow-y-auto flex-1 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #111827' }}>
            {/* 基本資訊區塊 */}
            <div className="pb-8 border-b border-gray-800">
              <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
                📋 基本資訊
              </div>

              {/* Email - 不可編輯 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                  <Label htmlFor="email" className="text-[15px] font-medium text-gray-200">Email</Label>
                  <span className="text-sm">🔒</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                    不可編輯
                  </span>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-gray-800/70 border-transparent text-gray-400 cursor-not-allowed opacity-70"
                />
              </div>

              {/* 頭像上傳區 - 優化版 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                  <Label htmlFor="avatarUrl" className="text-[15px] font-medium text-gray-200">大頭貼圖片</Label>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                    選填
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  建議使用 duk.tw 圖鴨上傳
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl p-6">
                  {/* 頭像預覽與說明 */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-20 h-20 rounded-full border-3 border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="預覽" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-gray-500">👤</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-gray-200 mb-1">當前頭像</div>
                      <div className="text-[13px] text-gray-400 leading-relaxed">
                        建議尺寸 200×200 以上
                      </div>
                    </div>
                  </div>

                  {/* URL 輸入區 */}
                  <div className="mb-5">
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="貼上圖片連結"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 transition-all duration-300"
                    />
                    {avatarUrl && (
                      <div className="flex items-center gap-1.5 mt-2 text-[13px] text-green-500">
                        <span>✓</span>
                        <span>圖片連結有效</span>
                      </div>
                    )}
                  </div>

                  {/* 上傳引導 - 精簡版 */}
                  <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg p-4 mb-4">
                    <div className="text-[13px] text-blue-100 leading-relaxed mb-3">
                      📸 沒有圖片連結？
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <span className="text-lg mr-2">🚀</span>
                          前往上傳圖片
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>是否前往圖鴨上傳？</AlertDialogTitle>
                          <AlertDialogDescription>
                            我們會在新分頁開啟 duk.tw。請完成上傳後，複製圖片連結並貼回「大頭貼圖片」欄位。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => window.open('https://duk.tw/u', '_blank')}>
                            前往圖鴨
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                </div>
              </div>

              {/* 暱稱 */}
              <div className="px-[10px]">
                <div className="flex items-center gap-2 mb-2.5">
                  <Label htmlFor="displayName" className="text-[15px] font-medium text-gray-200">暱稱</Label>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                    選填
                  </span>
                </div>
                <Input
                  id="displayName"
                  placeholder="請輸入暱稱"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={20}
                  className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 transition-all duration-300"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[13px] text-gray-400">建議使用真實姓名或常用暱稱</span>
                  <span className={`text-[13px] font-medium ${getCharCountColor(displayName.length, 20)}`}>
                    {displayName.length} / 20
                  </span>
                </div>
              </div>
            </div>

            {/* 個人簡介區塊 */}
            <div className="pb-8 border-b border-gray-800">
              <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
                📝 個人簡介
              </div>

              <div className="px-[10px]">
                <div className="flex items-center gap-2 mb-2.5">
                  <Label htmlFor="bio" className="text-[15px] font-medium text-gray-200">自我介紹</Label>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                    選填
                  </span>
                </div>
                <Textarea
                  id="bio"
                  placeholder="分享一些關於你的資訊..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  className="min-h-[100px] bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 resize-y leading-relaxed transition-all duration-300"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[13px] text-gray-400">讓其他人更認識你</span>
                  <span className={`text-[13px] font-medium ${getCharCountColor(bio.length, 200)}`}>
                    {bio.length} / 200
                  </span>
                </div>
              </div>
            </div>

            {/* 社群平台區塊 */}
            <div className="pb-8">
              <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-5">
                🔗 社群平台
              </div>

              <div className="px-[10px]">
                <div className="flex items-center gap-2 mb-2.5">
                  <Label htmlFor="socialLink" className="text-[15px] font-medium text-gray-200">社群平台連結</Label>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                    選填
                  </span>
                </div>
                <Input
                  id="socialLink"
                  type="url"
                  placeholder="例如：https://facebook.com/yourname"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  maxLength={200}
                  className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 transition-all duration-300"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[13px] text-gray-400">填寫你的社群媒體頁面連結</span>
                </div>
                {socialLink && (
                  <div className="flex items-center gap-1.5 mt-2 text-[13px] text-green-500">
                    <span>✓</span>
                    <span>連結格式正確</span>
                  </div>
                )}
              </div>
            </div>

            {/* 按鈕組 */}
            <div className="flex gap-3 pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-transparent border-2 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200 hover:bg-gray-800 rounded-lg py-3.5 font-semibold transition-all duration-300"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg py-3.5 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="mr-2">💾</span>
                {loading ? '儲存中...' : '儲存變更'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}