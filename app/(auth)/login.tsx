import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, Search } from "lucide-react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Login Failed", "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>AIFoundIT</Text>
          <Text style={styles.appTagline}>Lost & Found, Powered by AI</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>

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

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputRow, passwordFocused && styles.inputFocused]}>
              <TextInput
                style={styles.inputInner}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeOff size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                  : <Eye size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                }
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to AIFoundIT? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070709" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },

  logoContainer: { alignItems: "center", marginBottom: 32 },
  appName: { fontSize: 26, fontWeight: "200", color: "#E0E0E0", letterSpacing: 2 },
  appTagline: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: "300", letterSpacing: 0.5 },

  card: {
    backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 24,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", padding: 28,
  },
  cardTitle: { fontSize: 28, fontWeight: "200", color: "#E0E0E0", marginBottom: 6, letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32, fontWeight: "300" },

  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  label: { fontSize: 13, fontWeight: "300", color: "rgba(255,255,255,0.6)", marginBottom: 10, letterSpacing: 0.5 },
  forgotText: { fontSize: 13, color: "#FF416C", fontWeight: "300" },

  input: {
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: "#E0E0E0", fontWeight: "300",
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  inputInner: { flex: 1, fontSize: 15, color: "#E0E0E0", fontWeight: "300" },
  inputFocused: { borderColor: "#FF416C" },

  button: { borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "300", letterSpacing: 1 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  footerText: { fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: "300" },
  footerLink: { fontSize: 14, color: "#FF416C", fontWeight: "300" },
});
