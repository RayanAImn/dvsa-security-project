````markdown
# Vulnerability 3: Sensitive Data Disclosure via Code Injection

## Vulnerability Summary

The third vulnerability is a **Sensitive Data Disclosure** vulnerability in the DVSA backend.

The vulnerable component is:

```text
DVSA-ORDER-MANAGER -> order-manager.js
````

The vulnerable endpoint is:

```text
https://qaifuqmaxg.execute-api.us-east-1.amazonaws.com/Stage/order
```

This vulnerability is a direct consequence of the earlier unsafe deserialization issue. Since the backend allows code injection through `node-serialize`, an attacker can inject JavaScript code that invokes privileged backend Lambda functions and exfiltrates sensitive user order data.

In this case, the injected code was used to call the admin Lambda function:

```text
DVSA-ADMIN-GET-RECEIPT
```

This allowed the attacker to retrieve receipt/order information for a specific month and year, violating user data confidentiality.

---

## Affected Component

* **Application:** DVSA
* **AWS Region:** `us-east-1`
* **Affected Service:** AWS Lambda behind API Gateway
* **Affected Lambda:** `DVSA-ORDER-MANAGER`
* **Affected File:** `order-manager.js`
* **Affected Endpoint:** `/Stage/order`
* **Affected Backend Function:** `DVSA-ADMIN-GET-RECEIPT`
* **Affected Data Store:** DynamoDB
* **Affected Security Property:** Confidentiality
* **Affected Dependency:** `node-serialize`

---

## Root Cause

The root cause is **unsafe deserialization of user-controlled input** using the vulnerable `node-serialize` package.

The original vulnerable code parses the request body using:

```js
var req = serialize.unserialize(event.body);
```

It also parses headers using:

```js
var headers = serialize.unserialize(event.headers);
```

This is unsafe because `node-serialize` can revive serialized JavaScript functions from user input. If an attacker sends a payload containing:

```js
_$$ND_FUNC$$_function(){ ... }()
```

then the backend may reconstruct and execute the function.

For Vulnerability 3, the issue is not only that code execution is possible. The bigger problem is that this code execution can be abused to access sensitive backend functionality, specifically the admin receipt retrieval function.

---

## Why This Works

The application uses `order-manager.js` as an entry point for order-related operations. Under normal conditions, the Lambda should receive a valid request, inspect the requested action, and invoke only the correct backend function.

However, because the request body is deserialized unsafely, attacker-controlled code can execute before the application safely handles the request.

The vulnerable flow is:

```text
Attacker Request
      ↓
API Gateway /Stage/order
      ↓
DVSA-ORDER-MANAGER Lambda
      ↓
serialize.unserialize(event.body)
      ↓
Injected JavaScript executes
      ↓
Injected code invokes DVSA-ADMIN-GET-RECEIPT
      ↓
Receipt/order data is retrieved
      ↓
Sensitive data is sent to attacker-controlled webhook
```

The attacker uses the code injection primitive from Vulnerability 1, but changes the payload goal. Instead of only proving code execution, the attacker uses the injected code to access private order data.

---

## Evidence From the Report

The report shows that the attacker first created sensitive test data by creating an account, logging in, and making orders in the DVSA web application.

The report then confirms that the orders were stored in DynamoDB.

After that, the attacker constructed a malicious request to the `/Stage/order` endpoint. The injected code used the AWS Lambda client to invoke:

```text
DVSA-ADMIN-GET-RECEIPT
```

with a payload containing a target year and month:

```json
{
  "year": "2026",
  "month": "04"
}
```

The injected code then sent the returned data to a controlled webhook URL.

The report shows that the webhook received the leaked receipt data. The exposed data included user order information, such as which users ordered which items and the associated billing/order details.

This demonstrated that the application disclosed sensitive user data through backend code injection.

---

## Security Impact

The impact is severe because sensitive user order information can be accessed without proper authorization.

Possible impacts include:

* Unauthorized access to user receipt data
* Disclosure of private order history
* Disclosure of billing/order-related information
* Violation of data confidentiality
* Abuse of privileged backend Lambda functions
* Bypass of intended application authorization logic
* Potential exposure of other DynamoDB data if similar privileged functions are reachable
* Loss of trust in the application’s handling of customer data

The report specifically states that this vulnerability violates confidentiality because an attacker can access transactions for a given month and year.

---

## Exploitation Scenario

An attacker identifies that the `/Stage/order` endpoint forwards requests to the `DVSA-ORDER-MANAGER` Lambda function.

The attacker also knows that the Lambda uses unsafe deserialization through `node-serialize`.

The attacker sends a malicious request where the `action` field contains a serialized JavaScript function. Instead of simply writing to `/tmp`, this injected function imports the AWS Lambda client and invokes the privileged admin function:

```text
DVSA-ADMIN-GET-RECEIPT
```

The attacker supplies a target month and year, such as:

```json
{
  "year": "2026",
  "month": "04"
}
```

The admin function returns receipt data. The injected code then sends that data to an attacker-controlled webhook.

As a result, sensitive user order data is disclosed outside the application.

---

## What Should Have Happened

The backend should have treated the request body as plain JSON data.

The intended secure behavior is:

1. Receive HTTP request.
2. Parse the body using safe JSON parsing.
3. Treat the `action` field as data only.
4. Validate the action against an allowlist.
5. Reject unknown or malformed actions.
6. Enforce authorization before invoking sensitive backend functions.
7. Prevent public order-management code from invoking privileged admin functions unless explicitly authorized.
8. Never execute code supplied inside request fields.

---

## What Actually Happened

The backend used unsafe deserialization on untrusted input.

Instead of treating the malicious payload as a string, the backend reconstructed and executed the injected JavaScript function. That function was then used to invoke a privileged admin receipt function and send the result to an external webhook.

The vulnerable behavior can be summarized as:

```text
Expected:
User input → JSON data → validate action → authorized backend call

Actual:
User input → unsafe deserialization → injected code execution → admin Lambda invocation → data exfiltration
```

---

## Fix Location

The fix belongs in:

```text
DVSA-ORDER-MANAGER -> order-manager.js
```

This is where the unsafe request parsing occurs.

---

## Code Change

### Before Fix

The vulnerable code used `node-serialize`:

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

The dangerous lines are:

```js
var req = serialize.unserialize(event.body);
var headers = serialize.unserialize(event.headers);
```

These lines allow attacker-controlled payloads to be deserialized in a way that can execute JavaScript functions.

### After Fix

The fixed version should parse the body safely using `JSON.parse()` and handle headers directly from the Lambda event:

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

The unused dependency should also be removed if it is no longer needed:

```js
const serialize = require('node-serialize');
```

---

## Why the Fix Works

`JSON.parse()` does not revive JavaScript functions.

After the fix, a malicious payload such as:

```js
_$$ND_FUNC$$_function(){ ... }()
```

is treated as a normal string value, not executable backend code.

Because the injected function is no longer executed, the attacker cannot use the request body to invoke:

```text
DVSA-ADMIN-GET-RECEIPT
```

The malicious value becomes just an invalid `action` string. Since it does not match a valid action in the order-manager switch statement, the backend rejects it safely.

---

## Verification After Fix

After the fix, the same malicious request was repeated.

Instead of leaking data to the webhook, the application returned:

```json
{"status":"err","msg":"unknown action"}
```

The report also notes that no new webhook request was received after the fix.

This confirms that:

1. The injected JavaScript did not execute.
2. The admin receipt function was not invoked.
3. Sensitive data was not sent to the webhook.
4. The malicious action was handled as an invalid request.

---

## Additional Security Recommendation

Although replacing `node-serialize` with `JSON.parse()` fixes the immediate issue, the application should also apply least privilege to reduce future impact.

Recommended hardening:

1. Restrict the IAM role of `DVSA-ORDER-MANAGER`.
2. Prevent public-facing Lambda functions from invoking privileged admin functions unless strictly required.
3. Add server-side authorization checks before receipt retrieval.
4. Validate all `action` values using a strict allowlist.
5. Monitor CloudWatch logs for unexpected Lambda invocations.
6. Monitor outbound network requests from Lambda functions.
7. Add dependency scanning to detect unsafe packages.
8. Avoid using deserialization libraries that can revive executable code.

---

## Final Takeaway

This vulnerability shows how one unsafe dependency can create multiple security failures.

The original issue was unsafe deserialization through `node-serialize`. However, once backend code execution was possible, the attacker could use it to access sensitive data by invoking privileged backend functions.

The main lesson is:

> Code injection often becomes data disclosure when the vulnerable code runs with access to sensitive backend services.

For this application, replacing `node-serialize` with `JSON.parse()`, directly handling headers through `event.headers`, and rejecting invalid actions prevents the injected code from executing and stops the sensitive data disclosure path.

```
```
