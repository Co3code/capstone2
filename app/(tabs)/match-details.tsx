import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Linking, ScrollView } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";

export default function MatchDetailsScreen() {
  const { postId, score } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const postDoc = await getDoc(doc(db, "posts", postId as string));
      if (postDoc.exists()) {
        const postData = postDoc.data();
        setPost(postData);
        const userDoc = await getDoc(doc(db, "users", postData.userId));
        if (userDoc.exists()) setUser(userDoc.data());
      }
      setLoading(false);
    };
    fetchDetails();
  }, []);

  if (loading) return <ActivityIndicator color="#0a7ea4" style={{ flex: 1, marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Match Found! </Text>
      <Text style={styles.score}>Similarity Score: {Math.round(Number(score) * 100)}%</Text>

      {post?.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}

      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: post?.type === "lost" ? "#ff6b6b" : "#51cf66" }]}>
          <Text style={styles.badgeText}>{post?.type?.toUpperCase()}</Text>
        </View>
        <Text style={styles.itemTitle}>{post?.title}</Text>
        <Text style={styles.description}>{post?.description}</Text>
        <Text style={styles.location}> {post?.location}</Text>
      </View>

      <Text style={styles.sectionTitle}>Contact the Owner</Text>
      <View style={styles.card}>
        <Text style={styles.contactName}> {user?.name}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${user?.email}`)}>
          <Text style={styles.contactLink}>✉️ {user?.email}</Text>
        </TouchableOpacity>
        {user?.phone && (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${user?.phone}`)}>
            <Text style={styles.contactLink}> {user?.phone}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  back: { marginBottom: 16 },
  backText: { color: "#0a7ea4", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a7ea4", marginBottom: 4 },
  score: { fontSize: 14, color: "#687076", marginBottom: 16 },
  image: { width: "100%", height: 220, borderRadius: 12, marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 8 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  itemTitle: { fontSize: 18, fontWeight: "bold", color: "#11181C", marginBottom: 4 },
  description: { fontSize: 14, color: "#687076", marginBottom: 8 },
  location: { fontSize: 13, color: "#aaa" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#0a7ea4", marginBottom: 12 },
  contactName: { fontSize: 16, fontWeight: "bold", color: "#11181C", marginBottom: 8 },
  contactLink: { fontSize: 14, color: "#0a7ea4", marginBottom: 8 },
});
