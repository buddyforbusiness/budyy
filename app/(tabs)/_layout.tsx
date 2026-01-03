// app/(tabs)/_layout.tsx
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.backgroundSoft,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="house.fill" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="paperplane.fill" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="flag.fill" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="chart.pie.fill" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="person.crop.circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
