# Lesson 09: Vulnerable Dependencies

## What the vulnerability is
A package, library, or transitive dependency contains a known vulnerability that affects the DVSA deployment or supporting code.

## Where it happens
Document the package name, version, and affected component.

## How you reproduced it
1. Generate a dependency inventory or scan output.
2. Record the vulnerable package and advisory reference.
3. Save proof in `evidence-before-fix/`.

## Screenshot / log / API proof
- Add scan output screenshots in `../../screenshots/lesson-09/`.
- Add the redacted dependency record in `redacted-requests.txt`.

## What you changed
Describe the upgraded version, package removal, or compensating control.

## How you verified the fix
Re-run the scan and show the advisory is no longer present.
