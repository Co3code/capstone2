import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, auth} from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";

import { router } from "expo-router";

type Post = {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  location: string;
  userName: string;
  createdAt: string;
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/(auth)/login");
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), where("status", "==", "unmatched"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AIFoundIt</Text>
      <TextInput
        style={styles.search}
        placeholder="Search lost or found items..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator color="#0a7ea4" style={{ marginTop: 20 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>No posts yet.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, item.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
                  <Text style={[styles.badgeText, item.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardMeta}>{item.location} • {item.userName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a7ea4", marginBottom: 12 },
  search: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#ddd" },
  empty: { textAlign: "center", color: "#687076", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  badge: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeLost: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#ff6b6b" },
  badgeFound: { backgroundColor: "#f0fff4", borderWidth: 1, borderColor: "#51cf66" },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  badgeTextLost: { color: "#ff6b6b" },
  badgeTextFound: { color: "#2f9e44" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#11181C", marginBottom: 4 },
  cardDesc: { fontSize: 14, color: "#687076", marginBottom: 8 },
  cardMeta: { fontSize: 12, color: "#aaa" },
});
