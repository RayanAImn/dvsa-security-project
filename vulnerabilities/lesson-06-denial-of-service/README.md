# Lesson 06: Denial of Service

## What the vulnerability is
The system accepts input or traffic patterns that can exhaust compute, concurrency, queue capacity, or other service limits.

## Where it happens
Document the endpoint, workflow, or integration that can be abused.

## How you reproduced it
1. Use a safe lab-only test pattern.
2. Trigger the load condition conservatively.
3. Capture evidence before remediation.

## Screenshot / log / API proof
- Add CloudWatch or request proof in `../../screenshots/lesson-06/`.
- Add the test pattern in `redacted-requests.txt`.

## What you changed
Summarize throttling, validation, concurrency control, rate limiting, or queue protection applied.

## How you verified the fix
Repeat the same controlled test and show the service now degrades safely or blocks abuse.
