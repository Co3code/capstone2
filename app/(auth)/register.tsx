import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirm) return Alert.alert("Error", "Please fill in all fields");
    if (password !== confirm) return Alert.alert("Error", "Passwords do not match");
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, name, email, phone,
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Account created! Please login.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch {
      Alert.alert("Registration Failed", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", label: "Full name", placeholder: "e.g. Maria Santos", value: name, onChange: setName },
    { key: "email", label: "Email address", placeholder: "name@example.com", value: email, onChange: setEmail, keyboardType: "email-address" as const, autoCapitalize: "none" as const },
    { key: "phone", label: "Phone number", placeholder: "+63 912 345 6789", value: phone, onChange: setPhone, keyboardType: "phone-pad" as const },
    { key: "password", label: "Password", placeholder: "••••••••", value: password, onChange: setPassword, secure: true },
    { key: "confirm", label: "Confirm password", placeholder: "••••••••", value: confirm, onChange: setConfirm, secure: true },
  ];

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
          <Text style={styles.cardTitle}>Create account</Text>
          <Text style={styles.cardSubtitle}>Join AIFoundIt today</Text>

          {fields.map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={[styles.input, focused === field.key && styles.inputFocused]}
                placeholder={field.placeholder}
                placeholderTextColor="#484F58"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType={field.keyboardType || "default"}
                autoCapitalize={field.autoCapitalize || "words"}
                secureTextEntry={field.secure || false}
                onFocus={() => setFocused(field.key)}
                onBlur={() => setFocused(null)}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D1117" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24, paddingVertical: 48 },

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

  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 16, borderWidth: 1, borderColor: "#30363D", borderRadius: 8 },
  footerText: { fontSize: 14, color: "#8B949E" },
  footerLink: { fontSize: 14, color: "#58A6FF", fontWeight: "600" },
});
