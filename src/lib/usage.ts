import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  plan: 'free' | 'pro';
  daily_scan_count: number;
  last_scan_date: string;
  created_at: string;
  updated_at: string;
}

export interface ScanCheckResult {
  can_scan: boolean;
  plan?: 'free' | 'pro';
  scans_remaining?: number;
  reason?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function checkAndIncrementScan(userId: string): Promise<ScanCheckResult> {
  try {
    const { data, error } = await supabase.rpc('check_and_increment_scan_count', {
      user_id: userId
    });

    if (error) throw error;
    return data as ScanCheckResult;
  } catch (error) {
    console.error('Error checking scan limit:', error);
    return { can_scan: false, reason: 'error' };
  }
}

export async function createUserProfile(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        plan: 'free',
        daily_scan_count: 0,
        last_scan_date: new Date().toISOString().split('T')[0]
      }]);

    if (error && !error.message.includes('duplicate')) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}
