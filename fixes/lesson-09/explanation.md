````markdown
# Vulnerability 9: Vulnerable Dependency - Node-Serialize

## Vulnerability Summary

The ninth vulnerability is a **Vulnerable Dependency** issue in the DVSA order-management backend.

The vulnerable component is:

```text
DVSA-ORDER-MANAGER -> order-manager.js
````

The vulnerable endpoint is:

```text
https://qaifuqmaxg.execute-api.us-east-1.amazonaws.com/Stage/order
```

The issue occurs because the backend uses the `node-serialize` package to deserialize user-controlled request data. This dependency is unsafe in this context because it can revive serialized JavaScript functions from input data.

As a result, attacker-controlled payloads can be transformed from strings into executable JavaScript code inside the AWS Lambda runtime.

---

## Affected Component

* **Application:** DVSA
* **AWS Region:** `us-east-1`
* **Affected Service:** AWS Lambda behind API Gateway
* **Affected Lambda:** `DVSA-ORDER-MANAGER`
* **Affected File:** `order-manager.js`
* **Affected Endpoint:** `/Stage/order`
* **Affected Package:** `node-serialize`
* **Affected Function:** `serialize.unserialize()`

---

## Root Cause

The root cause is the use of an unsafe third-party dependency for deserializing untrusted input.

The original code imports the vulnerable dependency:

```js
const serialize = require('node-serialize');
```

Then it uses that dependency directly on request-controlled data:

```js
var req = serialize.unserialize(event.body);
var headers = serialize.unserialize(event.headers);
```

This is unsafe because `event.body` comes from the HTTP request body, meaning it is attacker-controlled input.

The problem is not only that the package exists in the project. The real issue is that the package is used on untrusted external input in a way that allows executable function revival.

---

## Why This Works

A normal JSON parser only converts JSON text into plain data.

For example, `JSON.parse()` can produce:

* Objects
* Arrays
* Strings
* Numbers
* Booleans
* Null

It does **not** convert text into executable functions.

By contrast, `node-serialize` supports special serialized function markers such as:

```js
_$$ND_FUNC$$_function(){ ... }()
```

When `serialize.unserialize()` processes this kind of value, it can reconstruct the function and execute it.

The vulnerable dependency therefore turns user-controlled data into executable backend behavior.

The vulnerable flow is:

```text
User-controlled HTTP body
      ↓
API Gateway
      ↓
DVSA-ORDER-MANAGER Lambda
      ↓
serialize.unserialize(event.body)
      ↓
node-serialize revives function payload
      ↓
Injected JavaScript executes in Lambda
```

---

## Evidence From the Report

The report identifies the vulnerability title as:

```text
Event Injection and Vulnerable Dependencies
```

The report also identifies the high-level weakness as:

```text
Vulnerable dependencies that can be exploited for code injection
```

The vulnerable endpoint used in the report is:

```text
https://qaifuqmaxg.execute-api.us-east-1.amazonaws.com/Stage/order
```

The proof-of-concept payload uses the `node-serialize` function marker:

```js
_$$ND_FUNC$$_function(){ ... }()
```

The injected code attempts to write to the Lambda `/tmp` directory, read the written file, and print the result to CloudWatch logs.

The application response was:

```json
{"message": "Internal server error"}
```

However, the report explains that this generic error did not mean the exploit failed. Backend execution was confirmed through CloudWatch logs.

---

## Security Impact

The security impact is high because the dependency enables code execution when used on untrusted input.

Possible impacts include:

* Backend code execution
* Event injection
* Unauthorized file writes to Lambda temporary storage
* Unauthorized file reads from Lambda temporary storage
* Unauthorized Lambda function calls
* Abuse of IAM permissions assigned to the Lambda function
* Sensitive data disclosure
* Integrity violation
* Confidentiality violation
* Potential privilege escalation if the Lambda role has excessive permissions

This dependency also serves as the root cause that enables the other documented vulnerabilities, including Event Injection and Sensitive Data Disclosure.

---

## Exploitation Scenario

An attacker sends a crafted POST request to:

```text
/Stage/order
```

The request body contains an `action` field with a serialized JavaScript function.

Instead of safely parsing the request as JSON data, the backend runs:

```js
var req = serialize.unserialize(event.body);
```

Because the input contains a `node-serialize` function marker, the dependency reconstructs and executes the function.

In the report’s proof of concept, the injected function uses Node.js `fs` functionality to write and read a file in `/tmp`, then logs the output. This confirms that the vulnerable dependency allowed backend code execution.

In a stronger attack scenario, the same vulnerable dependency can be used to call privileged AWS Lambda functions, access DynamoDB-backed data, or exfiltrate sensitive information.

---

## What Should Have Happened

The application should not have used a dependency capable of reviving executable functions to process untrusted HTTP request data.

The intended secure behavior is:

1. Receive HTTP request through API Gateway.
2. Parse `event.body` using a safe JSON parser.
3. Treat request fields as plain data.
4. Access `event.headers` directly as a normal object.
5. Validate the `action` field against allowed values.
6. Reject malformed or unsupported input.
7. Never reconstruct executable functions from request data.

---

## What Actually Happened

The application used the vulnerable `node-serialize` dependency directly on request-controlled input.

Instead of keeping the payload as data, the dependency allowed the payload to become executable code.

The actual vulnerable behavior can be summarized as:

```text
Expected:
HTTP request body → safe JSON parsing → plain object → action validation

Actual:
HTTP request body → node-serialize unserialize → function revival → code execution
```

---

## Fix Location

The fix belongs in:

```text
DVSA-ORDER-MANAGER -> order-manager.js
```

This is the file where `node-serialize` is imported and where `serialize.unserialize()` is called on `event.body` and `event.headers`.

---

## Code Change

### Before Fix

The vulnerable version imports `node-serialize`:

```js
const serialize = require('node-serialize');
```

Then it uses the dependency to parse request-controlled input:

```js
var req = serialize.unserialize(event.body);
var headers = serialize.unserialize(event.headers);
```

This is the vulnerable pattern.

### After Fix

The fixed version removes unsafe dependency usage from request parsing.

The request body should be parsed with `JSON.parse()`:

```js
var req = JSON.parse(event.body);
```

Headers should be handled directly from the Lambda event object:

```js
const headers = event.headers || {};
```

The corrected structure should also use a `try-catch` block:

```js
exports.handler = (event, context, callback) => {
    try {
        var req = JSON.parse(event.body);

        const headers = event.headers || {};
        var auth_header = headers.Authorization || headers.authorization;

        var token_sections = auth_header.split('.');
        var auth_data = jose.util.base64url.decode(token_sections[1]);
        var token = JSON.parse(auth_data);
        var user = token.username;
        var isAdmin = false;

        // remaining order-manager logic...
    }
    catch (e) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                status: "err",
                message: "Invalid request"
            })
        });
    }
};
```

The key change is:

```js
// Before
var req = serialize.unserialize(event.body);
var headers = serialize.unserialize(event.headers);
```

changed to:

```js
// After
var req = JSON.parse(event.body);
const headers = event.headers || {};
```

The unused dependency should also be removed if no longer needed:

```js
const serialize = require('node-serialize');
```

---

## Why the Fix Works

The fix works because `JSON.parse()` does not revive or execute JavaScript functions.

After the fix, a payload such as:

```js
_$$ND_FUNC$$_function(){ ... }()
```

is treated as a plain string value inside the parsed object.

It does not become a function.
It does not execute.
It does not write files.
It does not call Lambda functions.
It does not access DynamoDB data.

The payload then fails normal action validation and is rejected safely.

---

## Verification After Fix

After replacing `node-serialize` request parsing with `JSON.parse()`, the same malicious payload was sent again.

The application returned:

```json
{"status":"err","message":"Invalid request"}
```

This confirms that the malicious payload was no longer executed.

The expected post-fix result is:

1. No backend code execution.
2. No CloudWatch evidence of injected code running.
3. No `/tmp/pwned.txt` file write caused by attacker payload.
4. Malicious function marker treated as a string.
5. Invalid request handled gracefully.

---

## Additional Security Recommendation

In addition to replacing `node-serialize` in `order-manager.js`, the project should improve dependency security more generally.

Recommended actions:

1. Remove `node-serialize` from the project if it is no longer needed.
2. Run dependency scanning during development and deployment.
3. Review all Lambda functions for unsafe deserialization patterns.
4. Avoid packages that reconstruct executable objects from user-controlled input.
5. Pin dependency versions and review updates regularly.
6. Use `npm audit` or equivalent dependency-scanning tools.
7. Apply least privilege to the Lambda execution role.
8. Add automated tests that send malicious deserialization payloads and verify they are rejected.
9. Monitor CloudWatch logs for suspicious payload markers such as `_$$ND_FUNC$$_`.
10. Validate all request bodies with strict schemas before business logic executes.

---

## Final Takeaway

This vulnerability is caused by trusting an unsafe dependency with untrusted user input.

The main lesson is:

> A dependency is not only vulnerable because it exists; it becomes dangerous when it is used in a security-sensitive path with attacker-controlled data.

In this case, `node-serialize` was used to parse HTTP request bodies and headers in `order-manager.js`. Because the package can revive executable functions, attackers could inject JavaScript into the request body and execute it inside the Lambda backend.

Replacing `serialize.unserialize()` with `JSON.parse()`, reading headers directly from `event.headers`, and rejecting invalid input removes the vulnerable dependency from the request-processing path and prevents code execution.

```
```
