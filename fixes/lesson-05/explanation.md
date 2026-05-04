# Lesson 05 Fix Explanation

The broken access control fix requires both application-level authorization and IAM scoping. Sensitive administrative order updates must require verified administrator claims, and public-facing Lambda roles should not have wildcard permissions to invoke arbitrary internal functions.

Post-fix verification should repeat the normal-user administrative update attempt. The unauthorized update should fail, and the normal billing/order workflow should still work.
