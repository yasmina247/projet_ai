from app.services.ml_loader import MODELS, get_model

for key in MODELS:
    m = get_model(key)
    name = m.get("model_name") or m.get("model_type")
    print(f"{key:15s} -> {name} | clés : {list(m.keys())}")