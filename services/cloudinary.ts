const CLOUD_NAME = "dks2wwyym";
const UPLOAD_PRESET = "lost-found-uploads";

export async function uploadImage(uri: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "upload.jpg",
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await response.json();
  if (!data.secure_url) throw new Error("Image upload failed");
  return data.secure_url;
}
