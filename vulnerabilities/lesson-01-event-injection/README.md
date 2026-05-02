# Lesson 01: Event Injection

## What the vulnerability is
Improper validation of event payloads allows malicious or unexpected event data to trigger unauthorized application behavior.

## Where it happens
Document the Lambda handler, event source, or integration point where untrusted input is accepted.

## How you reproduced it
1. Trigger the event source with a crafted payload in a lab environment.
2. Capture the original behavior before remediation.
3. Store redacted proof under `evidence-before-fix/`.

## Screenshot / log / API proof
- Add the exploit screenshot to `../../screenshots/lesson-01/`.
- Add sanitized event samples in `redacted-requests.txt`.

## What you changed
Summarize input validation, schema enforcement, allowlists, or signature checks added during remediation.

## How you verified the fix
Re-run the malicious event with the fix in place and store proof under `evidence-after-fix/`.
