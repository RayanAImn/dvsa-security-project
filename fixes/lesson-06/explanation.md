# Lesson 06 Fix Explanation

The Denial of Service mitigation is to add availability controls at the API edge and in the billing workflow. API Gateway throttling limits how many billing requests can reach Lambda during a burst. Backend idempotency/rate checks ensure duplicate billing attempts for the same order are handled cheaply and consistently.

This addresses the root cause because repeated requests no longer translate directly into unbounded backend work. Post-fix verification should repeat the same controlled request pattern and confirm that excess requests are handled safely while the normal order workflow still works.
