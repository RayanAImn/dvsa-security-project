# Lesson 03: Sensitive Data Exposure

## What the vulnerability is
Sensitive data is exposed in API responses, logs, storage locations, or client-visible output without proper masking, encryption, or access restriction.

## Where it happens
Document the affected endpoint, storage object, or logging path.

## How you reproduced it
1. Access the vulnerable feature using a lab account.
2. Capture the exposed data with all sensitive values redacted.
3. Save proof under `evidence-before-fix/`.

## Screenshot / log / API proof
- Add screenshots in `../../screenshots/lesson-03/`.
- Add redacted response samples in `redacted-requests.txt`.

## What you changed
Describe masking, encryption, response filtering, or storage hardening applied.

## How you verified the fix
Confirm the data is no longer exposed and store proof under `evidence-after-fix/`.
