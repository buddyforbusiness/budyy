// api/onboarding.ts
import { supabase } from "../src/lib/supabase";

export type UserOnboarding = {
  user_id: string;
  q1_purpose: string[] | null;
  q2_feel_money: string | null;
  q3_profile: string | null;
  q4_income_range: string | null;
  q5_rent: string | null;
  q6_send_home: string | null;
  q7_goals: string[] | null;
  q8_top_goal: string | null;
  q9_goal_timeline: string | null;
  q10_goal_amount: string | null;
  q11_frictions: string[] | null;
  q12_run_out: string | null;
  q13_save_pattern: string | null;
  q14_help: string[] | null;
  q15_tone: string | null;
  q16_depth: string | null;
};

export async function fetchUserOnboarding(): Promise<UserOnboarding | null> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData.user) {
    console.log("fetchUserOnboarding: no auth user", authErr);
    return null;
  }

  const userId = authData.user.id;

  const { data, error } = await supabase
    .from("user_onboarding")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.log("fetchUserOnboarding error", error);
    return null;
  }

  return data as UserOnboarding | null;
}
