import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
          <View style={styles.logoBadge}>
            <Ionicons name="scan" size={30} color="#238636" />
          </View>
          <Text style={styles.appName}>AIFoundIT</Text>
          <Text style={styles.appTagline}>Lost & Found, Powered by AI</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in</Text>
          <Text style={styles.cardSubtitle}>to continue to AIFoundIT</Text>

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
                placeholderTextColor="#484F58"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#484F58" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
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
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#E6EDF3", marginBottom: 8 },
  forgotText: { fontSize: 13, color: "#58A6FF" },

  input: {
    backgroundColor: "#0D1117", borderWidth: 1,
    borderColor: "#30363D", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#E6EDF3",
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0D1117", borderWidth: 1,
    borderColor: "#30363D", borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  inputInner: { flex: 1, fontSize: 15, color: "#E6EDF3" },
  inputFocused: { borderColor: "#58A6FF" },

  button: {
    backgroundColor: "#238636", borderRadius: 8,
    paddingVertical: 14, alignItems: "center",
    marginTop: 8, borderWidth: 1, borderColor: "#2EA043",
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  footerText: { fontSize: 14, color: "#8B949E" },
  footerLink: { fontSize: 14, color: "#58A6FF", fontWeight: "600" },
});
