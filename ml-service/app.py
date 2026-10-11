"""
Flask microservice that predicts an expense category from a transaction
description. Called by the Node/Express backend when a user adds a
transaction without manually picking a category (see backend/src/utils/mlClient.js).
"""

import os
import subprocess

import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "category_classifier.joblib")

app = Flask(__name__)
CORS(app)


def load_model():
    if not os.path.exists(MODEL_PATH):
        # First run convenience: train on the fly if no model artifact exists yet.
        subprocess.run(["python", os.path.join(BASE_DIR, "train_model.py")], check=True)
    return joblib.load(MODEL_PATH)


# Loaded eagerly at startup, not on the first request — the Node backend's
# call to /predict-category has a ~1.5s timeout, and a lazy load (join +
# unpickle) can blow past that on the very first request after boot.
_model = load_model()


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/predict-category")
def predict_category():
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip().lower()

    if not text:
        return jsonify(error="text is required"), 400

    probabilities = _model.predict_proba([text])[0]
    classes = _model.classes_

    best_idx = probabilities.argmax()
    category = classes[best_idx]
    confidence = float(probabilities[best_idx])

    return jsonify(category=category, confidence=round(confidence, 4))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
