// hooks/use-onboarding.ts
import { fetchUserOnboarding, UserOnboarding } from "@/api/onboarding";
import { useEffect, useState } from "react";

export function useOnboarding() {
  const [onboarding, setOnboarding] = useState<UserOnboarding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      const data = await fetchUserOnboarding();
      if (isMounted) {
        setOnboarding(data);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { onboarding, loading };
}
