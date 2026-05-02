# Lesson 05: Broken Access Control

## What the vulnerability is
Authorization rules are missing or incorrectly enforced, allowing a user to access or modify data that should belong to another user or role.

## Where it happens
Document the endpoint, object, or function where the authorization check fails.

## How you reproduced it
1. Access a resource using one identity.
2. Switch identifiers or roles with redacted values.
3. Show unauthorized access succeeds before the fix.

## Screenshot / log / API proof
- Add screenshots in `../../screenshots/lesson-05/`.
- Add redacted examples in `redacted-requests.txt`.

## What you changed
Describe owner checks, role validation, or policy enforcement added.

## How you verified the fix
Show the same unauthorized action is denied after the fix.
