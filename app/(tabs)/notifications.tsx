import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { router } from "expo-router";

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
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser?.uid),
      orderBy("createdAt", "desc")
    );
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
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#0a7ea4" style={{ marginTop: 20 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyDesc}>You will be notified when a match is found for your item.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.unread]}
              onPress={() => item.matchedPostId && router.push({ pathname: "/(tabs)/match-details", params: { postId: item.matchedPostId, myPostId: item.myPostId, score: item.score } })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.matchLabel}>
                  <Text style={styles.matchLabelText}>Match Found</Text>
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
                {item.matchedPostId && <Text style={styles.tap}>Tap to view match</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a7ea4" },
  unreadBadge: { backgroundColor: "#0a7ea4", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#11181C", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#687076", textAlign: "center", paddingHorizontal: 24 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  unread: { backgroundColor: "#f0f8ff" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  matchLabel: { backgroundColor: "#e8f4f8", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  matchLabelText: { color: "#0a7ea4", fontSize: 11, fontWeight: "bold" },
  scoreBadge: { backgroundColor: "#f0fff4", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: "#51cf66" },
  scoreText: { color: "#2f9e44", fontSize: 11, fontWeight: "bold" },
  message: { fontSize: 14, color: "#11181C", marginBottom: 8, lineHeight: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { fontSize: 12, color: "#aaa" },
  tap: { fontSize: 12, color: "#0a7ea4", fontWeight: "bold" },
});
