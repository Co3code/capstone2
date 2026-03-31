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
      <Text style={styles.title}>AIFoundIt</Text>
      <Text style={styles.subtitle}>Lost & Found AI Matching</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  logo: { width: 160, height: 160, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "bold", color: "#0a7ea4" },
  subtitle: { fontSize: 14, color: "#687076", marginTop: 4 },
});
