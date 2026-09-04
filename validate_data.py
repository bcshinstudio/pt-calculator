from pathlib import Path
import csv, json, math, sys

root = Path(__file__).resolve().parent
data = root / "data"
manifest = json.loads((data/"refrigerants.json").read_text())

errors = []
for r in manifest:
    if not r.get("available"):
        continue
    path = data/r["file"]
    if not path.exists():
        errors.append(f"{r['id']}: missing CSV")
        continue
    rows = list(csv.DictReader(path.open()))
    if len(rows) != 101:
        errors.append(f"{r['id']}: expected 101 rows, got {len(rows)}")
        continue
    temps = [float(x["temperature_f"]) for x in rows]
    if temps[0] != -50 or temps[-1] != 150:
        errors.append(f"{r['id']}: wrong range")
    if any(abs((temps[i+1]-temps[i])-2) > 1e-9 for i in range(len(temps)-1)):
        errors.append(f"{r['id']}: temperature steps are not 2°F")
    pcols = ["pressure_psig"] if "pressure_psig" in rows[0] else ["bubble_psig","dew_psig"]
    for col in pcols:
        ps = [float(x[col]) for x in rows]
        if any(ps[i+1] < ps[i] for i in range(len(ps)-1)):
            errors.append(f"{r['id']}: {col} decreases unexpectedly")

# Anchor checks from the same source after unit conversion.
checks = [
    ("R22", 120, "pressure_psig", 17.93*14.503773773),
    ("R404A", 40, "dew_psig", 5.89*14.503773773),
    ("R404A", 40, "bubble_psig", 5.98*14.503773773),
    ("R134a", 100, "pressure_psig", 8.57*14.503773773),
]
for rid,t,col,expected in checks:
    rows = list(csv.DictReader((data/f"{rid}.csv").open()))
    row = next((x for x in rows if float(x["temperature_f"]) == t), None)
    if row is None or abs(float(row[col])-expected) > 0.02:
        errors.append(f"{rid} {t}F {col}: anchor mismatch")

if errors:
    print("VALIDATION FAILED")
    for e in errors: print(" -", e)
    sys.exit(1)
print("VALIDATION PASSED")
print("Verified refrigerants:", ", ".join(r["id"] for r in manifest if r.get("available")))
