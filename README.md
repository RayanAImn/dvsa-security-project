# ICS-344 DVSA Vulnerability Discovery and Remediation

## Project Overview
This repository contains the documentation, evidence, fixes, and verification steps for the DVSA security project. It is organized so a grader can quickly find the report, slide deck, vulnerability evidence, remediation artifacts, and reproduction notes for each lesson.

## Environment
- DVSA deployment: AWS SAR
- Region: us-east-1
- Frontend: S3 Website URL
- Backend: API Gateway + Lambda
- Data services: DynamoDB, S3, SQS/SES
- Monitoring: CloudWatch / CloudTrail

## Important Security Note
All tokens, AWS account IDs, emails, URLs, and credentials are redacted. This repository intentionally uses placeholder values such as:

```env
AWS_ACCESS_KEY_ID=REDACTED
AWS_SECRET_ACCESS_KEY=REDACTED
AWS_SESSION_TOKEN=REDACTED
Authorization: Bearer <REDACTED_JWT>
https://<api-id>.execute-api.us-east-1.amazonaws.com/Stage/order
123456789012 -> <ACCOUNT_ID>
```

## Repository Structure
- `report/`: final report PDF and editable LaTeX source.
- `presentation/`: slide deck export and presentation source material.
- `vulnerabilities/`: lesson-by-lesson documentation, evidence, requests, and notes.
- `fixes/`: before/after code or configuration snapshots with explanations.
- `scripts/`: reproducibility and verification helpers for a lab-only DVSA deployment.
- `screenshots/`: exploit and post-fix verification screenshots grouped by lesson.
- `diagrams/`: architecture, sequence, and blast-radius visuals.
- `.gitignore`: prevents accidental commits of secrets, environment files, and transient artifacts.

## Vulnerability Coverage
| Lesson | Vulnerability | Status | Evidence | Fix |
|---|---|---|---|---|
| 1 | Event Injection | Done | `screenshots/lesson-01` | `fixes/lesson-01` |
| 2 | Broken Authentication | Done | `screenshots/lesson-02` | `fixes/lesson-02` |
| 3 | Sensitive Data Exposure | Done | `screenshots/lesson-03` | `fixes/lesson-03` |
| 4 | Insecure Cloud Configuration | Done | `screenshots/lesson-04` | `fixes/lesson-04` |
| 5 | Broken Access Control | Done | `screenshots/lesson-05` | `fixes/lesson-05` |
| 6 | Denial of Service | Done | `screenshots/lesson-06` | `fixes/lesson-06` |
| 7 | Over-Privileged Function | Done | `screenshots/lesson-07` | `fixes/lesson-07` |
| 8 | Logic Vulnerabilities | Done | `screenshots/lesson-08` | `fixes/lesson-08` |
| 9 | Vulnerable Dependencies | Done | `screenshots/lesson-09` | `fixes/lesson-09` |
| 10 | Unhandled Exceptions | Done | `screenshots/lesson-10` | `fixes/lesson-10` |

## How to Reproduce
1. Deploy DVSA in a non-production AWS account.
2. Use `us-east-1`.
3. Follow the report and the relevant `vulnerabilities/lesson-*` folder for each lesson.
4. Run the helper scripts only inside your own DVSA lab environment.
5. Replace placeholder values with your own redacted lab values before submission.

## Report and Slides
- Report: `report/final-report.pdf`
- Slides: `presentation/slides.pdf`

## Quick Start for the Grader
1. Read `report/final-report.pdf` for the narrative summary.
2. Open the lesson folder under `vulnerabilities/` for the full reproduction path.
3. Compare the relevant artifacts under `fixes/`.
4. Review screenshots and diagrams for proof of exploitation and verification.
5. Use the shell scripts only in a disposable lab account.
