import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Linking, ScrollView, FlatList,
} from "react-native";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, "users", userId as string));
      if (userDoc.exists()) setUser(userDoc.data());

      const q = query(
        collection(db, "posts"),
        where("userId", "==", userId),
        where("status", "==", "unmatched"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator color="#0a7ea4" style={{ flex: 1, marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
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
        <Text style={styles.empty}>No active posts.</Text>
      ) : (
        posts.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.postCard}
            onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })}
          >
            <View style={[styles.badge, item.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
              <Text style={[styles.badgeText, item.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postMeta}>{item.category || "Others"} • {item.location}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  back: { marginBottom: 16 },
  backText: { color: "#0a7ea4", fontSize: 16 },
  profileCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16, elevation: 2 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#0a7ea4", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold", color: "#11181C", marginBottom: 4 },
  joined: { fontSize: 12, color: "#aaa" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#0a7ea4", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 13, color: "#687076", fontWeight: "600" },
  link: { fontSize: 13, color: "#0a7ea4" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  empty: { textAlign: "center", color: "#687076", marginTop: 20 },
  postCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  badge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  badgeLost: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#ff6b6b" },
  badgeFound: { backgroundColor: "#f0fff4", borderWidth: 1, borderColor: "#51cf66" },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  badgeTextLost: { color: "#ff6b6b" },
  badgeTextFound: { color: "#2f9e44" },
  postTitle: { fontSize: 15, fontWeight: "bold", color: "#11181C", marginBottom: 4 },
  postMeta: { fontSize: 12, color: "#aaa" },
});
