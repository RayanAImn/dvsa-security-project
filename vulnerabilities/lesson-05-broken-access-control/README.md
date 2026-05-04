# Lesson 05: Broken Access Control

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates broken access control in the DVSA administrative order-update workflow. A normal user can influence privileged order state behavior that should be restricted to authorized administrative logic.

## Part 2) Why This Works / Root Cause

The backend accepts a valid user context but does not enforce the required role or group before reaching sensitive functionality. IAM invoke permissions may also be broader than needed, allowing public-facing code paths to reach internal admin functions.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Components: order API, admin order update Lambda, JWT claims, Lambda invoke permissions
- Evidence: imported DOCX report and extracted screenshots in `../../screenshots/lesson-05/from-report/`

## Part 4) Reproduction Steps

1. Create an order as a normal lab user.
2. Capture the user token and target order ID.
3. Send the crafted update/invoke request toward the admin update path.
4. Observe unauthorized order status modification.

## Part 5) Evidence and Proof

- `report-source.docx` contains the full imported Lesson 5 report.
- `../../screenshots/lesson-05/from-report/` contains extracted report screenshots.
- `redacted-requests.txt` stores a sanitized request example.

## Part 6) Fix Strategy / Probable Mitigation

Enforce admin role/group checks server-side before privileged updates. Restrict Lambda invoke permissions so public functions cannot invoke arbitrary internal functions.

## Part 7) Code / Config Changes

See `../../fixes/lesson-05/` for before/after remediation notes.

## Part 8) Verification After Fix

Repeat the normal-user privileged update attempt. The action should be denied, while normal order creation and billing should still work.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Broken Access Control | Only authorized admin workflow may update privileged order state. | JWT claims, API request, Lambda behavior, report screenshots. | Normal user creates an order. | Normal user changes privileged order state. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Broken Access Control | A non-admin reached admin behavior. | Intentional misuse / security-relevant abuse | Admin role checks and narrowed invoke permissions. | Unauthorized update is denied. |

## Part 10) Takeaway / Lessons Learned

Authentication only proves who the caller is. Authorization must still decide what that caller may do.
