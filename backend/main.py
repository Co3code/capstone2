from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
import clip
from PIL import Image
import requests
from io import BytesIO

app = FastAPI(title="AIFoundIT Matching API (CLIP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CLIP
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)


# -------- FEATURE FUNCTIONS -------- #

def get_image_features(image_url: str):
    response = requests.get(image_url, timeout=10)
    image = Image.open(BytesIO(response.content)).convert("RGB")
    image_input = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        features = model.encode_image(image_input)

    return features / features.norm(dim=-1, keepdim=True)


def get_text_features(text: str):
    text_input = clip.tokenize([text]).to(device)

    with torch.no_grad():
        features = model.encode_text(text_input)

    return features / features.norm(dim=-1, keepdim=True)


def cosine_similarity(a, b):
    return float((a @ b.T).item())


# -------- MODELS -------- #

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


# -------- ROUTES -------- #

@app.get("/")
def root():
    return {"message": "AIFoundIT Matching API (CLIP) is running!"}


@app.post("/match", response_model=list[MatchResult])
def match_items(request: MatchRequest):
    results = []

    # New post features
    new_text = f"{request.new_title} {request.new_description}"
    new_text_features = get_text_features(new_text)

    new_image_features = None
    if request.new_image_url:
        try:
            new_image_features = get_image_features(request.new_image_url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image error: {str(e)}")

    for post in request.existing_posts:
        # TEXT similarity
        post_text = f"{post.get('title', '')} {post.get('description', '')}"
        post_text_features = get_text_features(post_text)
        text_score = cosine_similarity(new_text_features, post_text_features)

        # IMAGE similarity
        image_score = 0.0
        if new_image_features is not None and post.get("imageUrl"):
            try:
                post_image_features = get_image_features(post["imageUrl"])
                image_score = cosine_similarity(new_image_features, post_image_features)
            except:
                pass

        # Combine scores
        if new_image_features is not None and post.get("imageUrl"):
            final_score = (0.7 * image_score) + (0.3 * text_score)
        else:
            final_score = text_score

        results.append(MatchResult(
            post_id=post["id"],
            score=round(final_score, 4),
            is_match=final_score >= 0.4
        ))

    results.sort(key=lambda x: x.score, reverse=True)
    return results