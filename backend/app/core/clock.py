from datetime import timedelta
import pandas as pd
from app.core.config import settings


def ref_date() -> pd.Timestamp:
    """Date de référence (équivalent de CUTOFF dans les train.py)."""
    return pd.Timestamp(settings.REFERENCE_DATE)


def days_ago(n: int) -> pd.Timestamp:
    return ref_date() - timedelta(days=n)