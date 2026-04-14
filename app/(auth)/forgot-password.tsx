import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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

        {/* Logo Section - Search badge removed */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>AIFoundIT</Text>
          <Text style={styles.appTagline}>Lost & Found, Powered by AI</Text>
        </View>

        {/* Header Section */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.cardTitle}>Reset password</Text>
          <Text style={styles.cardSubtitle}>Enter the email address you used to register</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.underlineInput, focused === "email" && styles.inputFocused]}
              placeholder="name@example.com"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
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
  scrollContent: { flexGrow: 1, padding: 24, paddingVertical: 48 },

  logoContainer: { alignItems: "center", marginBottom: 40 },
  appName: { fontSize: 26, fontWeight: "200", color: "#E0E0E0", letterSpacing: 2 },
  appTagline: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: "300", letterSpacing: 0.5 },

  headerTextContainer: { 
    marginBottom: 32,
    marginTop: 70, 
  },
  cardTitle: { fontSize: 28, fontWeight: "200", color: "#E0E0E0", marginBottom: 6, letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: "300" },

  formContainer: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "300", color: "rgba(255,255,255,0.6)", marginBottom: 10, letterSpacing: 0.5 },

  underlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingVertical: 12,
    fontSize: 15,
    color: "#E0E0E0",
    fontWeight: "300",
  },
  inputFocused: { borderBottomColor: "#FF416C" },

  button: { borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 15 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "300", letterSpacing: 1 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  footerLink: { fontSize: 14, color: "#FF416C", fontWeight: "300" },
});