# pipelines/common/features.py
import pandas as pd
import numpy as np

SCOPES = {
    # demande : tout sauf les lignes annulées
    "demand":  lambda d: ~d["is_cancelled"],
    # chiffre d'affaires : sans annulées, et sans retours déjà effectués au cutoff
    "revenue": lambda d: ~d["is_cancelled"] & ~d["is_returned_at_cutoff"],
}

def prepare_lines(oi, orders, cutoff):
    """Horloge unique = orders.created_at ; statuts évalués à la date du cutoff."""
    o = (orders[["order_id", "user_id", "created_at"]]
         .rename(columns={"created_at": "order_created_at"}))
    df = oi.drop(columns=["user_id"], errors="ignore").merge(o, on="order_id", how="inner")
    df = df[df["order_created_at"] < cutoff].copy()
    df["is_cancelled"] = df["status"].eq("Cancelled")
    df["is_returned_at_cutoff"] = df["returned_at"].notna() & (df["returned_at"] < cutoff)
    return df

def select_lines(df, scope):
    if scope not in SCOPES:
        raise ValueError(f"scope inconnu : {scope!r} (choix : {list(SCOPES)})")
    return df[SCOPES[scope](df)]

def build_rfm(oi, orders, cutoff, scope="revenue"):
    df = select_lines(prepare_lines(oi, orders, cutoff), scope)
    rfm = df.groupby("user_id").agg(
        recency=("order_created_at", lambda s: (cutoff - s.max()).days),
        frequency=("order_id", "nunique"),
        monetary=("sale_price", "sum"),
        n_items=("id", "count"),
    )
    rfm["avg_basket"] = rfm["monetary"] / rfm["frequency"]
    return rfm

def build_product_stats(oi, orders, products, cutoff):
    df = select_lines(prepare_lines(oi, orders, cutoff), "demand")
    df = df.assign(net_price=df["sale_price"].where(~df["is_returned_at_cutoff"], 0.0))
    stats = df.groupby("product_id").agg(
        n_sales=("id", "count"),
        revenue=("net_price", "sum"),
        avg_price=("sale_price", "mean"),
        return_rate=("is_returned_at_cutoff", "mean"),
    ).reset_index()
    prod = (products[["id", "category", "brand", "department", "retail_price", "cost"]]
            .rename(columns={"id": "product_id"}))
    return stats.merge(prod, on="product_id", how="left").set_index("product_id")

def build_daily_sales(oi, orders, cutoff, scope="revenue"):
    df = select_lines(prepare_lines(oi, orders, cutoff), scope)
    daily = (df.set_index("order_created_at").resample("D")
               .agg(revenue=("sale_price", "sum"), units=("id", "count")))
    full = pd.date_range(daily.index.min().normalize(), cutoff - pd.Timedelta(days=1), freq="D")
    return daily.reindex(full, fill_value=0)

def build_stock_snapshot(inv, cutoff):
    recv = inv[inv["created_at"] < cutoff].copy()
    recv["sold_before_cutoff"] = recv["sold_at"].notna() & (recv["sold_at"] < cutoff)
    stock = recv.groupby("product_id").agg(
        units_received=("id", "count"),
        units_sold=("sold_before_cutoff", "sum"),
    )
    stock["stock"] = stock["units_received"] - stock["units_sold"]
    assert (stock["stock"] >= 0).all(), "stock négatif : incohérence inventaire"
    return stock

def add_time_features(daily_df):
    df = daily_df.copy()
    idx = df.index
    df["dow"] = idx.dayofweek
    df["month"] = idx.month
    df["day"] = idx.day
    df["is_weekend"] = (idx.dayofweek >= 5).astype(int)
    df["weekofyear"] = idx.isocalendar().week.astype(int)
    return df