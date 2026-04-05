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
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";

export default function PostScreen() {
  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Others");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["Bag", "Wallet", "Phone", "Keys", "ID/Cards", "Clothing",  "Others"];

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
        catch { return Alert.alert("Upload Failed", "Image upload failed. Please check your internet connection."); }
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post an Item</Text>
        <Text style={styles.headerSubtitle}>Help reunite lost items with their owners</Text>
      </View>

      {/* Type Toggle */}
      <View style={styles.toggleContainer}>
        {(["lost", "found"] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setType(t)} activeOpacity={0.8} style={{ flex: 1 }}>
            {type === t ? (
              <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.toggleActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.toggleTextActive}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.toggleBtn}>
                <Text style={styles.toggleText}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Item Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Black Leather Wallet" placeholderTextColor="rgba(255,255,255,0.2)" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setCategory(cat)} activeOpacity={0.8}>
              {category === cat ? (
                <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.categoryBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.categoryTextActive}>{cat}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryBtn}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="e.g. Black wallet with ID cards and cash inside. Has a small scratch on the back." placeholderTextColor="rgba(255,255,255,0.2)" value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="e.g. SM Mall Food Court, 2nd Floor" placeholderTextColor="rgba(255,255,255,0.2)" value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Photo</Text>
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
              <X size={14} color="#FF416C" strokeWidth={1.5} />
              <Text style={styles.removeImageText}> Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto} activeOpacity={0.8}>
              <Camera size={18} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage} activeOpacity={0.8}>
              <ImageIcon size={18} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
        <LinearGradient colors={["#FF416C", "#FF4B2B"]} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Post</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070709", padding: 16, paddingTop: 52 },

  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "200", color: "#E0E0E0", letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2, fontWeight: "300" },

  toggleContainer: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", padding: 4, marginBottom: 16, gap: 4 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 999, alignItems: "center" },
  toggleActive: { flex: 1, padding: 10, borderRadius: 999, alignItems: "center" },
  toggleText: { fontWeight: "300", color: "rgba(255,255,255,0.4)", fontSize: 14 },
  toggleTextActive: { fontWeight: "300", color: "#fff", fontSize: 14 },

  card: { backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "300", color: "rgba(255,255,255,0.6)", marginBottom: 10, letterSpacing: 0.5 },
  input: { backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#E0E0E0", marginBottom: 16, fontWeight: "300" },
  textArea: { height: 100, textAlignVertical: "top" },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  categoryBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.03)" },
  categoryBtnActive: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  categoryText: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: "300" },
  categoryTextActive: { fontSize: 12, color: "#fff", fontWeight: "300" },

  imageContainer: { marginBottom: 16 },
  imagePreview: { width: "100%", height: 180, borderRadius: 12, marginBottom: 8 },
  removeImage: { flexDirection: "row", alignSelf: "flex-end", alignItems: "center", backgroundColor: "rgba(255,65,108,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,65,108,0.2)" },
  removeImageText: { color: "#FF416C", fontSize: 12, fontWeight: "300" },

  photoButtons: { flexDirection: "row", gap: 12, marginBottom: 4 },
  photoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12 },
  photoBtnText: { color: "rgba(255,255,255,0.6)", fontWeight: "300", fontSize: 14 },

  button: { borderRadius: 999, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "300", fontSize: 15, letterSpacing: 1 },
});
