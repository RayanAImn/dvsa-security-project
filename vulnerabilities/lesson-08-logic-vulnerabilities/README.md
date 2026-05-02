# Lesson 08: Logic Vulnerabilities

## What the vulnerability is
Application behavior permits an unintended state transition or business action even though authentication and authorization may appear correct.

## Where it happens
Document the affected business workflow and state transitions.

## How you reproduced it
1. Perform the expected workflow once.
2. Alter the request order, quantities, or state values with redacted inputs.
3. Capture the unintended result before remediation.

## Screenshot / log / API proof
- Add screenshots in `../../screenshots/lesson-08/`.
- Add redacted examples in `redacted-requests.txt`.

## What you changed
Describe the business rule enforcement or state validation added.

## How you verified the fix
Show the invalid workflow is now rejected while the valid workflow still succeeds.
