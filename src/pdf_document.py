import json, base64
import boto3, segno
from fpdf import FPDF

docs_t  = boto3.resource("dynamodb").Table("documents")
types_t = boto3.resource("dynamodb").Table("types")

def _l(s):  # latin-1 safe for core PDF fonts
    return str(s).encode("latin-1", "replace").decode("latin-1")

def handler(event, ctx):
    params = event.get("queryStringParameters") or {}
    doc_id = params.get("doc_id")
    if not doc_id:
        return _json(400, {"error": "doc_id required"})
    doc = docs_t.get_item(Key={"doc_id": doc_id}).get("Item")
    if not doc:
        return _json(404, {"error": "not found"})
    t = types_t.get_item(Key={"type_id": doc["type_id"]}).get("Item", {})

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(0, 14, _l(t.get("name", doc["type_id"])), ln=1)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(110, 110, 110)
    pdf.cell(0, 7, "TrustMint verified document", ln=1)
    pdf.ln(6)
    pdf.set_text_color(25, 25, 25)
    pdf.set_font("Helvetica", "", 13)
    for k, v in doc.get("payload", {}).items():
        if isinstance(v, list): v = ", ".join(v)
        pdf.cell(0, 9, _l(f"{k.capitalize()}: {v}"), ln=1)
    pdf.ln(6)
    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(130, 130, 130)
    pdf.multi_cell(0, 5, _l("Serial: " + doc["qr_hash"]))

    # draw the QR from its module matrix (no image library needed)
    qr = segno.make(doc["qr_hash"], error="m")
    matrix = list(qr.matrix)
    n = len(matrix)
    box, x0, y0 = 55.0, 135, 22
    cell = box / n
    pdf.set_fill_color(0, 0, 0)
    for r, row in enumerate(matrix):
        for c, val in enumerate(row):
            if val:
                pdf.rect(x0 + c * cell, y0 + r * cell, cell, cell, "F")

    out = bytes(pdf.output())
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/pdf",
                    "Content-Disposition": f'inline; filename="trustmint-{doc_id[:8]}.pdf"',
                    "Access-Control-Allow-Origin": "*"},
        "body": base64.b64encode(out).decode(),
        "isBase64Encoded": True,
    }

def _json(code, obj):
    return {"statusCode": code,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps(obj)}
