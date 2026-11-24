import sys
from functools import lru_cache
from pathlib import Path

import joblib

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = BACKEND_ROOT / "ml_artifacts"

# Pour que "pipelines.common..." soit trouvable au chargement des pickles
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

MODELS = {
    "segmentation": "customer_segmentation",
    "forecast": "forecast_sales",
    "stockout": "stockout_risk",
    "recommendation": "recommendation",
}


@lru_cache(maxsize=None)
def get_model(name: str) -> dict:
    """Charge un modèle une seule fois (puis le garde en mémoire)."""
    path = ARTIFACTS_DIR / MODELS[name] / "model.pkl"
    if not path.exists():
        raise FileNotFoundError(f"Modèle introuvable : {path}")
    return joblib.load(path)


def load_all() -> dict:
    return {name: get_model(name) for name in MODELS}