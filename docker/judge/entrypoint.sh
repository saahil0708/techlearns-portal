#!/usr/bin/env bash
set -eu

language="${1:?language is required}"

case "$language" in
  PYTHON)
    exec python3 /workspace/solution.py
    ;;
  JAVASCRIPT)
    exec node --max-old-space-size=128 /workspace/solution.mjs
    ;;
  C)
    gcc /workspace/solution.c -O2 -o /tmp/program || exit 2
    exec /tmp/program
    ;;
  CPP)
    g++ /workspace/solution.cpp -O2 -std=c++17 -o /tmp/program || exit 2
    exec /tmp/program
    ;;
  JAVA)
    javac -d /tmp /workspace/Solution.java || exit 2
    exec java -cp /tmp Solution
    ;;
  *)
    echo "Unsupported programming language: $language" >&2
    exit 3
    ;;
esac
