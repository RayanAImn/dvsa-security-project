# DVSA Project Completeness Audit

This audit is based on the project guidelines in `project_description/Project Description.pdf` and `project_description/Helper Guide.pdf`.

## Required structure from the guideline

Each vulnerability should include:

1. Goal and vulnerability summary.
2. Root cause.
3. Environment and setup.
4. Reproduction steps.
5. Evidence and proof.
6. Fix strategy or probable mitigation.
7. Code/config changes.
8. Verification after fix.
9. Structured operation and security analysis tables.
10. Takeaway / lessons learned.

Deliverables should include a written report PDF, presentation slides, GitHub repository, screenshots/evidence, fixes, and demo video.

## Lesson 6 status

- `vulnerabilities/lesson-06-denial-of-service/README.md` now follows the required 10-part structure.
- `redacted-requests.txt` contains the baseline, controlled serialized, and controlled parallel request patterns with `<REDACTED_JWT>`.
- `fixes/lesson-06/` now describes the pre-fix behavior, target post-fix behavior, and mitigation explanation.
- Screenshot evidence exists in `screenshots/lesson-06/`, including baseline request, parallel request output, CloudWatch/Lambda evidence, and API Gateway throttling.

Remaining manual check:

- Confirm in AWS that the throttling values shown in `Screenshot 6.8` are the final intended values.
- Confirm the final report references the same screenshot numbering.

## Lesson 7 status

- `vulnerabilities/lesson-07-over-privileged-function/README.md` now follows the required 10-part structure.
- `redacted-requests.txt` now lists the function, role, and simulator checks without exposing account-specific secrets.
- `fixes/lesson-07/before-policy.json` and `after-policy.json` now provide redacted before/after IAM policy examples.
- Screenshot evidence exists in `screenshots/lesson-07/`, including function page, execution role, broad SES evidence, policy simulator checks, and post-fix workflow evidence.

Remaining manual check:

- Confirm that the real AWS policy after fix matches `fixes/lesson-07/after-policy.json` or update the JSON to match the exact final configuration.

## Imported external lesson material

External DOCX reports were organized into matching lesson folders:

| Source report | Destination |
|---|---|
| `Report Of #2.docx` | `vulnerabilities/lesson-02-broken-authentication/report-source.docx` |
| `Lesson4_Full_Report_Naif.docx` | `vulnerabilities/lesson-04-insecure-cloud-configuration/report-source.docx` |
| `Report Of #5.docx` | `vulnerabilities/lesson-05-broken-access-control/report-source.docx` |
| `Lesson8_Report_NaifALenizi_WithScreenshots.docx` | `vulnerabilities/lesson-08-logic-vulnerabilities/report-source.docx` |
| `Report Of #10.docx` | `vulnerabilities/lesson-10-unhandled-exceptions/report-source.docx` |

Embedded images were extracted to:

- `screenshots/lesson-02/from-report/`
- `screenshots/lesson-04/from-report/`
- `screenshots/lesson-05/from-report/`
- `screenshots/lesson-08/from-report/`
- `screenshots/lesson-10/from-report/`

Videos were copied to `videos/external-unassigned/` with an index because their filenames/metadata do not identify the exact lesson.

## Repository gaps still visible

- `report/final-report.pdf` is a placeholder text file, not a real PDF.
- `presentation/slides.pdf` is a placeholder text file, not a real PDF.
- `diagrams/architecture.png`, `diagrams/lesson-02-sequence-diagram.png`, and `diagrams/lesson-07-blast-radius.png` were replaced with real PNG diagrams during this audit.
- Many non-6/7 lesson README and fix files still contain placeholder text. The imported DOCX reports add real content for Lessons 2, 4, 5, 8, and 10, but their Markdown README files were not fully rewritten in this pass.

## Tooling note

No LaTeX compiler (`pdflatex`, `xelatex`, or `latexmk`) is available on PATH in this environment. A Beamer source file was generated, but PDF compilation requires installing MiKTeX or TeX Live.
