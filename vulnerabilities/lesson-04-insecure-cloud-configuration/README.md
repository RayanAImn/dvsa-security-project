# Lesson 04: Insecure Cloud Configuration

## What the vulnerability is
An AWS resource is configured in a way that exposes data or functionality beyond the intended trust boundary.

## Where it happens
Document the affected AWS service, resource, and misconfiguration.

## How you reproduced it
1. Inspect the misconfigured resource in the lab account.
2. Demonstrate the unsafe behavior with redacted screenshots or CLI output.
3. Store proof under `evidence-before-fix/`.

## Screenshot / log / API proof
- Add console or CLI screenshots in `../../screenshots/lesson-04/`.
- Add sanitized commands or requests in `redacted-requests.txt`.

## What you changed
Summarize the IAM, bucket policy, encryption, network, or service-level changes applied.

## How you verified the fix
Demonstrate the resource now enforces the intended security boundary.
