import boto3

_bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

# Deterministic rules — these ALWAYS fire, so the demo never depends on the model
RULES = [
    ({"alprazolam", "diazepam"},  "Two benzodiazepines — additive sedation and respiratory depression."),
    ({"alprazolam", "lorazepam"}, "Two benzodiazepines — additive sedation."),
    ({"tramadol",   "alprazolam"},"Opioid + benzodiazepine — high overdose risk."),
    ({"warfarin",   "aspirin"},   "Increased bleeding risk."),
]

def run_ai_hook(hook, payload):
    if hook != "drug-interaction":
        return []
    drugs = [d.lower().strip() for d in payload.get("drugs", [])]
    warnings = [msg for combo, msg in RULES if combo <= set(drugs)]
    try:
        warnings += _bedrock_check(payload.get("drugs", []))
    except Exception:
        pass  # model optional; rules already cover the demo
    return list(dict.fromkeys(warnings))  # dedupe, keep order

def _bedrock_check(drugs):
    if len(drugs) < 2:
        return []
    prompt = ("You are a clinical pharmacist. In one short sentence each, list any "
              "dangerous interactions between these medicines, or reply exactly NONE. "
              "Medicines: " + ", ".join(drugs))
    r = _bedrock.converse(
        modelId="amazon.nova-lite-v1:0",
        messages=[{"role": "user", "content": [{"text": prompt}]}],
        inferenceConfig={"maxTokens": 200, "temperature": 0})
    text = r["output"]["message"]["content"][0]["text"].strip()
    if not text or text.upper().startswith("NONE"):
        return []
    return [ln.strip("-• ").strip() for ln in text.splitlines() if ln.strip()]
