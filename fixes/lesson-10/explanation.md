# Lesson 10 Fix Explanation

The unhandled exception fix belongs in input validation and centralized error handling for the affected Lambda/API path. The backend should reject malformed requests before they reach code that assumes fields exist, and handler-level exception handling should prevent stack traces or file paths from reaching the client.

Post-fix verification should repeat the malformed request. The client should receive a generic safe error, while CloudWatch retains enough detail for debugging.
