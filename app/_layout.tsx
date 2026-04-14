import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          // permi mo dark kong miski during screen transitions 
          contentStyle: { backgroundColor: "#070709" } 
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}