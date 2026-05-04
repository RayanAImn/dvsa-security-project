# Lesson 4: Insecure Cloud Configuration

## Vulnerability Summary

The DVSA receipts S3 bucket was misconfigured with public access controls that allowed unintended writes. Because receipt objects placed in the date-based path are processed by Lambda, attacker-controlled `.raw` files could enter a trusted backend workflow.

This is an AWS cloud-configuration issue, not a frontend issue. The security boundary belongs in S3 bucket permissions, bucket policy, and the Lambda trigger path.

## How We Proved It

- Opened CloudShell in the AWS Console.
- Uploaded a test file directly to the receipts bucket.
- Uploaded a `.raw` file to the date-based receipt path.
- Observed that a `.txt` output file appeared automatically.
- Confirmed in CloudWatch that the receipt-processing Lambda ran at the same time as the upload.

## Fix Applied

No application code change was required. The fix was applied in S3 configuration:

1. Open the receipts bucket in S3.
2. Go to **Permissions**.
3. Enable **Block all public access**.
4. Save and confirm the permission change.
5. Confirm the bucket policy does not allow public or unintended uploads.

The Lambda should only process objects created by the legitimate application workflow, not arbitrary objects uploaded by unauthenticated or unauthorized users.

## Verification

After the fix, the upload test was repeated with `--no-sign-request` to simulate an external unauthenticated user. The request returned `AccessDenied`, confirming that public uploads were blocked.

The normal application receipt workflow should still be tested after the change to confirm the fix did not break legitimate receipt generation.

## Key Takeaway

Cloud configuration is part of the security boundary. A misconfigured S3 bucket can be as dangerous as a vulnerable line of application code.
