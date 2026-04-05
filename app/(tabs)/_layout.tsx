import { Tabs } from "expo-router";
import { Home, PlusCircle, Bell, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF416C",
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#070709",
          borderTopColor: "rgba(255,255,255,0.05)",
          borderTopWidth: 1,
          paddingBottom: insets.bottom || 5,
          height: 58 + (insets.bottom || 0),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "300",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="post" options={{ title: "Post", tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="notifications" options={{ title: "Alerts", tabBarIcon: ({ color, size }) => <Bell size={size} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.5} /> }} />
      <Tabs.Screen name="match-details" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="post-details" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="public-profile" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
