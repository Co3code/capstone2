import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Linking, ScrollView,
} from "react-native";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, "users", userId as string));
      if (userDoc.exists()) setUser(userDoc.data());
      const q = query(collection(db, "posts"), where("userId", "==", userId), where("status", "==", "unmatched"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <ActivityIndicator color="#238636" style={{ flex: 1, marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={16} color="#238636" />
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.joined}>Member since {new Date(user?.createdAt).toLocaleDateString()}</Text>
      </View>

      {/* Contact */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${user?.email}`)}>
            <Text style={styles.link}>{user?.email}</Text>
          </TouchableOpacity>
        </View>
        {user?.phone && (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${user?.phone}`)}>
                <Text style={styles.link}>{user?.phone}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Active Posts */}
      <Text style={styles.sectionTitle}>Active Posts</Text>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={40} color="#E2E8F0" />
          <Text style={styles.empty}>No active posts.</Text>
        </View>
      ) : (
        posts.map((item) => (
          <TouchableOpacity key={item.id} style={styles.postCard} onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })}>
            <View style={[styles.badge, item.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
              <Text style={[styles.badgeText, item.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <View style={styles.postMetaRow}>
              <Ionicons name="location-outline" size={11} color="#8B949E" />
              <Text style={styles.postMeta}> {item.location}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FA", padding: 16, paddingTop: 52 },

  back: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#238636", fontSize: 15, fontWeight: "600" },

  profileCard: { backgroundColor: "#fff", borderRadius: 12, padding: 24, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  avatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#0D1117", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  name: { fontSize: 20, fontWeight: "700", color: "#0D1117", marginBottom: 4 },
  joined: { fontSize: 12, color: "#8B949E" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0D1117", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 13, color: "#8B949E", fontWeight: "600" },
  link: { fontSize: 13, color: "#238636", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F6F8FA" },

  emptyContainer: { alignItems: "center", marginTop: 20, gap: 8 },
  empty: { textAlign: "center", color: "#8B949E", fontSize: 14 },

  postCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  badgeLost: { backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FF6B6B" },
  badgeFound: { backgroundColor: "#F0FFF4", borderWidth: 1, borderColor: "#51CF66" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  badgeTextLost: { color: "#FF6B6B" },
  badgeTextFound: { color: "#2F9E44" },
  postTitle: { fontSize: 14, fontWeight: "700", color: "#0D1117", marginBottom: 4 },
  postMetaRow: { flexDirection: "row", alignItems: "center" },
  postMeta: { fontSize: 12, color: "#8B949E" },
});
