#!/usr/bin/env bash
set -euo pipefail

echo "[*] DVSA lab setup checklist"
echo "1. Confirm you are using a non-production AWS account."
echo "2. Confirm region is us-east-1."
echo "3. Confirm all screenshots, logs, and requests are redacted."
echo "4. Confirm no real secrets exist in the repository."
echo "5. Confirm lesson artifacts map to the README coverage table."
