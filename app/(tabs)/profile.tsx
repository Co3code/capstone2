import { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from "react-native";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/services/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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

    const q = query(collection(db, "posts"), where("userId", "==", user?.uid), orderBy("createdAt", "desc"));
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
      { text: "Logout", style: "destructive", onPress: async () => { await signOut(auth); router.replace("/(auth)/login"); } },
    ]);
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteDoc(doc(db, "posts", postId)); } },
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
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={12} color="#8B949E" />
            <Text style={styles.phone}> {phone || "No phone added"}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#238636" }]}>{matched}</Text>
          <Text style={styles.statLabel}>Matched</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#FF6B6B" }]}>{unmatched}</Text>
          <Text style={styles.statLabel}>Unmatched</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.editBtn} onPress={() => { setEditPhone(phone); setModalVisible(true); }}>
          <Ionicons name="pencil-outline" size={14} color="#0D1117" />
          <Text style={styles.editBtnText}> Edit Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={14} color="#FF6B6B" />
          <Text style={styles.logoutText}> Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Posts</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#238636" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#E2E8F0" />
              <Text style={styles.empty}>{"You haven't"} posted anything yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/(tabs)/post-details", params: { postId: item.id } })}>
              <View style={styles.cardRow}>
                <View style={[styles.badge, item.type === "lost" ? styles.badgeLost : styles.badgeFound]}>
                  <Text style={[styles.badgeText, item.type === "lost" ? styles.badgeTextLost : styles.badgeTextFound]}>{item.type.toUpperCase()}</Text>
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
              {item.status !== "matched" && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePost(item.id)}>
                  <Ionicons name="trash-outline" size={13} color="#FF6B6B" />
                  <Text style={styles.deleteBtnText}> Delete</Text>
                </TouchableOpacity>
              )}
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
              placeholderTextColor="#8B949E"
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
  container: { flex: 1, backgroundColor: "#F6F8FA", padding: 16, paddingTop: 52 },

  profileCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#0D1117", justifyContent: "center", alignItems: "center", marginRight: 14 },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  userInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: "700", color: "#0D1117" },
  email: { fontSize: 12, color: "#8B949E", marginTop: 2 },
  phoneRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  phone: { fontSize: 12, color: "#8B949E" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  statNumber: { fontSize: 20, fontWeight: "800", color: "#0D1117" },
  statLabel: { fontSize: 11, color: "#8B949E", marginTop: 2 },

  actionRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  editBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  editBtnText: { color: "#0D1117", fontWeight: "600", fontSize: 13 },
  logoutBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF0F0", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#FFCDD2" },
  logoutText: { color: "#FF6B6B", fontWeight: "600", fontSize: 13 },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0D1117", marginBottom: 12 },
  emptyContainer: { alignItems: "center", marginTop: 40, gap: 8 },
  empty: { textAlign: "center", color: "#8B949E", fontSize: 14 },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLost: { backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FF6B6B" },
  badgeFound: { backgroundColor: "#F0FFF4", borderWidth: 1, borderColor: "#51CF66" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  badgeTextLost: { color: "#FF6B6B" },
  badgeTextFound: { color: "#2F9E44" },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusMatched: { backgroundColor: "#F0FFF4", borderWidth: 1, borderColor: "#51CF66" },
  statusUnmatched: { backgroundColor: "#F6F8FA", borderWidth: 1, borderColor: "#E2E8F0" },
  statusText: { fontSize: 10, fontWeight: "700" },
  statusTextMatched: { color: "#238636" },
  statusTextUnmatched: { color: "#8B949E" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  detailLabel: { fontSize: 12, color: "#8B949E", fontWeight: "600", flex: 1 },
  detailValue: { fontSize: 12, color: "#0D1117", flex: 2, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#F6F8FA" },
  deleteBtn: { flexDirection: "row", alignSelf: "flex-end", alignItems: "center", backgroundColor: "#FFF0F0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#FFCDD2", marginTop: 10 },
  deleteBtnText: { color: "#FF6B6B", fontSize: 12, fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0D1117", marginBottom: 16 },
  input: { backgroundColor: "#F6F8FA", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 15, color: "#0D1117" },
  button: { backgroundColor: "#238636", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: "#2EA043" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelText: { textAlign: "center", color: "#8B949E", marginTop: 4, fontSize: 14 },
});
