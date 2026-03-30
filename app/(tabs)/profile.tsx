import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/services/firebase";
import { router } from "expo-router";

type Post = {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
};

export default function ProfileScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{user?.displayName || "User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Posts</Text>

      {loading ? (
        <ActivityIndicator color="#0a7ea4" style={{ marginTop: 20 }} />
      ) : posts.length === 0 ? (
        <Text style={styles.empty}>You haven't posted anything yet.</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.badge, { backgroundColor: item.type === "lost" ? "#ff6b6b" : "#51cf66" }]}>
                <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardMeta}>📍 {item.location} • {item.status}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  name: { fontSize: 20, fontWeight: "bold", color: "#11181C" },
  email: { fontSize: 13, color: "#687076" },
  logoutBtn: { backgroundColor: "#ff6b6b", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#0a7ea4", marginBottom: 12 },
  empty: { textAlign: "center", color: "#687076", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 8 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#11181C", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#687076", marginBottom: 8 },
  cardMeta: { fontSize: 12, color: "#aaa" },
});
