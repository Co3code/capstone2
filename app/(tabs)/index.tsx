import { useEffect, useState } from "react";
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Image,
} from "react-native";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Post = {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  location: string;
  userName: string;
  createdAt: string;
  imageUrl?: string;
  category?: string;
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AIFoundIt</Text>
          <Text style={styles.headerSubtitle}>Lost & Found, Powered by AI</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="search" size={22} color="#238636" />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color="#8B949E" style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search lost or found items..."
          placeholderTextColor="#8B949E"
          value={search}
          onChangeText={setSearch}
        />
      </View>

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
        <ActivityIndicator color="#238636" style={{ marginTop: 20 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyDesc}>Be the first to post a lost or found item!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })}>
              <View style={styles.cardContent}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.noThumbnail}>
                    <Ionicons name="image-outline" size={24} color="#CBD5E1" />
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
                  <View style={styles.cardFooter}>
                    <Ionicons name="location-outline" size={11} color="#8B949E" />
                    <Text style={styles.cardMeta}> {item.location}</Text>
                  </View>
                  <Text style={styles.cardDate}>{item.userName} • {new Date(item.createdAt).toLocaleDateString()}</Text>
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
  container: { flex: 1, backgroundColor: "#F6F8FA", padding: 16, paddingTop: 52 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0D1117", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: "#8B949E", marginTop: 2 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  search: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#0D1117" },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterBtn: { flex: 1, padding: 8, borderRadius: 8, alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
  filterBtnActive: { backgroundColor: "#0D1117", borderColor: "#0D1117" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#8B949E" },
  filterTextActive: { color: "#fff" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0D1117" },
  emptyDesc: { fontSize: 14, color: "#8B949E", textAlign: "center" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  cardContent: { flexDirection: "row", gap: 12 },
  thumbnail: { width: 85, height: 85, borderRadius: 10 },
  noThumbnail: { width: 85, height: 85, borderRadius: 10, backgroundColor: "#F6F8FA", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  cardInfo: { flex: 1 },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  badgeLost: { backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FF6B6B" },
  badgeFound: { backgroundColor: "#F0FFF4", borderWidth: 1, borderColor: "#51CF66" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  badgeTextLost: { color: "#FF6B6B" },
  badgeTextFound: { color: "#2F9E44" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#0D1117", marginBottom: 2 },
  cardDesc: { fontSize: 12, color: "#8B949E", marginBottom: 6, lineHeight: 16 },
  cardFooter: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  cardMeta: { fontSize: 11, color: "#8B949E" },
  cardDate: { fontSize: 11, color: "#CBD5E1" },
});
