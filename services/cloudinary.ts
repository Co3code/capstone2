const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export async function uploadImage(uri: string): Promise<string> {
  const formData = new FormData();

  if (uri.startsWith("data:") || uri.startsWith("blob:")) {
    // Web: fetch the blob and append
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append("file", blob, "upload.jpg");
  } else {
    // Native: use uri directly
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
  }

  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await response.json();
  if (!data.secure_url) throw new Error("Image upload failed");
  return data.secure_url;
}
