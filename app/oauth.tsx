import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../src/lib/supabase";

export default function OAuthScreen() {
  const params = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    const run = async () => {
      if (!params.code) return;

      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;

      if (!userId) {
        router.replace("/login");
        return;
      }

      await fetch("http://localhost:4000/truelayer/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: params.code,
          userId,
        }),
      });

      router.replace("/(tabs)");
    };

    run();
  }, [params.code]);

  return null;
}
