# Lesson 08: Logic Vulnerabilities

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates a business logic race condition in the DVSA order workflow. Billing and order update operations can be submitted close together, causing the final order state to differ from what was actually billed.

## Part 2) Why This Works / Root Cause

The root cause is a non-atomic read/check/write sequence. If billing checks an order before an update commits, and the update changes relevant fields during the timing window, the backend can process inconsistent state.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Components: `DVSA-ORDER-BILLING`, `DVSA-ORDER-UPDATE`, DynamoDB order table
- Evidence: imported DOCX report and extracted screenshots in `../../screenshots/lesson-08/from-report/`

## Part 4) Reproduction Steps

1. Create an order with a known quantity and price.
2. Submit billing and update requests close together.
3. Observe whether the order state or quantity changes after billing begins.
4. Compare the charged amount to the final order state.

## Part 5) Evidence and Proof

- `report-source.docx` contains the full imported Lesson 8 report.
- `../../screenshots/lesson-08/from-report/` contains extracted report screenshots.
- `redacted-requests.txt` stores a sanitized workflow request.

## Part 6) Fix Strategy / Probable Mitigation

Use DynamoDB conditional writes or transactions for order transitions. Lock or reject updates once billing begins.

## Part 7) Code / Config Changes

See `../../fixes/lesson-08/` for before/after state-management notes.

## Part 8) Verification After Fix

Repeat the timing test. One operation should succeed cleanly and the conflicting operation should be rejected.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Logic Race Condition | Billing and order updates must preserve one consistent order state. | API requests, DynamoDB state, report screenshots. | Normal order billing follows expected state transition. | Concurrent timing changes final state after billing check. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Logic Race Condition | State changed in a timing window that billing trusted. | Intentional misuse / security-relevant abuse | Conditional writes/transactions and update lock. | Conflicting operation rejected. |

## Part 10) Takeaway / Lessons Learned

Security also includes workflow correctness. Valid requests can become unsafe when the application allows the wrong timing or sequence.
