# Lesson 02: Broken Authentication

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates broken JWT authentication in the DVSA order workflow. The backend trusts identity claims from a token payload without properly verifying that the token is authentic and unmodified, allowing user impersonation.

## Part 2) Why This Works / Root Cause

A JWT payload can be decoded and edited by a client. If the backend uses `username` or `sub` claims without validating the signature, issuer, audience, and expiry, an attacker can forge identity fields and access another user's order data.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Endpoint: `/dvsa/order`
- Users: attacker user and victim user in the DVSA lab
- Evidence: imported DOCX report and extracted screenshots in `../../screenshots/lesson-02/from-report/`

## Part 4) Reproduction Steps

1. Create two lab users and place orders for each.
2. Capture the attacker's JWT from browser DevTools.
3. Capture or decode the victim identity claim.
4. Modify the attacker's token payload to use the victim identity.
5. Send the forged request to the order API.
6. Observe unauthorized access to the victim's order data.

## Part 5) Evidence and Proof

- `report-source.docx` contains the full imported Lesson 2 report.
- `../../screenshots/lesson-02/from-report/` contains extracted screenshots from that report.
- `redacted-requests.txt` stores the sanitized request pattern.

## Part 6) Fix Strategy / Probable Mitigation

Verify JWT signature and trusted claims server-side before using any identity fields. Reject tokens with invalid signatures, wrong issuer/audience, expired timestamps, or missing trusted subject.

## Part 7) Code / Config Changes

See `../../fixes/lesson-02/` for redacted before/after order-manager authentication examples.

## Part 8) Verification After Fix

Repeat the forged-token request. It should be rejected, while a valid token should still return only the authenticated user's own orders.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Broken Authentication | Backend must verify JWT integrity before trusting identity claims. | DevTools token capture, decoded JWT claims, API response screenshots. | User sees only their own order data. | Forged token accesses another user's order. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Broken Authentication | Caller-controlled identity claims were trusted as proof of identity. | Intentional misuse / security-relevant abuse | JWT signature and claim verification. | Forged token is rejected. |

## Part 10) Takeaway / Lessons Learned

Authentication must be proven, not decoded. A JWT is not trustworthy until the backend verifies its signature and required claims.
