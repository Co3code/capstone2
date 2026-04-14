import { auth } from "@/services/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null); // Simplified focus state
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
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>AIFoundIT</Text>
          <Text style={styles.appTagline}>Lost & Found, Powered by AI</Text>
        </View>

        {/* Header Section */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to continue</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* EMAIL */}
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

          {/* PASSWORD */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputRow, focused === "password" && styles.inputFocused]}>
              <TextInput
                style={styles.inputInner}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                ) : (
                  <Eye size={18} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={["#FF416C", "#FF4B2B"]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* FOOTER */}
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
  scrollContent: { flexGrow: 1, padding: 24, paddingVertical: 48 },

  logoContainer: { alignItems: "center", marginBottom: 40 },
  appName: { fontSize: 26, fontWeight: "200", color: "#E0E0E0", letterSpacing: 2 },
  appTagline: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: "300", letterSpacing: 0.5 },

  headerTextContainer: {
    marginBottom: 32,
    marginTop: 50, 
  },
  cardTitle: { fontSize: 28, fontWeight: "200", color: "#E0E0E0", marginBottom: 6, letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: "300" },

  formContainer: { width: "100%" },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  label: { fontSize: 13, fontWeight: "300", color: "rgba(255,255,255,0.6)", letterSpacing: 0.5 },
  forgotText: { fontSize: 13, color: "#FF416C", fontWeight: "300" },

  // New Underline Style
  underlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingVertical: 12,
    fontSize: 15,
    color: "#E0E0E0",
    fontWeight: "300",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingVertical: 12,
  },

  inputInner: { flex: 1, fontSize: 15, color: "#E0E0E0", fontWeight: "300" },
  inputFocused: { borderBottomColor: "#FF416C" },

  button: { borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 15 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "300", letterSpacing: 1 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  footerText: { fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: "300" },
  footerLink: { fontSize: 14, color: "#FF416C", fontWeight: "300" },
});
