// app/_layout.tsx
import { Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <Stack>
      {/* Public screens */}
      <Stack.Screen name="signup" options={{ title: "Sign up" }} />
      <Stack.Screen name="login" options={{ title: "Log in" }} />
      <Stack.Screen name="welcome" options={{ title: "Welcome" }} />
      <Stack.Screen name="onboarding" options={{ title: "Get started" }} />

      {/* App after login (tabs) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Optional modal */}
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
