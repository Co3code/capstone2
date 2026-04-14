import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
    
        // maw ning pawala sa white flash kong mag ang keyboard opne/close sa auth 
        contentStyle: { backgroundColor: "#070709" },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
