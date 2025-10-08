import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreatorCardProps {
  creatorId: string;
}

export function CreatorCard({ creatorId }: CreatorCardProps) {
  const [creator, setCreator] = useState<{
    avatar_url: string | null;
    display_name: string | null;
    email: string | null;
    bio: string | null;
    social_link: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("avatar_url, display_name, bio, social_link")
        .eq("id", creatorId)
        .maybeSingle();

      console.log('🔍 CreatorCard fetchCreator:', { creatorId, profile, error });

      if (error) {
        console.error('CreatorCard 讀取失敗:', error);
      }

      setCreator({
        avatar_url: profile?.avatar_url || null,
        display_name: profile?.display_name || null,
        email: null,
        bio: profile?.bio || null,
        social_link: profile?.social_link || null,
      });
      setLoading(false);
    };

    fetchCreator();
  }, [creatorId]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl shadow-card p-4 mb-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <a
      href={creator.social_link || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`block glass-card rounded-2xl shadow-card p-4 mb-4 ${
        creator.social_link ? "hover:bg-card/60 transition-colors cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={creator.avatar_url || "/avantar.png"}
          alt="Creator Avatar"
          className="w-16 h-16 rounded-full border-2 border-border object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-base">
            {creator.display_name || "創作者"}
          </h3>
          {creator.bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-4">{creator.bio}</p>
          )}
        </div>
      </div>
    </a>
  );
}