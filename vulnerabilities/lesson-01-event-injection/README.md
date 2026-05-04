# Lesson 01: Event Injection

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates event injection in the DVSA order API path. The affected component is the API Gateway to Lambda request-processing workflow. A crafted event payload can make backend code treat attacker-controlled content as executable behavior instead of plain data.

## Part 2) Why This Works / Root Cause

The root cause is unsafe deserialization or dynamic handling of user-controlled input. If a dependency or handler accepts serialized functions or evaluates data as code, the Lambda runtime can execute unintended logic before normal validation finishes.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Entry point: `/dvsa/order`
- Backend: order Lambda workflow
- Evidence source: `report-source.pdf`, CloudWatch log proof, and redacted request payload

## Part 4) Reproduction Steps

1. Locate the API Gateway invoke URL and append `/order`.
2. Send a crafted JSON payload containing the event-injection marker in the lab environment.
3. Observe that the client may receive a generic internal error.
4. Open CloudWatch logs for the order function.
5. Confirm backend-side execution evidence in the logs.

## Part 5) Evidence and Proof

- `report-source.pdf` contains the Lesson 1/9 evidence package.
- `redacted-requests.txt` stores the sanitized payload shape.
- CloudWatch is the primary proof source because the API response may hide backend execution behind a generic error.

## Part 6) Fix Strategy / Probable Mitigation

Remove unsafe deserialization, parse requests as strict JSON, and validate all fields against an allowlisted schema. User input must never be evaluated as code.

## Part 7) Code / Config Changes

See `../../fixes/lesson-01/` for before/after behavior notes.

## Part 8) Verification After Fix

Repeat the crafted payload. The fixed backend should reject it as invalid input and CloudWatch should not show injected code execution.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Event Injection | Request data must remain data and must not execute inside Lambda. | API payload, CloudWatch logs, report-source PDF. | Normal order request follows the expected handler path. | Crafted event produces backend execution evidence. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Event Injection | The backend executed behavior derived from request data. | Intentional misuse / security-relevant abuse | Safe JSON parsing and schema validation. | Crafted payload is rejected without backend execution. |

## Part 10) Takeaway / Lessons Learned

Serverless functions still execute normal application code with cloud permissions. Unsafe parsing can turn a simple API request into backend code execution, so input must be treated strictly as data.
