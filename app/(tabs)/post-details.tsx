import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";

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

  if (loading) return <ActivityIndicator color="#0a7ea4" style={{ flex: 1, marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {post?.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>No Photo</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={[styles.badge, post?.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
          <Text style={[styles.badgeText, post?.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
            {post?.type?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.title}>{post?.title}</Text>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Type</Text><Text style={styles.value}>{post?.type?.toUpperCase()}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Category</Text><Text style={styles.value}>{post?.category || "Others"}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Description</Text><Text style={styles.value}>{post?.description}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>{post?.location}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Posted by</Text><TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/public-profile", params: { userId: post?.userId } })}><Text style={[styles.value, styles.link]}>{post?.userName}</Text></TouchableOpacity></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{new Date(post?.createdAt).toLocaleDateString()}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, post?.status === "matched" ? styles.statusMatched : styles.statusUnmatched]}>
            <Text style={[styles.statusText, post?.status === "matched" ? styles.statusTextMatched : styles.statusTextUnmatched]}>
              {post?.status === "matched" ? "Matched" : "Unmatched"}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  back: { marginBottom: 16 },
  backText: { color: "#0a7ea4", fontSize: 16 },
  image: { width: "100%", height: 250, borderRadius: 16, marginBottom: 16 },
  noImage: { width: "100%", height: 200, borderRadius: 16, backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  noImageText: { color: "#687076", fontSize: 14 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  label: { fontSize: 13, color: "#687076", fontWeight: "600", flex: 1 },
  value: { fontSize: 13, color: "#11181C", flex: 2, textAlign: "right" },
  link: { color: "#0a7ea4" },
  badge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12 },
  badgeLost: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#ff6b6b" },
  badgeFound: { backgroundColor: "#f0fff4", borderWidth: 1, borderColor: "#51cf66" },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  badgeTextLost: { color: "#ff6b6b" },
  badgeTextFound: { color: "#2f9e44" },
  title: { fontSize: 22, fontWeight: "bold", color: "#11181C", marginBottom: 8 },
  description: { fontSize: 15, color: "#687076", marginBottom: 16, lineHeight: 22 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginBottom: 12 },
  meta: { fontSize: 13, color: "#687076", marginBottom: 6 },
  statusBadge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 12 },
  statusMatched: { backgroundColor: "#e8f4f8", borderWidth: 1, borderColor: "#0a7ea4" },
  statusUnmatched: { backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#aaa" },
  statusText: { fontSize: 12, fontWeight: "bold" },
  statusTextMatched: { color: "#0a7ea4" },
  statusTextUnmatched: { color: "#aaa" },
});