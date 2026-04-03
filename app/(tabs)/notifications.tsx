import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#238636" style={{ marginTop: 20 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={48} color="#E2E8F0" />
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
            >
              <View style={styles.cardHeader}>
                <View style={styles.matchLabel}>
                  <Ionicons name="checkmark-circle" size={12} color="#238636" />
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
                    <Ionicons name="chevron-forward" size={12} color="#238636" />
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
  container: { flex: 1, backgroundColor: "#F6F8FA", padding: 16, paddingTop: 52 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0D1117", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: "#8B949E", marginTop: 2 },
  unreadBadge: { backgroundColor: "#238636", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0D1117" },
  emptyDesc: { fontSize: 14, color: "#8B949E", textAlign: "center", paddingHorizontal: 24 },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  unread: { borderColor: "#238636", backgroundColor: "#F0FFF4" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  matchLabel: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FFF4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#51CF66" },
  matchLabelText: { color: "#238636", fontSize: 11, fontWeight: "700" },
  scoreBadge: { backgroundColor: "#F6F8FA", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "#E2E8F0" },
  scoreText: { color: "#0D1117", fontSize: 11, fontWeight: "700" },
  message: { fontSize: 14, color: "#0D1117", marginBottom: 10, lineHeight: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { fontSize: 12, color: "#8B949E" },
  tapRow: { flexDirection: "row", alignItems: "center" },
  tap: { fontSize: 12, color: "#238636", fontWeight: "700" },
});
