# Lesson 08 Fix Explanation

The logic vulnerability fix belongs in the order state machine and DynamoDB update logic. The vulnerable flow used separate read/check/write operations, allowing a timing gap between billing and order modification.

The fix is to enforce atomic state transitions with conditional expressions or transactions. Post-fix verification should repeat the race test and confirm that one operation wins cleanly while the conflicting operation is rejected.
