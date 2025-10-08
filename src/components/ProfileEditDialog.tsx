import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tables } from '@/integrations/supabase/types';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>✏️ 編輯個人資料</DialogTitle>
        </DialogHeader>
        {fetching ? (
          <div className="py-8 text-center text-muted-foreground">載入中...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email（不可編輯）</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="avatarUrl">大頭貼圖片 URL（選填）</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                請提供圖片網址（建議尺寸：200x200 以上）
              </p>
            </div>

            <div>
              <Label htmlFor="displayName">暱稱（選填）</Label>
              <Input
                id="displayName"
                placeholder="請輸入暱稱"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground mt-1">
                2-20 字元 {displayName.length > 0 && `（已使用 ${displayName.length} 字元）`}
              </p>
            </div>

            <div>
              <Label htmlFor="bio">自我介紹（選填）</Label>
              <Textarea
                id="bio"
                placeholder="介紹你的資料包主題，讓領取者更了解你"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                最多 200 字元 {bio.length > 0 && `（已使用 ${bio.length} 字元）`}
              </p>
            </div>

            <div>
              <Label htmlFor="socialLink">社群平台連結（選填）</Label>
              <Input
                id="socialLink"
                type="url"
                placeholder="https://example.com/yourprofile"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                填寫後，資料包作者卡片將可點擊連至此連結
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gradient-magic"
              >
                {loading ? '儲存中...' : '儲存'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}