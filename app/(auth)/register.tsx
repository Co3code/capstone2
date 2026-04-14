import { auth, db } from "@/services/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const setFieldError = (field: keyof typeof errors, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({ name: "", email: "", phone: "", password: "", confirm: "" });
  };

  const [strength, setStrength] = useState<"weak" | "medium" | "strong" | "">("");

  const handleRegister = async () => {
    clearErrors();
    if (!name) return setFieldError("name", "Name is required");
    if (!email) return setFieldError("email", "Email is required");
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) return setFieldError("email", "Invalid email format");
    if (!phone) return setFieldError("phone", "Phone is required");
    if (phone.length !== 11) return setFieldError("phone", "Must be 11 digits");
    if (!password) return setFieldError("password", "Password is required");
    if (password !== confirm) return setFieldError("confirm", "Passwords do not match");

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Account created! Please login.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setFieldError("email", "This email is already registered.");
      } else {
        setFieldError("email", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };




  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Original Logo and Tagline Style */}
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>AIFoundIT</Text>
          <Text style={styles.appTagline}>Lost & Found, Powered by AI</Text>
        </View>

        {/* Header Text without the Card Box */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Join AIFoundIT today</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          
          {/* NAME */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={[styles.underlineInput, focused === "name" && styles.inputFocused]}
              value={name}
              onChangeText={(text) => { setName(text); setErrors((p) => ({ ...p, name: "" })); }}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.underlineInput, focused === "email" && styles.inputFocused]}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => { setEmail(text); setErrors((p) => ({ ...p, email: "" })); }}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
            
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* PHONE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={[styles.underlineInput, focused === "phone" && styles.inputFocused]}
              value={phone}
              keyboardType="phone-pad"
              maxLength={11}
              onFocus={() => setFocused("phone")}
              onBlur={() => setFocused(null)}
              onChangeText={(text) => { setPhone(text); setErrors((p) => ({ ...p, phone: "" })); }}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* PASSWORD */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            {strength !== "" && (
              <Text style={{ fontSize: 12, color: strength === "weak" ? "red" : strength === "medium" ? "orange" : "green", marginBottom: 5 }}>
                {strength === "weak" ? "Weak " : strength === "medium" ? "Medium " : "Strong "}
              </Text>
            )}
            <View style={[styles.inputRow, focused === "password" && styles.inputFocused]}>
              <TextInput
                style={styles.inputInner}
                value={password}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry={!showPassword}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((p) => ({ ...p, password: "" }));
                  if (!text) setStrength("");
                  else if (text.length < 6) setStrength("weak");
                  else if (text.match(/[A-Z]/) && text.match(/[0-9]/)) setStrength("strong");
                  else setStrength("medium");
                }}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* CONFIRM */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={[styles.inputRow, focused === "confirm" && styles.inputFocused]}>
              <TextInput
                style={styles.inputInner}
                value={confirm}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry={!showConfirm}
                onChangeText={(text) => { setConfirm(text); setErrors((p) => ({ ...p, confirm: "" })); }}
                onFocus={() => setFocused("confirm")}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} color="rgba(255,255,255,0.4)" /> : <Eye size={18} color="rgba(255,255,255,0.4)" />}
              </TouchableOpacity>
            </View>
            {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Sign in</Text>
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

  // Exact styles from your original code
  logoContainer: { alignItems: "center", marginBottom: 32 },
  appName: { fontSize: 26, fontWeight: "200", color: "#E0E0E0", letterSpacing: 2 },
  appTagline: { fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: "300", letterSpacing: 0.5 },

  headerTextContainer: { marginBottom: 32 },
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

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingVertical: 12,
  },

  inputInner: { flex: 1, fontSize: 15, color: "#E0E0E0", fontWeight: "300" },
  inputFocused: { borderBottomColor: "#FF416C" },

  errorText: { color: "#FF4B2B", marginTop: 5, fontSize: 12 },

  button: { borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 15 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "300", letterSpacing: 1 },

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24 },
  footerText: { fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: "300" },
  footerLink: { fontSize: 14, color: "#FF416C", fontWeight: "300" },
});