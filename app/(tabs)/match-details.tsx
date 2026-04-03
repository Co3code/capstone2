import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, Linking, ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MatchDetailsScreen() {
  const { postId, score, myPostId } = useLocalSearchParams();
  const [matchedPost, setMatchedPost] = useState<any>(null);
  const [myPost, setMyPost] = useState<any>(null);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const matchedDoc = await getDoc(doc(db, "posts", postId as string));
      if (matchedDoc.exists()) {
        const matchedData = matchedDoc.data();
        setMatchedPost(matchedData);
        const userDoc = await getDoc(doc(db, "users", matchedData.userId));
        if (userDoc.exists()) setMatchedUser(userDoc.data());
      }
      if (myPostId) {
        const myDoc = await getDoc(doc(db, "posts", myPostId as string));
        if (myDoc.exists()) setMyPost(myDoc.data());
      }
      setLoading(false);
    };
    fetchDetails();
  }, [postId, myPostId]);

  if (loading) return <ActivityIndicator color="#238636" style={{ flex: 1, marginTop: 100 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={16} color="#238636" />
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.matchHeader}>
        <View style={styles.matchIconContainer}>
          <Ionicons name="checkmark-circle" size={28} color="#238636" />
        </View>
        <Text style={styles.title}>Match Found!</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{Math.round(Number(score) * 100)}% Similarity</Text>
        </View>
      </View>

      {/* Side by side photos */}
      <View style={styles.photosRow}>
        <View style={styles.photoCard}>
          <View style={[styles.badge, myPost?.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
            <Text style={[styles.badgeText, myPost?.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
              {myPost?.type?.toUpperCase() || "YOUR"}
            </Text>
          </View>
          {myPost?.imageUrl ? (
            <Image source={{ uri: myPost.imageUrl }} style={styles.photo} />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="image-outline" size={24} color="#CBD5E1" />
            </View>
          )}
          <Text style={styles.photoLabel} numberOfLines={2}>{myPost?.title || "Your Item"}</Text>
        </View>

        <View style={styles.matchIcon}>
          <Ionicons name="link" size={22} color="#238636" />
        </View>

        <View style={styles.photoCard}>
          <View style={[styles.badge, matchedPost?.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
            <Text style={[styles.badgeText, matchedPost?.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
              {matchedPost?.type?.toUpperCase()}
            </Text>
          </View>
          {matchedPost?.imageUrl ? (
            <Image source={{ uri: matchedPost.imageUrl }} style={styles.photo} />
          ) : (
            <View style={styles.noPhoto}>
              <Ionicons name="image-outline" size={24} color="#CBD5E1" />
            </View>
          )}
          <Text style={styles.photoLabel} numberOfLines={2}>{matchedPost?.title}</Text>
        </View>
      </View>

      {/* Matched item details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Matched Item Details</Text>
        <View style={styles.row}><Text style={styles.label}>Type</Text><Text style={styles.value}>{matchedPost?.type?.toUpperCase()}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Category</Text><Text style={styles.value}>{matchedPost?.category || "Others"}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Title</Text><Text style={styles.value}>{matchedPost?.title}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Description</Text><Text style={styles.value}>{matchedPost?.description}</Text></View>
        <View style={styles.divider} />
        <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>{matchedPost?.location}</Text></View>
      </View>

      {/* Contact info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Contact the Owner</Text>
        <View style={styles.row}><Text style={styles.label}>Name</Text><Text style={styles.value}>{matchedUser?.name}</Text></View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`mailto:${matchedUser?.email}`)}>
          <Text style={styles.label}>Email</Text>
          <Text style={[styles.value, styles.link]}>{matchedUser?.email}</Text>
        </TouchableOpacity>
        {matchedUser?.phone && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(`tel:${matchedUser?.phone}`)}>
              <Text style={styles.label}>Phone</Text>
              <Text style={[styles.value, styles.link]}>{matchedUser?.phone}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FA", padding: 16, paddingTop: 52 },

  back: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#238636", fontSize: 15, fontWeight: "600" },

  matchHeader: { alignItems: "center", marginBottom: 20, gap: 8 },
  matchIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#F0FFF4", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#51CF66" },
  title: { fontSize: 22, fontWeight: "800", color: "#0D1117", letterSpacing: -0.5 },
  scoreBadge: { backgroundColor: "#F0FFF4", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: "#51CF66" },
  scoreText: { color: "#238636", fontSize: 13, fontWeight: "700" },

  photosRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  photoCard: { flex: 1, alignItems: "center" },
  photo: { width: "100%", height: 130, borderRadius: 10, marginVertical: 8 },
  noPhoto: { width: "100%", height: 130, borderRadius: 10, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", marginVertical: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  photoLabel: { fontSize: 12, color: "#0D1117", textAlign: "center", fontWeight: "700" },
  matchIcon: { paddingHorizontal: 8 },

  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLost: { backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FF6B6B" },
  badgeFound: { backgroundColor: "#F0FFF4", borderWidth: 1, borderColor: "#51CF66" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  badgeTextLost: { color: "#FF6B6B" },
  badgeTextFound: { color: "#2F9E44" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0D1117", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  label: { fontSize: 13, color: "#8B949E", fontWeight: "600", flex: 1 },
  value: { fontSize: 13, color: "#0D1117", flex: 2, textAlign: "right" },
  link: { color: "#238636", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F6F8FA" },
});
