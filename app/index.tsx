import { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";

export default function SplashScreen() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/login");
        }
      }, 2000);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/splash-logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>AIFoundIT</Text>
      <Text style={styles.subtitle}>Lost & Found AI Matching</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0D1117" },
  logo: { width: 160, height: 160, marginBottom: 24, borderRadius: 20 },
  title: { fontSize: 32, fontWeight: "800", color: "#E6EDF3", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "#8B949E", marginTop: 4 },
});
