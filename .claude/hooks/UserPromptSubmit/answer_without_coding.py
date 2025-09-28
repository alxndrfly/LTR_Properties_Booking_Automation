#!/usr/bin/env python3
"""
Append a concise instruction when the prompt ends with -s
"""

import json, sys

def main() -> None:
    try:
        data = json.load(sys.stdin)
        prompt = data.get("prompt", "")
        if prompt.rstrip().endswith("-s"):
            print("Answer without coding. Keep it simple and to the point.")
        sys.exit(0)
    except Exception as e:
        print(f"answer_in_short error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
