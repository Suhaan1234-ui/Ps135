🚀 SkillTrack AI — SIH 2026 PS135

An AI-powered platform for analyzing employment outcomes, identifying skill gaps, and predicting employee retention risk.

📌 Problem Statement

SkillSync AI helps organizations and skilling initiatives make better workforce decisions using data and AI.

The platform provides:

📊 Employment outcome analytics
🧠 AI-powered skill gap analysis
⚠️ Employee retention risk prediction
✨ Features
📊 Employment Analytics
Training and placement funnel analysis
Employment and placement rates
Drop-off analysis
Data quality and anomaly detection
State, scheme, component and training-type insights
🧠 Skill Gap Analysis
Exact skill matching
Alias and normalized matching
Fuzzy matching
Semantic matching
Core vs optional skill prioritization
Personalized missing-skill recommendations
⚠️ Retention Risk Prediction
ML-based attrition prediction
Attrition probability
Retention probability
Low / Medium / High risk classification
Saved preprocessing pipeline
🛠️ Tech Stack
Frontend
React
Vite
JavaScript
CSS
Backend
FastAPI
Pydantic
Machine Learning
Python
Scikit-learn
XGBoost
Pandas
RapidFuzz
Sentence Transformers
📂 Project Structure
Ps135/
│
├── frontend/
│   └── React + Vite dashboard
│
├── backend/
│   ├── main.py
│   ├── schemas.py
│   └── requirements.txt
│
├── ml/
│   ├── data/
│   ├── models/
│   ├── notebooks/
│   ├── engine.py
│   └── requirements.txt
│
└── README.md
🔄 System Architecture
React Frontend
      ↓
FastAPI Backend
      ↓
ML Engine
      ↓
Employment Analytics
Skill Gap Analysis
Retention Prediction
🚀 Running the Project
1. ML + Backend
cd backend
pip install -r requirements.txt
python main.py
2. Frontend
cd frontend
npm install
npm run dev

Open:

http://localhost:5173
⚠️ Disclaimer

This project is built as an SIH 2026 prototype. ML predictions and analytics are intended for decision support and demonstration purposes and should not be treated as production-grade employment or HR decisions.

👨‍💻 Team

Built for Smart India Hackathon 2026 — PS135 🚀

🌟 Core Idea

From skilling data → workforce insights → skill recommendations → retention intelligence.