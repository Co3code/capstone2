import { useEffect, useState } from "react";
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Image,
} from "react-native";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
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
  imageUrl?: string;
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
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

  const filtered = posts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AIFoundIt</Text>

      <TextInput
        style={styles.search}
        placeholder="Search lost or found items..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter buttons */}
      <View style={styles.filterRow}>
        {(["all", "lost", "found"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
              <View style={styles.cardContent}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.noThumbnail}>
                    <Text style={styles.noThumbnailText}>No Photo</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <View style={[styles.badge, item.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
                    <Text style={[styles.badgeText, item.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                  <Text style={styles.cardMeta}>{item.location} • {item.userName}</Text>
                  <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
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
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterBtn: { flex: 1, padding: 8, borderRadius: 20, alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
  filterBtnActive: { backgroundColor: "#0a7ea4", borderColor: "#0a7ea4" },
  filterText: { fontSize: 13, fontWeight: "bold", color: "#687076" },
  filterTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: "#687076", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 12, marginBottom: 12, elevation: 3, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6 },
  cardContent: { flexDirection: "row", gap: 12 },
  thumbnail: { width: 90, height: 90, borderRadius: 12 },
  noThumbnail: { width: 90, height: 90, borderRadius: 12, backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center" },
  noThumbnailText: { fontSize: 10, color: "#687076" },
  cardInfo: { flex: 1 },
  badge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  badgeLost: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#ff6b6b" },
  badgeFound: { backgroundColor: "#f0fff4", borderWidth: 1, borderColor: "#51cf66" },
  badgeText: { fontSize: 10, fontWeight: "bold" },
  badgeTextLost: { color: "#ff6b6b" },
  badgeTextFound: { color: "#2f9e44" },
  cardTitle: { fontSize: 15, fontWeight: "bold", color: "#11181C", marginBottom: 2 },
  cardDesc: { fontSize: 13, color: "#687076", marginBottom: 4 },
  cardMeta: { fontSize: 11, color: "#aaa" },
  cardDate: { fontSize: 11, color: "#aaa", marginTop: 2 },
});
