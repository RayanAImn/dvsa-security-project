````markdown
# Vulnerability 1: Event Injection via Unsafe Deserialization

## Vulnerability Summary

The first vulnerability is an **Event Injection / Code Injection** vulnerability in the DVSA order-management backend.

The vulnerable component is:

```text
DVSA-ORDER-MANAGER -> order-manager.js
````

The vulnerable endpoint is:

```text
https://qaifuqmaxg.execute-api.us-east-1.amazonaws.com/Stage/order
```

The issue occurs because the Lambda function deserializes user-controlled request data using the unsafe `node-serialize` package. The vulnerable code uses `serialize.unserialize()` on `event.body`, allowing specially crafted payloads to be reconstructed as executable JavaScript functions.

This means an attacker can place malicious JavaScript code inside the HTTP request body, and the backend may execute that code during deserialization.

---

## Affected Component

* **Application:** DVSA
* **AWS Region:** `us-east-1`
* **Affected Service:** AWS Lambda behind API Gateway
* **Affected Lambda:** `DVSA-ORDER-MANAGER`
* **Affected File:** `order-manager.js`
* **Affected Endpoint:** `/Stage/order`
* **Affected Dependency:** `node-serialize`

---

## Root Cause

The root cause is **unsafe deserialization of untrusted input**.

In the original vulnerable code, the Lambda handler parsed the request body using:

```js
var req = serialize.unserialize(event.body);
```

It also deserialized headers using:

```js
var headers = serialize.unserialize(event.headers);
```

This is dangerous because `node-serialize` can revive serialized JavaScript functions. If attacker-controlled input contains a function marker such as:

```js
_$$ND_FUNC$$_function(){ ... }()
```

then `serialize.unserialize()` may reconstruct and execute that function.

Therefore, the uploaded full code represents the **before-fix vulnerable version**, because it still imports `node-serialize` and still calls `serialize.unserialize(event.body)` and `serialize.unserialize(event.headers)`.

---

## Why This Works

Normal JSON parsing treats request data as data only.

Unsafe deserialization is different. Instead of only converting JSON text into plain objects, `node-serialize` can recreate JavaScript function objects from serialized strings. This creates a direct path from attacker-controlled HTTP input to backend code execution.

The vulnerable flow is:

1. The attacker sends a POST request to `/Stage/order`.
2. The request body contains a malicious serialized function.
3. API Gateway forwards the request to the `DVSA-ORDER-MANAGER` Lambda.
4. `order-manager.js` calls `serialize.unserialize(event.body)`.
5. The malicious function is reconstructed.
6. The function executes inside the Lambda runtime.

---

## Evidence From the Report

The report demonstrates exploitation using a `curl` request sent to:

```text
https://qaifuqmaxg.execute-api.us-east-1.amazonaws.com/Stage/order
```

The malicious payload uses the `action` field to inject JavaScript code:

```json
{
  "action": "_$$ND_FUNC$$_function(){ var fs = require(\"fs\"); fs.writeFileSync(\"/tmp/pwned.txt\",\"You are reading the contents of my hacked file!\"); var fileData = fs.readFileSync(\"/tmp/pwned.txt\",\"utf-8\"); console.error(\"FILE READ SUCCESS: \" + fileData); }()",
  "cart-id": ""
}
```

The HTTP response returned:

```json
{"message": "Internal server error"}
```

However, the `500 Internal server error` does **not** mean the attack failed. The backend still executed the injected code, and this was confirmed using CloudWatch logs. The error occurred because the request did not include a valid JWT authorization header.

---

## Security Impact

The impact is severe because the attacker can execute code inside the backend Lambda environment.

Possible impacts include:

* Backend code execution
* Unauthorized reads and writes
* Unauthorized Lambda function calls
* Data integrity violation
* Data confidentiality violation
* Access to temporary Lambda storage such as `/tmp`
* Possible abuse of AWS permissions assigned to the Lambda role
* Potential access to other backend services if the Lambda has excessive permissions

The report states that the vulnerability violates data integrity and confidentiality and can allow an attacker to call functions, including admin functions.

---

## Exploitation Scenario

An attacker discovers that the `/Stage/order` endpoint forwards request bodies into a Lambda function that uses `node-serialize`.

The attacker crafts a request where the `action` field is not a normal action such as `new`, `update`, or `cancel`. Instead, the attacker places a serialized JavaScript function using the `node-serialize` function marker.

When the Lambda receives the request, it runs:

```js
var req = serialize.unserialize(event.body);
```

At this point, the malicious function executes before normal business logic safely validates the request action.

In the proof of concept, the attacker writes a file to `/tmp/pwned.txt`, reads it back, and prints the result to CloudWatch logs. This proves that backend code execution occurred.

---

## What Should Have Happened

The backend should have treated the request body as plain JSON data.

The intended secure behavior is:

1. Receive HTTP request.
2. Parse request body as JSON.
3. Treat all fields as data, not executable code.
4. Validate the `action` field against a safe allowlist.
5. Reject unknown or malformed actions.
6. Never execute request-provided code.

---

## What Actually Happened

The backend used unsafe deserialization.

Instead of treating the request as plain data, it allowed the request body to reconstruct executable JavaScript functions. As a result, attacker-controlled code was executed in the Lambda backend.

The vulnerable behavior can be summarized as:

```text
Attacker Request
      ↓
API Gateway
      ↓
Lambda Handler
      ↓
serialize.unserialize(event.body)
      ↓
Function marker detected
      ↓
Injected function reconstructed
      ↓
Injected code executed
```

---

## Fix Location

The fix belongs in:

```text
DVSA-ORDER-MANAGER -> order-manager.js
```

This is the file where the unsafe request parsing occurs.

---

## Code Change

### Before Fix

The vulnerable code used `serialize.unserialize()`:

```js
const serialize = require('node-serialize');

exports.handler = (event, context, callback) => {
    var req = serialize.unserialize(event.body);
    var headers = serialize.unserialize(event.headers);

    var auth_header = headers.Authorization || headers.authorization;
    var token_sections = auth_header.split('.');
    var auth_data = jose.util.base64url.decode(token_sections[1]);
    var token = JSON.parse(auth_data);
    var user = token.username;
    var isAdmin = false;

    // remaining order-manager logic...
};
```

### After Fix

The fixed version should parse the request body using `JSON.parse()` and handle headers as a normal object:

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

The important change is:

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

The `node-serialize` import should also be removed if it is no longer used:

```js
const serialize = require('node-serialize');
```

---

## Why the Fix Works

`JSON.parse()` does not revive JavaScript functions. It only converts valid JSON text into plain JavaScript values such as objects, strings, numbers, arrays, booleans, and null.

So after the fix, this malicious value:

```js
_$$ND_FUNC$$_function(){ ... }()
```

is treated as a regular string, not executable code.

Then, because it does not match a valid order action, the backend rejects it safely.

---

## Verification After Fix

The same malicious request was sent again after applying the fix.

Instead of backend execution, the application returned:

```json
{"status":"err","message":"Invalid request"}
```

This confirms that the malicious payload was no longer executed. The request was safely rejected because the payload did not conform to valid expected input.

---

## Final Takeaway

This vulnerability happened because the backend trusted user input too much and used an unsafe deserializer on it.

The main lesson is:

> Never use deserializers that can reconstruct executable code on untrusted user input.

For this application, the correct solution was to remove `node-serialize` from request parsing, replace it with `JSON.parse()`, directly read headers from `event.headers`, and reject malformed requests using controlled error handling.

This prevents event injection because attacker-controlled request data remains data and can no longer become executable backend code.

```
```
