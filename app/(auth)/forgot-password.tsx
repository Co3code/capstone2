import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Search, ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleReset = async () => {
    if (!email) return Alert.alert("Error", "Please enter your email");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent! Check your inbox or spam.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "If this email is registered, a reset link will be sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.logoBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Search size={26} color="#fff" strokeWidth={1.5} />
          </LinearGradient>
          <Text style={styles.appName}>AIFoundIT</Text>
          <Text style={styles.appTagline}>Lost & Found, Powered by AI</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reset password</Text>
          <Text style={styles.cardSubtitle}>Enter the email address you used to register</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="name@example.com"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reset email</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footer} onPress={() => router.back()}>
            <ArrowLeft size={14} color="#FF416C" strokeWidth={1.5} />
            <Text style={styles.footerLink}> Back to sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070709" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },

  logoContainer: { alignItems: "center", marginBottom: 40 },
  logoBadge: { width: 64, height: 64, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  appName: { fontSize: 26, fontWeight: "200", color: "#E0E0E0", letterSpacing: 2 },
  appTagline: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: "300", letterSpacing: 0.5 },

  card: {
    backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 24,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", padding: 28,
  },
  cardTitle: { fontSize: 28, fontWeight: "200", color: "#E0E0E0", marginBottom: 6, letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32, fontWeight: "300" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "300", color: "rgba(255,255,255,0.6)", marginBottom: 10, letterSpacing: 0.5 },

  input: {
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#E0E0E0", fontWeight: "300",
  },
  inputFocused: { borderColor: "#FF416C" },

  button: { borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "300", letterSpacing: 1 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  footerLink: { fontSize: 14, color: "#FF416C", fontWeight: "300" },
});
