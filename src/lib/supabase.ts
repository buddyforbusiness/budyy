// src/lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// ⚠️ TEMPORARY: hard-coded credentials for development
// DO NOT commit these to a public GitHub repo.
// When you're ready, we will move them back to .env.
const supabaseUrl = "https://skkhqrjvqtffxcnigzrh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2hxcmp2cXRmZnhjbmlnenJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzI1MjEsImV4cCI6MjA4MTkwODUyMX0.bcZFFEW3DFlw_iOUNQB3Xyr7vGTFWbEuklGnRckxej0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
