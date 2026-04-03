import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { uploadImage } from "@/services/cloudinary";
import { matchItems } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function PostScreen() {
  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Others");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["Bag", "Wallet", "Phone", "Keys", "ID/Cards", "Clothing", "Electronics", "Others"];

  const processImage = async (uri: string) => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri, [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImage(manipulated.uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
    if (!result.canceled) await processImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission required", "Camera permission is required.");
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 });
    if (!result.canceled) await processImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!title || !description || !location) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      const dupQuery = query(collection(db, "posts"), where("userId", "==", auth.currentUser?.uid), where("title", "==", title), where("type", "==", type), where("status", "==", "unmatched"));
      const dupSnapshot = await getDocs(dupQuery);
      if (!dupSnapshot.empty) return Alert.alert("Duplicate Post", "You already have an active post with the same title!");

      let imageUrl = null;
      if (image) {
        try { imageUrl = await uploadImage(image); }
        catch (uploadError: any) { return Alert.alert("Upload Failed", "Image upload failed. Please check your internet connection."); }
      }

      const docRef = await addDoc(collection(db, "posts"), {
        type, title, description, location, imageUrl, category,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || "Anonymous",
        createdAt: new Date().toISOString(),
        status: "unmatched",
      });

      const oppositeType = type === "lost" ? "found" : "lost";
      const q = query(collection(db, "posts"), where("type", "==", oppositeType), where("status", "==", "unmatched"));
      const snapshot = await getDocs(q);
      const existingPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));

      if (existingPosts.length > 0) {
        try {
          const matches = await matchItems(docRef.id, title, description, imageUrl, existingPosts);
          const topMatch = matches.find((m: any) => m.is_match);
          if (topMatch) {
            await addDoc(collection(db, "notifications"), {
              userId: auth.currentUser?.uid,
              message: `We found a possible match for your ${type} item "${title}"!`,
              matchedPostId: topMatch.post_id, myPostId: docRef.id,
              score: topMatch.score, createdAt: new Date().toISOString(), read: false,
            });
            const matchedPost = existingPosts.find((p: any) => p.id === topMatch.post_id);
            if (matchedPost) {
              await addDoc(collection(db, "notifications"), {
                userId: matchedPost.userId,
                message: `We found a possible match for your ${oppositeType} item "${matchedPost.title}"!`,
                matchedPostId: docRef.id, myPostId: topMatch.post_id,
                score: topMatch.score, createdAt: new Date().toISOString(), read: false,
              });
            }
            await updateDoc(doc(db, "posts", docRef.id), { status: "matched" });
            await updateDoc(doc(db, "posts", topMatch.post_id), { status: "matched" });
          }
        } catch (matchError: any) { console.log("Matching error:", matchError.message); }
      }

      Alert.alert("Success", "Post submitted! We'll notify you if a match is found.");
      setTitle(""); setDescription(""); setLocation(""); setCategory("Others"); setImage(null);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post an Item</Text>
        <Text style={styles.headerSubtitle}>Help reunite lost items with their owners</Text>
      </View>

      {/* Type Toggle */}
      <View style={styles.toggleContainer}>
        {(["lost", "found"] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.toggleBtn, type === t && (t === "lost" ? styles.toggleLost : styles.toggleFound)]} onPress={() => setType(t)}>
            <Text style={[styles.toggleText, type === t && styles.toggleTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Item Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Black leather wallet" placeholderTextColor="#8B949E" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the item in detail..." placeholderTextColor="#8B949E" value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="Where was it lost/found?" placeholderTextColor="#8B949E" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Photo</Text>
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={18} color="#0D1117" />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={18} color="#0D1117" />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Post</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F8FA", padding: 16, paddingTop: 52 },

  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0D1117", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: "#8B949E", marginTop: 2 },

  toggleContainer: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", padding: 4, marginBottom: 16, gap: 4 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  toggleLost: { backgroundColor: "#FFF0F0" },
  toggleFound: { backgroundColor: "#F0FFF4" },
  toggleText: { fontWeight: "700", color: "#8B949E", fontSize: 14 },
  toggleTextActive: { color: "#0D1117" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#0D1117", marginBottom: 8 },
  input: { backgroundColor: "#F6F8FA", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#0D1117", marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: "top" },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  categoryBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F6F8FA" },
  categoryBtnActive: { backgroundColor: "#0D1117", borderColor: "#0D1117" },
  categoryText: { fontSize: 12, color: "#8B949E", fontWeight: "500" },
  categoryTextActive: { color: "#fff", fontWeight: "700" },

  imageContainer: { marginBottom: 16 },
  imagePreview: { width: "100%", height: 180, borderRadius: 10, marginBottom: 8 },
  removeImage: { alignSelf: "flex-end", backgroundColor: "#FFF0F0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#FF6B6B" },
  removeImageText: { color: "#FF6B6B", fontSize: 12, fontWeight: "700" },

  photoButtons: { flexDirection: "row", gap: 12, marginBottom: 4 },
  photoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#F6F8FA", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 12 },
  photoBtnText: { color: "#0D1117", fontWeight: "600", fontSize: 14 },

  button: { backgroundColor: "#238636", borderRadius: 8, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#2EA043" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
