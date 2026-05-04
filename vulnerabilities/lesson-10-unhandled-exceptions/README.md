# Lesson 10: Unhandled Exceptions

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates unsafe exception handling in the DVSA order API. Malformed input can trigger backend exceptions that expose implementation details to the client.

## Part 2) Why This Works / Root Cause

The backend assumes required fields exist and does not catch exceptions at the handler boundary. As a result, errors can leak exception names, file paths, line numbers, or stack details.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Endpoint: `/dvsa/order`
- Components: API Gateway and affected Lambda handler
- Evidence: imported DOCX report and extracted screenshots in `../../screenshots/lesson-10/from-report/`

## Part 4) Reproduction Steps

1. Capture a normal order API request.
2. Remove or alter required fields in a controlled malformed request.
3. Send the request to the API.
4. Observe the error response and redact any sensitive details.

## Part 5) Evidence and Proof

- `report-source.docx` contains the full imported Lesson 10 report.
- `../../screenshots/lesson-10/from-report/` contains extracted report screenshots.
- `redacted-requests.txt` stores the sanitized malformed request shape.

## Part 6) Fix Strategy / Probable Mitigation

Validate input before processing and add centralized error handling that returns generic client-safe messages while logging details internally.

## Part 7) Code / Config Changes

See `../../fixes/lesson-10/` for before/after safe error handling notes.

## Part 8) Verification After Fix

Repeat the malformed request. The client should receive a controlled safe error, and detailed diagnostics should remain only in CloudWatch.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Unhandled Exceptions | Client errors must not expose backend internals. | API response, report screenshots, CloudWatch behavior. | Normal request returns expected data. | Malformed request reveals file/path/error detail. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Unhandled Exceptions | Diagnostic details were returned to the caller. | Accidental implementation issue | Input validation and centralized exception handling. | Generic safe error returned. |

## Part 10) Takeaway / Lessons Learned

Errors are part of the public interface. Backend details belong in logs, not in client responses.
