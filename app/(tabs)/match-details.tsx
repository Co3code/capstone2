import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, Linking, ScrollView
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";

export default function MatchDetailsScreen() {
  const { postId, score, myPostId } = useLocalSearchParams();
  const [matchedPost, setMatchedPost] = useState<any>(null);
  const [myPost, setMyPost] = useState<any>(null);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      // Fetch matched post
      const matchedDoc = await getDoc(doc(db, "posts", postId as string));
      if (matchedDoc.exists()) {
        const matchedData = matchedDoc.data();
        setMatchedPost(matchedData);
        const userDoc = await getDoc(doc(db, "users", matchedData.userId));
        if (userDoc.exists()) setMatchedUser(userDoc.data());
      }

      // Fetch my post if available
      if (myPostId) {
        const myDoc = await getDoc(doc(db, "posts", myPostId as string));
        if (myDoc.exists()) setMyPost(myDoc.data());
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

      {/* Side by side photos */}
      <View style={styles.photosRow}>
        <View style={styles.photoCard}>
          <View style={[styles.badge, { backgroundColor: myPost?.type === "lost" ? "#ff6b6b" : "#51cf66" }]}>
            <Text style={styles.badgeText}>{myPost?.type?.toUpperCase() || "YOUR"}</Text>
          </View>
          {myPost?.imageUrl ? (
            <Image source={{ uri: myPost.imageUrl }} style={styles.photo} />
          ) : (
            <View style={styles.noPhoto}><Text style={styles.noPhotoText}>No Photo</Text></View>
          )}
          <Text style={styles.photoLabel} numberOfLines={2}>{myPost?.title || "Your Item"}</Text>
        </View>

        <View style={styles.matchIcon}>
          <Text style={styles.matchIconText}>🔗</Text>
        </View>

        <View style={styles.photoCard}>
          <View style={[styles.badge, { backgroundColor: matchedPost?.type === "lost" ? "#ff6b6b" : "#51cf66" }]}>
            <Text style={styles.badgeText}>{matchedPost?.type?.toUpperCase()}</Text>
          </View>
          {matchedPost?.imageUrl ? (
            <Image source={{ uri: matchedPost.imageUrl }} style={styles.photo} />
          ) : (
            <View style={styles.noPhoto}><Text style={styles.noPhotoText}>No Photo</Text></View>
          )}
          <Text style={styles.photoLabel} numberOfLines={2}>{matchedPost?.title}</Text>
        </View>
      </View>

      {/* Matched item details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Matched Item Details</Text>
        <View style={styles.row}><Text style={styles.label}>Type</Text><Text style={styles.value}>{matchedPost?.type?.toUpperCase()}</Text></View>
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
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  back: { marginBottom: 16 },
  backText: { color: "#0a7ea4", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a7ea4", marginBottom: 4 },
  score: { fontSize: 14, color: "#687076", marginBottom: 16 },
  photosRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  photoCard: { flex: 1, alignItems: "center" },
  photo: { width: "100%", height: 140, borderRadius: 10, marginVertical: 8 },
  noPhoto: { width: "100%", height: 140, borderRadius: 10, backgroundColor: "#e0e0e0", justifyContent: "center", alignItems: "center", marginVertical: 8 },
  noPhotoText: { color: "#687076", fontSize: 12 },
  photoLabel: { fontSize: 12, color: "#11181C", textAlign: "center", fontWeight: "bold" },
  matchIcon: { paddingHorizontal: 8 },
  matchIconText: { fontSize: 24 },
  badge: { alignSelf: "center", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#0a7ea4", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  label: { fontSize: 13, color: "#687076", fontWeight: "600", flex: 1 },
  value: { fontSize: 13, color: "#11181C", flex: 2, textAlign: "right" },
  link: { color: "#0a7ea4" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
});
