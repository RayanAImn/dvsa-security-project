# Lesson 07: Over-Privileged Function

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates an over-privileged Lambda execution role. The affected function is `DVSA-SEND-RECEIPT-EMAIL`, whose role originally included permissions broader than the receipt-email workflow requires. In serverless applications, excessive IAM permissions increase blast radius because any code running inside the function inherits the role's temporary credentials.

## Part 2) Why This Works / Root Cause

Lambda functions run with execution-role credentials provided by AWS. If a function role allows broad access, a compromised or abused function can perform every action allowed by that role, even when those actions are unrelated to the function's intended purpose. The root cause is failure to apply least privilege to IAM actions and resources.

## Part 3) Environment and Setup

- Region: `us-east-1`
- Function: `DVSA-SEND-RECEIPT-EMAIL`
- AWS services involved: Lambda, IAM, SES, S3, DynamoDB, CloudWatch, IAM Policy Simulator
- Evidence sources: Lambda function page, execution role page, attached policy screenshots, policy simulator screenshots, normal order workflow screenshots
- Sensitive values: AWS account IDs, role suffixes, ARNs, and credentials are redacted where needed

## Part 4) Reproduction Steps

1. Open AWS Lambda and search for `DVSA-SEND-RECEIPT-EMAIL`.
2. Open the function permissions tab and follow the execution role link.
3. Review attached policies for broad actions such as `ses:*` or wildcard resources.
4. Open IAM Policy Simulator and select the receipt function role.
5. Simulate representative actions for SES, S3, and DynamoDB.
6. Record which actions are allowed before the fix.
7. Replace broad policies with least-privilege permissions.
8. Re-run the simulator and confirm unnecessary actions are denied.
9. Run the normal DVSA order workflow to confirm legitimate receipt behavior still works.

## Part 5) Evidence and Proof

Evidence is stored in `../../screenshots/lesson-07/`.

- `Screenshot 7.1.1`: `DVSA-SEND-RECEIPT-EMAIL` Lambda function page.
- `Screenshot 7.2`: Lambda execution role page.
- `Screenshot 7.3B`: `AmazonSESFullAccess` policy before fix.
- `Screenshot 7.4A` and `Screenshot 7.5`: simulator checks for S3 and DynamoDB actions.
- `Screenshot 7.4B`: IAM Policy Simulator showing excessive SES permissions allowed.
- `Screenshot 7.6`: post-fix SES permission simulation.
- `Screenshot 7.7.2`: normal order workflow still works after IAM fix.
- `../../diagrams/lesson-07-blast-radius.png`: blast-radius diagram for the over-privileged execution role.

## Part 6) Fix Strategy / Probable Mitigation

The fix belongs in the Lambda execution role. Broad managed policies and wildcard resource permissions should be removed. The replacement policy should allow only the actions required for the receipt workflow, such as CloudWatch logging and the minimum SES send actions scoped to the verified sender/identity where possible.

## Part 7) Code / Config Changes

The documented IAM changes are stored in `../../fixes/lesson-07/`.

- `before-policy.json`: redacted example of broad pre-fix permissions.
- `after-policy.json`: redacted least-privilege target policy.
- `explanation.md`: remediation explanation and verification notes.

## Part 8) Verification After Fix

After applying the least-privilege policy:

1. Re-run IAM Policy Simulator checks for unnecessary SES, S3, and DynamoDB actions.
2. Confirm broad or unrelated actions are denied.
3. Confirm the normal order/receipt workflow still works.

`Screenshot 7.6` and `Screenshot 7.7.2` document the post-fix verification.

## Part 9) Structured Operation and Security Analysis

### Table A

| Vulnerability | Intended Rule(s) | Artifacts Used to Infer Rule | Normal Behavior Evidence | Exploit Behavior Evidence |
|---|---|---|---|---|
| Lesson 07: Over-Privileged Function | The receipt email function should have only the AWS permissions required to send receipts and write logs. | Lambda permissions page, IAM role policies, IAM Policy Simulator, normal order workflow. | Normal order workflow works after IAM change. | Broad SES permission evidence and simulator results showing excessive permissions. |

### Table B

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied (Where) | Post-Fix Verification |
|---|---|---|---|---|
| Lesson 07: Over-Privileged Function | The role allowed actions broader than the receipt workflow required, increasing blast radius if the function was abused. | Accidental misconfiguration | Replace broad execution-role permissions with least-privilege IAM policy on `DVSA-SEND-RECEIPT-EMAIL`. | IAM Policy Simulator checks plus normal order workflow after fix. |

## Part 10) Takeaway / Lessons Learned

In serverless systems, the function role is the security boundary for backend service access. Least privilege reduces blast radius so a single function issue does not become broad access to unrelated AWS services.
