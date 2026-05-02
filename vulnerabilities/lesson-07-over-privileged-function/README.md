# Lesson 07: Over-Privileged Function

## What the vulnerability is
An IAM role, Lambda execution policy, or service permission grants broader access than required, increasing blast radius.

## Where it happens
Document the function and attached permissions or policy statement.

## How you reproduced it
1. Review the effective permissions.
2. Demonstrate a lab-only action that should not have been possible.
3. Store proof in `evidence-before-fix/`.

## Screenshot / log / API proof
- Add screenshots in `../../screenshots/lesson-07/`.
- Add sanitized policy references in `redacted-requests.txt`.

## What you changed
Summarize least-privilege policy updates, narrowed resources, or denied actions.

## How you verified the fix
Show the unauthorized action is blocked and that the intended function behavior still works.
