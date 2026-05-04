# Lesson 02 Fix Explanation

The broken authentication fix belongs in the backend order/authentication path. The vulnerable behavior was trusting decoded JWT payload fields without verifying token integrity. The corrected behavior is to validate the token signature, issuer, audience/client ID, expiration, and trusted subject before using the identity in any order query.

Post-fix verification should repeat the forged-token request. The forged token should fail, while a normal user token should still return only that user's own orders.
