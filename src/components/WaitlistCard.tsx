import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface WaitlistCardProps {
  keyword: any;
  waitlistCount: number;
}

export function WaitlistCard({ keyword, waitlistCount }: WaitlistCardProps) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('請輸入有效的 Email');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('waitlist').insert({
        keyword_id: keyword.id,
        email: email.toLowerCase().trim(),
        reason: reason.trim() || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('您已加入過此資料包的候補名單');
        } else {
          throw error;
        }
        return;
      }

      setJoined(true);
      toast.success('已加入候補名單！');
    } catch (error) {
      console.error('Failed to join waitlist:', error);
      toast.error('加入候補失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (joined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>✅ 已加入候補名單！</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-sm mb-2">📧 通知 Email：{email}</p>
            <p className="text-sm mb-2">📊 目前排隊人數：{waitlistCount + 1} 人</p>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">💡 接下來：</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 創作者會看到候補需求</li>
              <li>• 若決定加開配額，會優先通知您</li>
              <li>• 請留意 Email 信箱</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            ⚠️
          </div>
          <div>
            <h2 className="text-2xl font-bold">{keyword.keyword}</h2>
            <p className="text-muted-foreground">此資料包已領取完畢</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            ✅ 已發放：{keyword.current_count}/{keyword.quota} 份
          </p>
          <p className="text-sm text-muted-foreground">
            👥 候補名單：{waitlistCount} 人排隊中
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            💡 創作者可能會根據需求加開配額<br />
            加入候補名單即可在開放時收到通知！
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">為什麼想要這個資料包？（選填）</label>
              <Textarea
                placeholder="例：想用在公司專案、學習用途"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleJoinWaitlist}
              disabled={isSubmitting || !email}
              className="w-full"
            >
              {isSubmitting ? '加入中...' : '🔔 加入候補名單'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ✨ 加入候補後，創作者加開配額時會優先通知
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}