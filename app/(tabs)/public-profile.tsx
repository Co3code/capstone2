import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Linking, ScrollView,
} from "react-native";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, MapPin, FileText } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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

  if (loading) return <ActivityIndicator color="#FF416C" style={{ flex: 1, marginTop: 100, backgroundColor: "#070709" }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={16} color="#FF416C" strokeWidth={1.5} />
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
        </LinearGradient>
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
          <FileText size={40} color="rgba(255,255,255,0.1)" strokeWidth={1} />
          <Text style={styles.empty}>No active posts.</Text>
        </View>
      ) : (
        posts.map((item) => (
          <TouchableOpacity key={item.id} style={styles.postCard} onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })} activeOpacity={0.8}>
            <View style={[styles.badge, item.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
              <Text style={[styles.badgeText, item.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <View style={styles.postMetaRow}>
              <MapPin size={11} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
              <Text style={styles.postMeta}> {item.location}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070709", padding: 16, paddingTop: 52 },

  back: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#FF416C", fontSize: 15, fontWeight: "300" },

  profileCard: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  avatar: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "200" },
  name: { fontSize: 20, fontWeight: "200", color: "#E0E0E0", marginBottom: 4, letterSpacing: 0.5 },
  joined: { fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: "300" },

  card: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  sectionTitle: { fontSize: 15, fontWeight: "200", color: "#E0E0E0", marginBottom: 14, letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: "300" },
  link: { fontSize: 13, color: "#FF416C", fontWeight: "300" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.03)" },

  emptyContainer: { alignItems: "center", marginTop: 20, gap: 8 },
  empty: { textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "300" },

  postCard: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  badgeLost: { backgroundColor: "rgba(255,65,108,0.15)", borderWidth: 1, borderColor: "rgba(255,65,108,0.3)" },
  badgeFound: { backgroundColor: "rgba(0,255,128,0.1)", borderWidth: 1, borderColor: "rgba(0,255,128,0.2)" },
  badgeText: { fontSize: 10, fontWeight: "300", letterSpacing: 1 },
  badgeTextLost: { color: "#FF416C" },
  badgeTextFound: { color: "#00FF80" },
  postTitle: { fontSize: 14, fontWeight: "300", color: "#E0E0E0", marginBottom: 6 },
  postMetaRow: { flexDirection: "row", alignItems: "center" },
  postMeta: { fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: "300" },
});
