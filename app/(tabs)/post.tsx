import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
import { uploadImage } from "@/services/cloudinary";
import { matchItems } from "@/services/api";

export default function PostScreen() {
  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!title || !description || !location) return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        try {
          imageUrl = await uploadImage(image);
        } catch (uploadError: any) {
          console.log("Upload error:", uploadError.message);
          return Alert.alert("Upload Failed", "Image upload failed. Please check your internet connection.");
        }
      }
      const docRef = await addDoc(collection(db, "posts"), {
        type,
        title,
        description,
        location,
        imageUrl,
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName || "Anonymous",
        createdAt: new Date().toISOString(),
        status: "unmatched",
      });

      // Fetch existing opposite type posts for matching
      const oppositeType = type === "lost" ? "found" : "lost";
      const q = query(
        collection(db, "posts"),
        where("type", "==", oppositeType),
        where("status", "==", "unmatched")
      );
      const snapshot = await getDocs(q);
      const existingPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (existingPosts.length > 0) {
        try {
          const matches = await matchItems(docRef.id, title, description, imageUrl, existingPosts);
          const topMatch = matches.find((m: any) => m.is_match);
          if (topMatch) {
            await addDoc(collection(db, "notifications"), {
              userId: auth.currentUser?.uid,
              message: `We found a possible match for your ${type} item "${title}"!`,
              matchedPostId: topMatch.post_id,
              score: topMatch.score,
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        } catch (matchError: any) {
          console.log("Matching error:", matchError.message);
        }
      }

      Alert.alert("Success", "Post submitted! We'll notify you if a match is found.");
      setTitle("");
      setDescription("");
      setLocation("");
      setImage(null);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Post an Item</Text>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "lost" && styles.toggleActive]}
          onPress={() => setType("lost")}
        >
          <Text style={[styles.toggleText, type === "lost" && styles.toggleTextActive]}>Lost</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, type === "found" && styles.toggleActive]}
          onPress={() => setType("found")}
        >
          <Text style={[styles.toggleText, type === "found" && styles.toggleTextActive]}>Found</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Item Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}> Tap to add a photo</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Post</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16, paddingTop: 52 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0a7ea4", marginBottom: 20 },
  toggle: { flexDirection: "row", backgroundColor: "#e0e0e0", borderRadius: 10, marginBottom: 16, padding: 4 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 8, alignItems: "center" },
  toggleActive: { backgroundColor: "#0a7ea4" },
  toggleText: { fontWeight: "bold", color: "#687076" },
  toggleTextActive: { color: "#fff" },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#ddd", fontSize: 16 },
  imagePicker: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#ddd", height: 150, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  imagePickerText: { color: "#687076", fontSize: 16 },
  imagePreview: { width: "100%", height: "100%", borderRadius: 10 },
  button: { backgroundColor: "#0a7ea4", padding: 16, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
