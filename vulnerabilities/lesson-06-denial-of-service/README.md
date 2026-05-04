# Lesson 06: Denial of Service

## Part 1) Goal and Vulnerability Summary

This lesson demonstrates a Denial of Service condition in the DVSA billing workflow. The affected path is the `/dvsa/order` API action for billing, which enters through API Gateway and reaches the `DVSA-ORDER-BILLING` Lambda function. Repeated billing requests can consume backend processing capacity and cause internal server errors for some requests, reducing availability for legitimate checkout users.

## Part 2) Why This Works / Root Cause

The vulnerable design does not sufficiently limit repeated or concurrent billing requests at the API edge. The billing path performs backend work for each request and depends on limited Lambda/API Gateway capacity. Without strict throttling, idempotency, per-user controls, or queue-based smoothing, a small burst of duplicate requests can make the backend degrade and return failures.

## Part 3) Environment and Setup

- Region: `us-east-1`
- API endpoint: `https://<api-id>.execute-api.us-east-1.amazonaws.com/dvsa/order`
- API action: `billing`
- Backend function: `DVSA-ORDER-BILLING`
- Evidence sources: browser workflow, PowerShell/curl output, CloudWatch logs, Lambda metrics, and API Gateway throttling settings
- Sensitive values: Authorization JWTs are redacted as `<REDACTED_JWT>`

## Part 4) Reproduction Steps

1. Confirm the normal billing/order workflow works from the DVSA frontend.
2. Capture the `/dvsa/order` billing request from browser DevTools.
3. Send one baseline billing POST request with the captured request body and a redacted Authorization header.
4. Run a controlled repeated request test with a small serialized count.
5. Run a controlled `1..10 | ForEach-Object { Start-Job ... }` parallel-job test against the same lab endpoint.
6. Compare the returned status codes and response bodies.
7. Open CloudWatch and Lambda metrics for `DVSA-ORDER-BILLING` to confirm backend impact.

## Part 5) Evidence and Proof

Evidence is stored in `../../screenshots/lesson-06/`.

- `Screenshot 6.1` through `Screenshot 6.3`: normal billing workflow and captured request details.
- `Screenshot 6.4`: baseline single billing request before repeated testing.
- `Screenshot 6.5`: controlled repeated billing requests from PowerShell.
- `Screenshot 6.6`: Lambda metrics after the repeated request test.
- `Screenshot 6.7`: CloudWatch log group for `DVSA-ORDER-BILLING`.
- `Screenshot 6.8`: API Gateway throttling configuration.

Observed controlled parallel test result:

| Request Set | Result |
|---|---|
| Serialized 3-request test | HTTP 200 responses with `order already made` |
| Parallel 10-job test | Mixed HTTP 200, 500, and 502 responses |

The mixed 500/502 results during the parallel test show that repeated concurrent billing requests can make the billing path fail for some requests.

## Part 6) Fix Strategy / Probable Mitigation

The fix belongs at the API Gateway and backend workflow layers. API Gateway should enforce throttling so small bursts do not reach Lambda unchecked. The billing function should also be made idempotent per order and user so duplicate billing attempts are rejected cheaply and consistently before expensive processing.

## Part 7) Code / Config Changes

The documented remediation is stored in `../../fixes/lesson-06/`.

- `before-example.txt`: pre-fix behavior with no effective request protection for repeated billing bursts.
- `after-example.txt`: post-fix controls using API Gateway throttling and server-side idempotency/rate checks.
- `explanation.md`: safe verification approach and mitigation summary.

## Part 8) Verification After Fix

After configuring throttling, repeat the same controlled test. The expected post-fix behavior is that excess requests are throttled or rejected cleanly instead of causing backend instability. The normal checkout workflow should still work for legitimate users.

`Screenshot 6.8` documents the API Gateway throttling configuration used as post-fix evidence.

## Part 9) Structured Operation and Security Analysis

### Table A

| Vulnerability | Intended Rule(s) | Artifacts Used to Infer Rule | Normal Behavior Evidence | Exploit Behavior Evidence |
|---|---|---|---|---|
| Lesson 06: Denial of Service | Billing requests should be processed fairly and duplicate/concurrent bursts should not exhaust backend capacity. | Browser flow, captured API request, PowerShell output, CloudWatch logs, Lambda metrics, API Gateway throttling settings. | Normal billing workflow screenshots and baseline single request. | Parallel 10-job PowerShell evidence showing mixed HTTP 200/500/502 results. |

### Table B

| Vulnerability | Why This Is a Deviation | Deviation Class | Fix Applied (Where) | Post-Fix Verification |
|---|---|---|---|---|
| Lesson 06: Denial of Service | A small burst of concurrent requests caused backend error responses instead of controlled throttling or graceful rejection. | Intentional misuse / security-relevant abuse | API Gateway throttling plus backend idempotency/rate-control design for billing. | API Gateway throttling configuration screenshot and normal workflow confirmation. |

## Part 10) Takeaway / Lessons Learned

Availability is a security property. In serverless systems, scaling does not remove the need for fair-use controls. Critical workflows such as billing should have throttling, idempotency, and controlled degradation so repeated requests do not disrupt legitimate users.
