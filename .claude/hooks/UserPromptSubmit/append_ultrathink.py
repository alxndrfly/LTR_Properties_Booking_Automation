#!/usr/bin/env python3
"""
Append an 'ultra think' instruction when the prompt ends with -deep
"""

import json, sys

def main() -> None:
    try:
        data = json.load(sys.stdin)
        prompt = data.get("prompt", "")
        if prompt.rstrip().endswith("-u"):
            print("\nultrathink. answer in short. keep it simple.")
        sys.exit(0)
    except Exception as e:
        print(f"append_ultrathink error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
