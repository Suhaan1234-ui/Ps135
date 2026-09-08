# 🚀 SkillTrack AI — SIH 2026 PS135

> An AI-powered platform for analyzing employment outcomes, identifying skill gaps, and predicting employee retention risk.

## 📌 Problem Statement

SkillTrack AI helps organizations and skilling initiatives make better workforce decisions using data and AI.

The platform provides:

- 📊 Employment outcome analytics
- 🧠 AI-powered skill gap analysis
- ⚠️ Employee retention risk prediction

---

## ✨ Features

### 📊 Employment Analytics

- Training and placement funnel analysis
- Employment and placement rates
- Drop-off analysis
- Data quality and anomaly detection
- State, scheme, component and training-type insights

### 🧠 Skill Gap Analysis

- Exact skill matching
- Alias and normalized matching
- Fuzzy matching
- Semantic matching
- Core vs optional skill prioritization
- Personalized missing-skill recommendations

### ⚠️ Retention Risk Prediction

- ML-based attrition prediction
- Attrition probability
- Retention probability
- Low / Medium / High risk classification
- Saved preprocessing pipeline

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- FastAPI
- Pydantic

### Machine Learning

- Python
- Scikit-learn
- XGBoost
- Pandas
- RapidFuzz
- Sentence Transformers

---

## 📂 Project Structure

```text
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
```

---

## 🔄 System Architecture

```text
React Frontend
      ↓
FastAPI Backend
      ↓
ML Engine
      ↓
Employment Analytics
Skill Gap Analysis
Retention Prediction
```

---

## 🚀 Running the Project

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🧠 ML Modules

### Employment Analytics Engine

Analyzes skilling and employment outcome data to provide:

- Enrollment insights
- Training completion rates
- Certification rates
- Placement rates
- Funnel drop-offs
- Data anomalies

### Skill Gap Engine

Compares candidate skills with job requirements using a hybrid matching system:

```text
Exact Match
     ↓
Alias Match
     ↓
Fuzzy Match
     ↓
Semantic Match
```

The system identifies:

- Matched skills
- Missing skills
- Core skills
- Optional skills
- Recommendations

### Retention Prediction Engine

Uses a trained machine learning pipeline to predict employee attrition risk.

Output includes:

- Attrition prediction
- Attrition probability
- Retention probability
- Risk level

---

## ⚠️ Disclaimer

This project is built as an **SIH 2026 prototype**.

The ML predictions and analytics are intended for decision support and demonstration purposes and should not be used as the sole basis for real-world employment or HR decisions.

---

## 👨‍💻 Team

Built for **Smart India Hackathon 2026 — PS135** 🚀

---

## 🌟 Core Idea

**From skilling data → workforce insights → skill recommendations → retention intelligence.**