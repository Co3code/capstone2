import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  TouchableOpacity, Linking, ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Link, ImageOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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

  if (loading) return <ActivityIndicator color="#FF416C" style={{ flex: 1, marginTop: 100, backgroundColor: "#070709" }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={16} color="#FF416C" strokeWidth={1.5} />
        <Text style={styles.backText}> Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.matchHeader}>
        <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.matchIconContainer} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Link size={24} color="#fff" strokeWidth={1.5} />
        </LinearGradient>
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
              <ImageOff size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
            </View>
          )}
          <Text style={styles.photoLabel} numberOfLines={2}>{myPost?.title || "Your Item"}</Text>
        </View>

        <View style={styles.matchIcon}>
          <Link size={20} color="#FF416C" strokeWidth={1.5} />
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
              <ImageOff size={22} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
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
        <View style={styles.row}><Text style={styles.label}>Name</Text><TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/public-profile", params: { userId: matchedPost?.userId } })}><Text style={[styles.value, styles.link]}>{matchedUser?.name}</Text></TouchableOpacity></View>
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
  container: { flex: 1, backgroundColor: "#070709", padding: 16, paddingTop: 52 },

  back: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#FF416C", fontSize: 15, fontWeight: "300" },

  matchHeader: { alignItems: "center", marginBottom: 24, gap: 10 },
  matchIconContainer: { width: 60, height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "200", color: "#E0E0E0", letterSpacing: 1 },
  scoreBadge: { backgroundColor: "rgba(255,65,108,0.1)", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,65,108,0.2)" },
  scoreText: { color: "#FF416C", fontSize: 13, fontWeight: "300" },

  photosRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  photoCard: { flex: 1, alignItems: "center" },
  photo: { width: "100%", height: 130, borderRadius: 12, marginVertical: 8 },
  noPhoto: { width: "100%", height: 130, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)", justifyContent: "center", alignItems: "center", marginVertical: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  photoLabel: { fontSize: 12, color: "#E0E0E0", textAlign: "center", fontWeight: "300" },
  matchIcon: { paddingHorizontal: 8 },

  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLost: { backgroundColor: "rgba(255,65,108,0.15)", borderWidth: 1, borderColor: "rgba(255,65,108,0.3)" },
  badgeFound: { backgroundColor: "rgba(0,255,128,0.1)", borderWidth: 1, borderColor: "rgba(0,255,128,0.2)" },
  badgeText: { fontSize: 10, fontWeight: "300", letterSpacing: 1 },
  badgeTextLost: { color: "#FF416C" },
  badgeTextFound: { color: "#00FF80" },

  card: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  sectionTitle: { fontSize: 15, fontWeight: "200", color: "#E0E0E0", marginBottom: 14, letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  label: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: "300", flex: 1 },
  value: { fontSize: 13, color: "#E0E0E0", flex: 2, textAlign: "right", fontWeight: "300" },
  link: { color: "#FF416C" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.03)" },
});
