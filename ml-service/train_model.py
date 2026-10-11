"""
Trains a lightweight text classifier that predicts an expense category
(e.g. "Food & Dining", "Transportation") from a transaction's free-text
description or merchant name.

Pipeline: TF-IDF (word + bigram) -> Multinomial Naive Bayes.
This is intentionally simple — the training set is small, so a heavier
model would just overfit. Run this script whenever data/training_data.csv
changes; it writes model/category_classifier.joblib for app.py to load.
"""

import os

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "training_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "category_classifier.joblib")


def main():
    df = pd.read_csv(DATA_PATH)
    df["text"] = df["text"].str.lower().str.strip()

    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], df["category"], test_size=0.2, random_state=42, stratify=df["category"]
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
        ("clf", MultinomialNB(alpha=0.3)),
    ])

    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    print("Holdout evaluation:")
    print(classification_report(y_test, preds, zero_division=0))

    # Refit on the full dataset before shipping the model
    pipeline.fit(df["text"], df["category"])

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
