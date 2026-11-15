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
    continuity = json.loads((folder / "continuity-fixtures.json").read_text(encoding="utf-8"))
    count = 0
    for suite in continuity["suites"]:
        schema = json.loads((folder / suite["schema"]).read_text(encoding="utf-8"))
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema)
        for case in suite["cases"]:
            ok = validator.is_valid(case["value"]) == case["valid"]
            print(f"{'PASS' if ok else 'FAIL'} {case['name']}")
            count += 1
            if not ok:
                failed.append(case["name"])
    if failed:
        raise SystemExit(1)
    print(f"{count} continuity fixture cases passed")


if __name__ == "__main__":
    main()
