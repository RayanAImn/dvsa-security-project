# Lesson 07 Fix Explanation

The remediation replaces broad execution-role permissions with a least-privilege policy for the receipt email workflow. The pre-fix role had broad SES permissions and representative wildcard S3/DynamoDB access patterns that would increase blast radius if the function were abused.

The post-fix policy keeps only the minimum receipt-email and logging permissions. IAM Policy Simulator evidence should show that unrelated S3, DynamoDB, and SES administrative actions are denied, while the normal DVSA order workflow still works.
