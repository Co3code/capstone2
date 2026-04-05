import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { router } from "expo-router";
import { Bell, CheckCircle, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  matchedPostId?: string;
  myPostId?: string;
  score?: number;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "notifications"), where("userId", "==", auth.currentUser?.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Your match updates</Text>
        </View>
        {unreadCount > 0 && (
          <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.unreadBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
          </LinearGradient>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#FF416C" style={{ marginTop: 20 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color="rgba(255,255,255,0.1)" strokeWidth={1} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyDesc}>You will be notified when a match is found for your item.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.unread]}
              onPress={() => item.matchedPostId && router.push({ pathname: "/(tabs)/match-details", params: { postId: item.matchedPostId, myPostId: item.myPostId, score: item.score } })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.matchLabel}>
                  <CheckCircle size={12} color="#FF416C" strokeWidth={1.5} />
                  <Text style={styles.matchLabelText}> Match Found</Text>
                </View>
                {item.score && (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>{Math.round(item.score * 100)}% match</Text>
                  </View>
                )}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                {item.matchedPostId && (
                  <View style={styles.tapRow}>
                    <Text style={styles.tap}>View match</Text>
                    <ChevronRight size={12} color="#FF416C" strokeWidth={1.5} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070709", padding: 16, paddingTop: 52 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "200", color: "#E0E0E0", letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: "300" },
  unreadBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontWeight: "300" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "200", color: "#E0E0E0", letterSpacing: 0.5 },
  emptyDesc: { fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", paddingHorizontal: 24, fontWeight: "300" },

  card: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  unread: { borderColor: "rgba(255,65,108,0.2)", backgroundColor: "rgba(255,65,108,0.03)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  matchLabel: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,65,108,0.1)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,65,108,0.2)" },
  matchLabelText: { color: "#FF416C", fontSize: 11, fontWeight: "300" },
  scoreBadge: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  scoreText: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "300" },
  message: { fontSize: 14, color: "#E0E0E0", marginBottom: 10, lineHeight: 20, fontWeight: "300" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: "300" },
  tapRow: { flexDirection: "row", alignItems: "center" },
  tap: { fontSize: 12, color: "#FF416C", fontWeight: "300" },
});
