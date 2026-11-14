"""Validate the checked-in World Language JSON Schema and its independent fixtures."""
import json
from pathlib import Path

from jsonschema import Draft202012Validator


def main():
    root = Path(__file__).resolve().parents[1]
    folder = root / "contracts" / "v0.1"
    schema = json.loads((folder / "command.schema.json").read_text(encoding="utf-8"))
    fixtures = json.loads((folder / "fixtures.json").read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    failed = []
    for case in fixtures["cases"]:
        ok = validator.is_valid(case["command"]) == case["valid"]
        print(f"{'PASS' if ok else 'FAIL'} {case['name']}")
        if not ok:
            failed.append(case["name"])
    if failed:
        raise SystemExit(1)
    print(f"{len(fixtures['cases'])} fixture cases passed")


if __name__ == "__main__":
    main()
