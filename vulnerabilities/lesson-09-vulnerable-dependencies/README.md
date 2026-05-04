# Lesson 09: Vulnerable Dependencies

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates how an unsafe dependency can create backend risk in DVSA. The affected component is the Node.js Lambda dependency path used during request processing.

## Part 2) Why This Works / Root Cause

The vulnerable dependency accepts or enables dangerous deserialization behavior. If dependency versions are not reviewed, pinned, and scanned, the application may inherit known unsafe behavior even when the surrounding code appears simple.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Components: Node.js Lambda package and order request processing
- Evidence source: `report-source.pdf`, dependency notes, and Lesson 1 execution evidence

## Part 4) Reproduction Steps

1. Identify the vulnerable dependency in the Lambda package.
2. Relate the package behavior to the event injection payload.
3. Demonstrate the unsafe behavior in the controlled lab.
4. Record the vulnerable package and remediation path.

## Part 5) Evidence and Proof

- `report-source.pdf` contains the Lesson 1/9 evidence package.
- `redacted-requests.txt` contains the sanitized dependency record.

## Part 6) Fix Strategy / Probable Mitigation

Remove or replace unsafe packages, pin reviewed versions, and add dependency scanning to the build/deploy process.

## Part 7) Code / Config Changes

See `../../fixes/lesson-09/` for before/after dependency remediation notes.

## Part 8) Verification After Fix

Repeat the injection payload and dependency scan. The payload should no longer execute, and the risky dependency should be absent or remediated.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Vulnerable Dependencies | Dependencies must not evaluate attacker-controlled request data. | Package inventory, report PDF, CloudWatch evidence. | Safe packages parse data only. | Unsafe dependency enables event injection behavior. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Vulnerable Dependencies | A third-party package introduced unsafe execution behavior. | Accidental misconfiguration / maintenance issue | Remove/replace dependency and scan. | Payload rejected and dependency scan clean. |

## Part 10) Takeaway / Lessons Learned

Dependencies are part of the attack surface. Secure code can still fail if unsafe packages are deployed with it.
