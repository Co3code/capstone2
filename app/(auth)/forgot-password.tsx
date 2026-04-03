import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleReset = async () => {
    if (!email) return Alert.alert("Error", "Please enter your email");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset email sent! Check your inbox.", [
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
          <View style={styles.logoBadge}>
            <Ionicons name="search" size={30} color="#238636" />
          </View>
          <Text style={styles.appName}>AIFoundIt</Text>
          <Text style={styles.appTagline}>Lost & Found, Powered by AI</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reset password</Text>
          <Text style={styles.cardSubtitle}>Enter your email and {"we'll"} send you a reset link</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="name@example.com"
              placeholderTextColor="#484F58"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send reset email</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Back to sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D1117" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },

  logoContainer: { alignItems: "center", marginBottom: 32 },
  logoBadge: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#161B22", justifyContent: "center",
    alignItems: "center", marginBottom: 12,
    borderWidth: 1, borderColor: "#30363D",
  },
  appName: { fontSize: 22, fontWeight: "700", color: "#E6EDF3", letterSpacing: -0.5 },
  appTagline: { fontSize: 13, color: "#8B949E", marginTop: 4 },

  card: {
    backgroundColor: "#161B22", borderRadius: 12,
    borderWidth: 1, borderColor: "#30363D",
    padding: 24, marginBottom: 16,
  },
  cardTitle: { fontSize: 24, fontWeight: "700", color: "#E6EDF3", marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: "#8B949E", marginBottom: 24 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#E6EDF3", marginBottom: 8 },

  input: {
    backgroundColor: "#0D1117", borderWidth: 1,
    borderColor: "#30363D", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#E6EDF3",
  },
  inputFocused: { borderColor: "#58A6FF" },

  button: {
    backgroundColor: "#238636", borderRadius: 8,
    paddingVertical: 14, alignItems: "center",
    marginTop: 8, borderWidth: 1, borderColor: "#2EA043",
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  footer: { alignItems: "center", marginTop: 20 },
  footerLink: { fontSize: 14, color: "#58A6FF", fontWeight: "600" },
});
