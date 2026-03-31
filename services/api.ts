import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export async function matchItems(
  newPostId: string,
  newTitle: string,
  newDescription: string,
  newImageUrl: string | null,
  existingPosts: any[]
) {
  const response = await axios.post(`${API_URL}/match`, {
    new_post_id: newPostId,
    new_title: newTitle,
    new_description: newDescription,
    new_image_url: newImageUrl,
    existing_posts: existingPosts,
  });
  return response.data;
}
