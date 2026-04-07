import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === "granted") {
          const token = await Notifications.getExpoPushTokenAsync();
          await updateDoc(doc(db, "users", user.uid), {
            pushToken: token.data,
          });
        }
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
