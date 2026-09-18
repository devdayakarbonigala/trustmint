import boto3

_bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

RULES = [
    ({"alprazolam", "diazepam"},  "Two benzodiazepines - additive sedation and respiratory depression."),
    ({"alprazolam", "lorazepam"}, "Two benzodiazepines - additive sedation."),
    ({"tramadol",   "alprazolam"},"Opioid + benzodiazepine - high overdose risk."),
    ({"warfarin",   "aspirin"},   "Increased bleeding risk."),
]

def run_ai_hook(hook, payload):
    if hook == "drug-interaction":
        drugs = [d.lower().strip() for d in payload.get("drugs", [])]
        warnings = [msg for combo, msg in RULES if combo <= set(drugs)]
        prompt = ("You are a clinical pharmacist. In one short sentence each, list any "
                  "dangerous interactions between these medicines, or reply exactly NONE. "
                  "Medicines: " + ", ".join(payload.get("drugs", [])))
        return _merge(warnings, _ask(prompt) if len(drugs) >= 2 else [])
    if hook == "content-validation":
        warnings = [f"Field '{k}' looks incomplete." for k, v in payload.items()
                    if isinstance(v, str) and len(v.strip()) < 2]
        details = "; ".join(f"{k}: {v}" for k, v in payload.items())
        prompt = ("You are validating an official certificate. In one short sentence each, "
                  "flag anything implausible or inconsistent, or reply exactly NONE. "
                  "Details: " + details)
        return _merge(warnings, _ask(prompt))
    return []

def _ask(prompt):
    try:
        r = _bedrock.converse(
            modelId="amazon.nova-lite-v1:0",
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 200, "temperature": 0})
        text = r["output"]["message"]["content"][0]["text"].strip()
        if not text or text.upper().startswith("NONE"):
            return []
        return [ln.strip("-* ").strip() for ln in text.splitlines() if ln.strip()]
    except Exception:
        return []

def _merge(a, b):
    return list(dict.fromkeys(a + b))
