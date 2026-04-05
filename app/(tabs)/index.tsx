import { useEffect, useState } from "react";
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Image,
} from "react-native";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";
import { Search, MapPin, ImageOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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
          <Text style={styles.headerTitle}>AIFoundIT</Text>
          <Text style={styles.headerSubtitle}>Lost & Found, Powered by AI</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={15} color="rgba(255,255,255,0.3)" strokeWidth={1.5} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.search}
          placeholder="Search lost or found items..."
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter buttons */}
      <View style={styles.filterRow}>
        {(["all", "lost", "found"] as const).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} activeOpacity={0.8} style={{ flex: 1 }}>
            {filter === f ? (
              <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.filterBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.filterTextActive}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.filterBtn}>
                <Text style={styles.filterText}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#FF416C" style={{ marginTop: 20 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Search size={48} color="rgba(255,255,255,0.1)" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyDesc}>Be the first to post a lost or found item!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })} activeOpacity={0.8}>
              <View style={styles.cardContent}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.noThumbnail}>
                    <ImageOff size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
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
                    <MapPin size={11} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
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
  container: { flex: 1, backgroundColor: "#070709", padding: 16, paddingTop: 52 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "200", color: "#E0E0E0", letterSpacing: 2 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: "300" },
  headerIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", paddingHorizontal: 14, marginBottom: 14 },
  search: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#E0E0E0", fontWeight: "300" },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterBtn: { flex: 1, padding: 8, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", minHeight: 36 },
  filterBtnActive: { flex: 1, padding: 8, borderRadius: 999, alignItems: "center", justifyContent: "center", minHeight: 36 },
  filterText: { fontSize: 13, fontWeight: "400", color: "#E0E0E0" },
  filterTextActive: { fontSize: 13, fontWeight: "400", color: "#fff" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "200", color: "#E0E0E0", letterSpacing: 0.5 },
  emptyDesc: { fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", fontWeight: "300" },

  card: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardContent: { flexDirection: "row", gap: 12 },
  thumbnail: { width: 85, height: 85, borderRadius: 12 },
  noThumbnail: { width: 85, height: 85, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.03)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardInfo: { flex: 1 },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 },
  badgeLost: { backgroundColor: "rgba(255,65,108,0.15)", borderWidth: 1, borderColor: "rgba(255,65,108,0.3)" },
  badgeFound: { backgroundColor: "rgba(0,255,128,0.1)", borderWidth: 1, borderColor: "rgba(0,255,128,0.2)" },
  badgeText: { fontSize: 10, fontWeight: "300", letterSpacing: 1 },
  badgeTextLost: { color: "#FF416C" },
  badgeTextFound: { color: "#00FF80" },
  cardTitle: { fontSize: 14, fontWeight: "300", color: "#E0E0E0", marginBottom: 4 },
  cardDesc: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 16, fontWeight: "300" },
  cardFooter: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  cardMeta: { fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: "300" },
  cardDate: { fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: "300" },
});
