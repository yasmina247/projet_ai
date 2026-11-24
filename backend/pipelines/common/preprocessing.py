import pandas as pd
import numpy as np
from pathlib import Path
import joblib
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler

class MissingValueHandler:
    def __init__(self, strategies):
        self.strategies = strategies
        self.fill_values = {}
        self.knn_imputer = None
        self.knn_cols = []

    def fit(self, df):
        for col, strat in self.strategies.items():
            if col not in df.columns or strat == "none":
                continue
            if strat == "median":
                self.fill_values[col] = df[col].median()
            elif strat == "mean":
                self.fill_values[col] = df[col].mean()
            elif strat == "mode":
                mode = df[col].mode()
                self.fill_values[col] = mode.iloc[0] if len(mode) else "Unknown"
            elif strat == "constant":
                self.fill_values[col] = 0
            elif strat == "knn":
                self.knn_cols.append(col)
        if self.knn_cols:
            self.knn_imputer = KNNImputer(n_neighbors=5)
            self.knn_imputer.fit(df[self.knn_cols])
        return self

    def transform(self, df):
        df = df.copy()
        for col, val in self.fill_values.items():
            if col in df.columns:
                df[col] = df[col].fillna(val)
        if self.knn_imputer is not None:
            df[self.knn_cols] = self.knn_imputer.transform(df[self.knn_cols])
        return df

    def fit_transform(self, df):
        return self.fit(df).transform(df)

class OutlierHandler:
    def __init__(self, bounds=None, iqr_factor=1.5, clip_cols=None):
        self.bounds = bounds or {}
        self.iqr_factor = iqr_factor
        self.clip_cols = clip_cols or []
        self.learned_bounds = {}

    def fit(self, df):
        for col in self.clip_cols:
            s = df[col].dropna()
            if len(s) == 0: continue
            q1, q3 = s.quantile([.25, .75])
            iqr = q3 - q1
            lo = q1 - self.iqr_factor * iqr
            hi = q3 + self.iqr_factor * iqr
            self.learned_bounds[col] = (lo, hi)
        return self

    def transform(self, df):
        df = df.copy()
        for col, (lo, hi) in {**self.learned_bounds, **self.bounds}.items():
            if col in df.columns:
                df[col] = df[col].clip(lower=lo, upper=hi)
        return df

    def fit_transform(self, df):
        return self.fit(df).transform(df)

class ScalerWrapper:
    def __init__(self, method="standard", cols=None):
        self.method = method
        self.cols = cols or []
        if method == "standard":
            self.scaler = StandardScaler()
        elif method == "minmax":
            self.scaler = MinMaxScaler()
        elif method == "robust":
            self.scaler = RobustScaler()
        else:
            raise ValueError(f"Unknown method: {method}")

    def fit(self, df):
        if self.cols:
            self.scaler.fit(df[self.cols])
        return self

    def transform(self, df):
        df = df.copy()
        if self.cols:
            df[self.cols] = self.scaler.transform(df[self.cols])
        return df

    def fit_transform(self, df):
        return self.fit(df).transform(df)

def save_preprocessor(components, path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(components, path)
    print(f"Preprocessor sauvegardé : {path}")

def load_preprocessor(path):
    return joblib.load(path)