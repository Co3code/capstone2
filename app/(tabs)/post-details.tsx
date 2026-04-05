import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, ImageOff } from "lucide-react-native";

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

  if (loading) return <ActivityIndicator color="#FF416C" style={{ flex: 1, marginTop: 100, backgroundColor: "#070709" }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={16} color="#FF416C" strokeWidth={1.5} />
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>

      {post?.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <ImageOff size={40} color="rgba(255,255,255,0.1)" strokeWidth={1} />
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
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{post?.location}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Posted by</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/public-profile", params: { userId: post?.userId } })}>
            <Text style={styles.link}>{post?.userName}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{new Date(post?.createdAt).toLocaleDateString()}</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070709", padding: 16, paddingTop: 52 },

  back: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#FF416C", fontSize: 15, fontWeight: "300" },

  image: { width: "100%", height: 240, borderRadius: 16, marginBottom: 16 },
  noImage: { width: "100%", height: 180, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.02)", justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", gap: 8 },
  noImageText: { color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: "300" },

  card: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },

  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLost: { backgroundColor: "rgba(255,65,108,0.15)", borderWidth: 1, borderColor: "rgba(255,65,108,0.3)" },
  badgeFound: { backgroundColor: "rgba(0,255,128,0.1)", borderWidth: 1, borderColor: "rgba(0,255,128,0.2)" },
  badgeText: { fontSize: 10, fontWeight: "300", letterSpacing: 1 },
  badgeTextLost: { color: "#FF416C" },
  badgeTextFound: { color: "#00FF80" },

  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusMatched: { backgroundColor: "rgba(255,65,108,0.1)", borderWidth: 1, borderColor: "rgba(255,65,108,0.2)" },
  statusUnmatched: { backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  statusText: { fontSize: 10, fontWeight: "300" },
  statusTextMatched: { color: "#FF416C" },
  statusTextUnmatched: { color: "rgba(255,255,255,0.4)" },

  title: { fontSize: 22, fontWeight: "200", color: "#E0E0E0", marginBottom: 16, letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 10 },
  label: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: "300", flex: 1 },
  value: { fontSize: 13, color: "#E0E0E0", flex: 2, textAlign: "right", fontWeight: "300", flexWrap: "wrap" },
  link: { fontSize: 13, color: "#FF416C", fontWeight: "300" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.03)" },
});
