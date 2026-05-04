# Lesson 09 Fix Explanation

The vulnerable dependency fix is to remove or replace packages that evaluate attacker-controlled serialized functions. Request parsing should use safe JSON parsing plus allowlisted schema validation.

Post-fix verification should repeat the Lesson 1 injection payload and confirm that it is rejected as data, not executed. A dependency scan should also show that the risky package is absent or upgraded to a safe alternative.
