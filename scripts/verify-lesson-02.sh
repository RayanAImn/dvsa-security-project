#!/usr/bin/env bash
set -euo pipefail

API_URL="${1:-https://<api-id>.execute-api.us-east-1.amazonaws.com/Stage}"
TOKEN="${2:-<REDACTED_JWT>}"

echo "[*] Verifying lesson 02 remediation against: ${API_URL}"
echo "[*] Using redacted token placeholder unless overridden."

curl -i \
  -H "Authorization: Bearer ${TOKEN}" \
  "${API_URL}/order"

echo
echo "[*] Expected result after fix: unauthorized or denied access for invalid session data."
