import { customAlphabet } from 'nanoid';
import { SupabaseClient } from '@supabase/supabase-js';

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6);

export const generateShortCode = (): string => {
  return nanoid();
};

export const generateUniqueShortCode = async (
  supabase: SupabaseClient
): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const code = nanoid();
    const { data } = await supabase
      .from('magic_boxes')
      .select('short_code')
      .eq('short_code', code)
      .single();

    if (!data) return code;
    attempts++;
  }

  return customAlphabet(alphabet, 8)();
};