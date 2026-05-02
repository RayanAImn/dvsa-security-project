# Lesson 10: Unhandled Exceptions

## What the vulnerability is
Application errors are not handled safely, which can expose stack traces, internal details, or unstable runtime behavior to users.

## Where it happens
Document the failing endpoint, function, or data path.

## How you reproduced it
1. Trigger the error condition safely in a lab environment.
2. Capture the raw failure response with sensitive values redacted.
3. Store proof under `evidence-before-fix/`.

## Screenshot / log / API proof
- Add screenshots in `../../screenshots/lesson-10/`.
- Add redacted triggering inputs in `redacted-requests.txt`.

## What you changed
Summarize input validation, exception handling, and safe error response improvements.

## How you verified the fix
Show the same input now returns a controlled, non-sensitive error.
