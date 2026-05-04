# Lesson 03: Sensitive Data Exposure

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates sensitive data exposure in DVSA receipt or storage workflows. Information that should remain private can become visible through API output, generated links, logs, or S3 object access.

## Part 2) Why This Works / Root Cause

The root cause is weak authorization and data minimization around receipt-related data. If the backend exposes receipt content or links without checking ownership, users can access information outside their intended boundary.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Components: API Gateway, Lambda, S3 receipt objects, CloudWatch
- Evidence source: `report-source.pdf` and redacted response notes

## Part 4) Reproduction Steps

1. Use the DVSA frontend to create normal receipt/order data.
2. Trigger the vulnerable receipt/data exposure path.
3. Capture the response, link, or object access evidence.
4. Redact account IDs, emails, tokens, and object identifiers before storing evidence.

## Part 5) Evidence and Proof

- `report-source.pdf` contains the Lesson 3 report evidence.
- `redacted-requests.txt` contains a sanitized response excerpt.

## Part 6) Fix Strategy / Probable Mitigation

Add ownership checks before returning receipt data or signed URLs. Keep objects private, generate short-lived access only after authorization, and avoid returning unnecessary sensitive fields.

## Part 7) Code / Config Changes

See `../../fixes/lesson-03/` for before/after remediation notes.

## Part 8) Verification After Fix

Repeat the receipt access attempt as an unauthorized user. The response should be denied or sanitized, while the owner can still access legitimate receipt data.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Sensitive Data Exposure | Users should access only their own receipt data. | Report PDF, API response, S3/receipt workflow evidence. | Owner accesses their receipt. | Sensitive receipt data/link exposed outside owner boundary. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Sensitive Data Exposure | Private data was visible without sufficient authorization. | Security-relevant misuse | Ownership checks and private signed access. | Unauthorized access is denied or sanitized. |

## Part 10) Takeaway / Lessons Learned

Sensitive data controls must be enforced where data leaves the backend, not only where it is stored.
