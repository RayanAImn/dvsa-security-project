# Lesson 4: Insecure Cloud Configuration

## Vulnerability Summary
The DVSA receipts S3 bucket was misconfigured with "Block all 
public access" turned OFF. This allowed anyone to upload files 
directly into the bucket. Since Lambda automatically processes 
any .raw file placed in the date-based path, attacker-controlled 
files could enter the trusted backend receipt workflow.

## How We Proved It
- Opened CloudShell in AWS Console
- Uploaded a test file directly to the receipts bucket — it succeeded
- Uploaded a .raw file to the date path (2026/05/03/)
- A .txt file appeared automatically — Lambda had processed our file
- CloudWatch confirmed Lambda ran at the exact time of our upload

## The Fix
No code changes were needed.
The fix was a simple configuration change in the AWS Console:

1. Go to S3
2. Open dvsa-receipts-bucket
3. Click Permissions
4. Click Edit under Block public access
5. Check "Block all public access"
6. Save changes and confirm

## Verification
After the fix, we ran the upload command with --no-sign-request 
to simulate an external user. The result was AccessDenied, 
confirming that external uploads are now blocked.

## Key Takeaway
Cloud configuration is part of your security boundary.
A misconfigured S3 bucket can be just as dangerous as 
a vulnerable line of code.
