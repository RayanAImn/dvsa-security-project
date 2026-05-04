# Lesson 04: Insecure Cloud Configuration

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates insecure AWS S3 configuration in the DVSA receipt workflow. A bucket or object-processing path is configured too permissively, allowing untrusted files to enter a trusted backend process.

## Part 2) Why This Works / Root Cause

The root cause is weak S3 public-access/bucket-policy configuration combined with Lambda processing that trusts bucket contents. If unauthorized users can place objects where Lambda expects application-generated receipts, the backend processes untrusted input.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Components: S3 receipts bucket and `DVSA-SEND-RECEIPT-EMAIL`
- Evidence: imported DOCX report and extracted screenshots in `../../screenshots/lesson-04/from-report/`

## Part 4) Reproduction Steps

1. Inspect S3 public access, bucket policy, and ACL settings.
2. Upload or attempt to upload a controlled `.raw` receipt-like object.
3. Observe Lambda/backend processing behavior.
4. Capture S3 and Lambda evidence.

## Part 5) Evidence and Proof

- `report-source.docx` contains the full imported Lesson 4 report.
- `../../screenshots/lesson-04/from-report/` contains extracted report screenshots.
- `redacted-requests.txt` stores a sanitized AWS CLI pattern.

## Part 6) Fix Strategy / Probable Mitigation

Enable Block Public Access, restrict bucket policy and ACLs, validate object keys/types, and ensure only trusted application roles can write objects that trigger backend processing.

## Part 7) Code / Config Changes

See `../../fixes/lesson-04/` for the before/after configuration notes.

## Part 8) Verification After Fix

Repeat unauthorized upload/access attempts. They should fail, while the legitimate receipt workflow continues to work.

## Part 9) Structured Operation and Security Analysis

| Vulnerability | Intended Rule(s) | Artifacts Used | Normal Evidence | Exploit Evidence |
|---|---|---|---|---|
| Insecure Cloud Configuration | Only trusted roles should write receipt objects processed by Lambda. | S3 console, bucket settings, Lambda evidence, report screenshots. | Normal receipt object processing. | Untrusted object accepted or processed. |

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied | Post-Fix Verification |
|---|---|---|---|---|
| Insecure Cloud Configuration | A cloud resource allowed access beyond the trust boundary. | Accidental misconfiguration | Block Public Access and restricted bucket policy. | Unauthorized write/access fails. |

## Part 10) Takeaway / Lessons Learned

Cloud configuration is application logic in serverless systems. Misconfigured storage can become a backend attack path.
