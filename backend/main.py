from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import requests
import numpy as np
from io import BytesIO

app = FastAPI(title="AIFoundIt Matching API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ResNet-50 model (remove final classification layer)
model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
model = torch.nn.Sequential(*list(model.children())[:-1])
model.eval()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def extract_features(image_url: str) -> np.ndarray:
    response = requests.get(image_url, timeout=10)
    image = Image.open(BytesIO(response.content)).convert("RGB")
    tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        features = model(tensor).squeeze().numpy()
    return features / np.linalg.norm(features)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))

def text_similarity(text1: str, text2: str) -> float:
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    if not words1 or not words2:
        return 0.0
    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union)

class MatchRequest(BaseModel):
    new_post_id: str
    new_title: str
    new_description: str
    new_image_url: Optional[str] = None
    existing_posts: list[dict]

class MatchResult(BaseModel):
    post_id: str
    score: float
    is_match: bool

@app.get("/")
def root():
    return {"message": "AIFoundIT Matching API is running!"}

@app.post("/match", response_model=list[MatchResult])
def match_items(request: MatchRequest):
    results = []
    new_features = None

    if request.new_image_url:
        try:
            new_features = extract_features(request.new_image_url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process new image: {str(e)}")

    for post in request.existing_posts:
        image_score = 0.0
        text_score = 0.0

        # Image similarity
        if new_features is not None and post.get("imageUrl"):
            try:
                post_features = extract_features(post["imageUrl"])
                image_score = cosine_similarity(new_features, post_features)
            except:
                image_score = 0.0

        # Text similarity
        combined_new = f"{request.new_title} {request.new_description}"
        combined_post = f"{post.get('title', '')} {post.get('description', '')}"
        text_score = text_similarity(combined_new, combined_post)

        # Hybrid score (60% image, 40% text)
        if new_features is not None and post.get("imageUrl"):
            final_score = (0.6 * image_score) + (0.4 * text_score)
        else:
            final_score = text_score

        results.append(MatchResult(
            post_id=post["id"],
            score=round(final_score, 4),
            is_match=final_score >= 0.5
        ))

    results.sort(key=lambda x: x.score, reverse=True)
    return results
