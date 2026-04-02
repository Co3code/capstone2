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
pip install -r requirements.txt
```

## Environment Variables
Create `.env` file in root directory with:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Firebase Setup
Each team member needs to:
1. Create their own Firebase project
2. Update `services/firebase.ts` with their config

## Running the App
Terminal 1:
```bash
npx expo start --tunnel
```

Terminal 2:
```bash
cd backend
python main.py
```

Update API_BASE_URL in `services/api.ts` with your local IP address.