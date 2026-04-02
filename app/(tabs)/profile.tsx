import { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from "react-native";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/services/firebase";
import { router } from "expo-router";

type Post = {
  id: string;
  type: "lost" | "found";
  title: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
  category?: string;
};

export default function ProfileScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, "users", user?.uid!));
      if (userDoc.exists()) setPhone(userDoc.data().phone || "");
    };
    fetchUserData();

    const q = query(
      collection(db, "posts"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
      setPosts(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.uid]);

  const matched = posts.filter((p) => p.status === "matched").length;
  const unmatched = posts.filter((p) => p.status === "unmatched").length;

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "posts", postId));
        },
      },
    ]);
  };

  const handleSavePhone = async () => {
    await updateDoc(doc(db, "users", user?.uid!), { phone: editPhone });
    setPhone(editPhone);
    setModalVisible(false);
  };

  const ListHeader = () => (
    <View>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase() || "U"}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.displayName || "User"}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.phone}>{phone || "No phone added"}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Total Posts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#0a7ea4" }]}>{matched}</Text>
          <Text style={styles.statLabel}>Matched</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#ff6b6b" }]}>{unmatched}</Text>
          <Text style={styles.statLabel}>Unmatched</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editBtn} onPress={() => { setEditPhone(phone); setModalVisible(true); }}>
          <Text style={styles.editBtnText}>Edit Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Posts</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#0a7ea4" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<Text style={styles.empty}>{"You haven't posted anything yet."}</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })}
            >
              <View style={styles.cardRow}>
                <View style={[styles.badge, item.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
                  <Text style={[styles.badgeText, item.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, item.status === "matched" ? styles.statusMatched : styles.statusUnmatched]}>
                  <Text style={[styles.statusText, item.status === "matched" ? styles.statusTextMatched : styles.statusTextUnmatched]}>
                    {item.status === "matched" ? "Matched" : "Unmatched"}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Title</Text><Text style={styles.detailValue}>{item.title}</Text></View>
              <View style={styles.divider} />
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Description</Text><Text style={styles.detailValue} numberOfLines={2}>{item.description}</Text></View>
              <View style={styles.divider} />
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailValue}>{item.location}</Text></View>
              <View style={styles.divider} />
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Category</Text><Text style={styles.detailValue}>{item.category || "Others"}</Text></View>
              <View style={styles.divider} />
              <View style={styles.detailRow}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleDateString()}</Text></View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePost(item.id)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Contact Info</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handleSavePhone}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  profileCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 12, elevation: 3 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#0a7ea4", justifyContent: "center", alignItems: "center", marginRight: 16 },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  userInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#11181C" },
  email: { fontSize: 12, color: "#687076", marginTop: 2 },
  phone: { fontSize: 12, color: "#687076", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", elevation: 2 },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#11181C" },
  statLabel: { fontSize: 11, color: "#687076", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  editBtn: { flex: 1, backgroundColor: "#e8f4f8", padding: 10, borderRadius: 10, alignItems: "center" },
  editBtnText: { color: "#0a7ea4", fontWeight: "bold" },
  logoutBtn: { flex: 1, backgroundColor: "#fff0f0", padding: 10, borderRadius: 10, alignItems: "center" },
  logoutText: { color: "#ff6b6b", fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#0a7ea4", marginBottom: 12 },
  empty: { textAlign: "center", color: "#687076", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeLost: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#ff6b6b" },
  badgeFound: { backgroundColor: "#f0fff4", borderWidth: 1, borderColor: "#51cf66" },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  badgeTextLost: { color: "#ff6b6b" },
  badgeTextFound: { color: "#2f9e44" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusMatched: { backgroundColor: "#e8f4f8", borderWidth: 1, borderColor: "#0a7ea4" },
  statusUnmatched: { backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#aaa" },
  statusText: { fontSize: 11, fontWeight: "bold" },
  statusTextMatched: { color: "#0a7ea4" },
  statusTextUnmatched: { color: "#aaa" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  detailLabel: { fontSize: 12, color: "#687076", fontWeight: "600", flex: 1 },
  detailValue: { fontSize: 12, color: "#11181C", flex: 2, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  deleteBtn: { alignSelf: "flex-end", backgroundColor: "#fff0f0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#ff6b6b", marginTop: 10 },
  deleteBtnText: { color: "#ff6b6b", fontSize: 12, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#0a7ea4", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: "#0a7ea4", padding: 14, borderRadius: 10, alignItems: "center", marginBottom: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelText: { textAlign: "center", color: "#687076", marginTop: 4 },
});
