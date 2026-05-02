# Lesson 02: Broken Authentication

## What the vulnerability is
Weak or incomplete authentication checks allow a user to impersonate another user, bypass session validation, or access protected operations with invalid credentials.

## Where it happens
Document the affected login, order, or identity handling path in the DVSA backend.

## How you reproduced it
1. Capture a normal authenticated flow.
2. Modify the token, session, or identity context with redacted values.
3. Show the vulnerable endpoint still accepts the request before the fix.

## Screenshot / log / API proof
- Add screenshots in `../../screenshots/lesson-02/`.
- Add request examples in `redacted-requests.txt`.
- Store sanitized logs in `evidence-before-fix/`.

## What you changed
Summarize the authentication validation, token verification, or session hardening implemented.

## How you verified the fix
Repeat the same request with the patched version and record the rejection in `evidence-after-fix/`.
