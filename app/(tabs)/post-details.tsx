import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PostDetailsScreen() {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = await getDoc(doc(db, "posts", postId as string));
      if (postDoc.exists()) setPost(postDoc.data());
      setLoading(false);
    };
    fetchPost();
  }, [postId]);

  if (loading) return <ActivityIndicator color="#238636" style={{ flex: 1, marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={16} color="#238636" />
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>

      {post?.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Ionicons name="image-outline" size={40} color="#CBD5E1" />
          <Text style={styles.noImageText}>No Photo</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, post?.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
            <Text style={[styles.badgeText, post?.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
              {post?.type?.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, post?.status === "matched" ? styles.statusMatched : styles.statusUnmatched]}>
            <Text style={[styles.statusText, post?.status === "matched" ? styles.statusTextMatched : styles.statusTextUnmatched]}>
              {post?.status === "matched" ? "Matched" : "Unmatched"}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{post?.title}</Text>
        <View style={styles.divider} />

        <View style={styles.row}><Text style={styles.label}>Category</Text><Text style={styles.value}>{post?.category || "Others"}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Description</Text><Text style={styles.value}>{post?.description}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>{post?.location}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Posted by</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/public-profile", params: { userId: post?.userId } })}>
            <Text style={[styles.value, styles.link]}>{post?.userName}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{new Date(post?.createdAt).toLocaleDateString()}</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FA", padding: 16, paddingTop: 52 },

  back: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#238636", fontSize: 15, fontWeight: "600" },

  image: { width: "100%", height: 240, borderRadius: 12, marginBottom: 16 },
  noImage: { width: "100%", height: 180, borderRadius: 12, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  noImageText: { color: "#8B949E", fontSize: 13 },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },

  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLost: { backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FF6B6B" },
  badgeFound: { backgroundColor: "#F0FFF4", borderWidth: 1, borderColor: "#51CF66" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  badgeTextLost: { color: "#FF6B6B" },
  badgeTextFound: { color: "#2F9E44" },

  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusMatched: { backgroundColor: "#F0FFF4", borderWidth: 1, borderColor: "#51CF66" },
  statusUnmatched: { backgroundColor: "#F6F8FA", borderWidth: 1, borderColor: "#E2E8F0" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusTextMatched: { color: "#238636" },
  statusTextUnmatched: { color: "#8B949E" },

  title: { fontSize: 20, fontWeight: "800", color: "#0D1117", marginBottom: 12, letterSpacing: -0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  label: { fontSize: 13, color: "#8B949E", fontWeight: "600", flex: 1 },
  value: { fontSize: 13, color: "#0D1117", flex: 2, textAlign: "right" },
  link: { color: "#238636", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F6F8FA" },
});
