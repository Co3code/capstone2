# Team Setup Instructions

## Prerequisites
- Node.js installed
- Python 3.8+ installed
- Expo CLI: `npm install -g @expo/cli`

## Frontend Setup
```bash
cd capstone2
npm install
```

## Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.local.txt
```

## Environment Variables
Create `.env` file in root directory with:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# Option 1: Use local PC (faster)
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000

# Option 2: Use Render.com (no PC needed)
EXPO_PUBLIC_API_URL=https://capstone2-zgpz.onrender.com
```

## Finding Your Local IP (Option 1):
```bash
# Windows
ipconfig
# Look for IPv4 Address e.g. 192.168.1.100
# Then use: http://192.168.1.100:8000
```

## Windows Firewall Rule (Option 1 only):
If your phone can't reach your PC, run this in Command Prompt as **Administrator**:
```bash
netsh advfirewall firewall add rule name="FastAPI Port 8000" dir=in action=allow protocol=TCP localport=8000
```
This allows your phone to connect to your PC on port 8000! ako pa

## Running the App

### Option 1: Local PC (Fast)
Terminal 1:
```bash
npx expo start --tunnel
```

Terminal 2:
```bash
cd backend
venv\Scripts\activate.bat
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Render.com (No PC needed)
Just run:
```bash
npx expo start --tunnel
```
Make sure `EXPO_PUBLIC_API_URL` is set to Render.com URL in `.env`

## Waking Up Render.com Server:
Before testing, open this in browser to wake up the server:
```
https://capstone2-zgpz.onrender.com
```
Wait for: `{"message": "AIFoundIT Matching API is running!"}`
