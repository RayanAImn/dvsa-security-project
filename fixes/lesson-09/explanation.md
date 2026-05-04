# Lesson 9: Vulnerable Dependency - Node-Serialize

## Vulnerability Summary

Lesson 9 covers a vulnerable dependency in the DVSA order-management backend. The affected component is the `DVSA-ORDER-MANAGER` Lambda, specifically `order-manager.js`, which used the `node-serialize` package to deserialize request-controlled data.

The security impact is backend code execution. A malicious request body can contain a serialized JavaScript function marker that `node-serialize` revives and executes inside the Lambda runtime.

## Affected Component

- Application: DVSA
- AWS Region: `us-east-1`
- Service path: API Gateway to Lambda
- Lambda: `DVSA-ORDER-MANAGER`
- File: `order-manager.js`
- Endpoint: `/Stage/order`
- Package: `node-serialize`
- Risky function: `serialize.unserialize()`

## Root Cause

The backend used an unsafe third-party dependency to parse untrusted HTTP input:

```js
const serialize = require('node-serialize');
```

The vulnerable code then deserialized request-controlled values:

```js
var req = serialize.unserialize(event.body);
var headers = serialize.unserialize(event.headers);
```

This is unsafe because `event.body` comes from the external HTTP request. The issue is not only that the dependency exists; the real issue is that the dependency is used in a security-sensitive request-processing path.

## Why This Works

A normal JSON parser converts JSON text into plain data such as objects, arrays, strings, numbers, booleans, and null. It does not convert text into executable functions.

`node-serialize` supports serialized function markers such as:

```js
_$$ND_FUNC$$_function(){ ... }()
```

When `serialize.unserialize()` processes that value, it can reconstruct and execute the function. That turns attacker-controlled request data into executable backend behavior.

The vulnerable flow is:

```text
User-controlled HTTP body
  -> API Gateway
  -> DVSA-ORDER-MANAGER Lambda
  -> serialize.unserialize(event.body)
  -> node-serialize revives function payload
  -> injected JavaScript executes in Lambda
```

## Fix Applied

The fix is to remove `node-serialize` from request parsing and replace it with safe JSON parsing plus explicit validation.

The vulnerable parsing pattern:

```js
var req = serialize.unserialize(event.body);
var headers = serialize.unserialize(event.headers);
```

The fixed parsing pattern:

```js
let req;

try {
  req = JSON.parse(event.body);
} catch (err) {
  return {
    status: 'err',
    message: 'Invalid request'
  };
}

const headers = event.headers || {};
```

After parsing, the request should be validated against an allowlisted schema before any business logic executes.

## Why the Fix Works

`JSON.parse()` treats the malicious marker as a string. It does not revive the value into a JavaScript function, so the payload cannot execute.

After the fix, payloads containing `_$$ND_FUNC$$_function(){ ... }()` are handled as invalid request data and rejected safely.

## Verification After Fix

The same malicious payload was sent again after replacing `node-serialize` request parsing with `JSON.parse()`. The application returned an invalid-request response instead of executing the payload:

```json
{"status":"err","message":"Invalid request"}
```

Expected post-fix evidence:

- No backend code execution.
- No CloudWatch evidence of injected code running.
- No `/tmp/pwned.txt` file write caused by attacker input.
- Function marker treated as string data.
- Invalid input rejected gracefully.

## Additional Security Recommendations

- Remove `node-serialize` from the Lambda package if it is no longer needed.
- Run dependency scanning during development and deployment.
- Review all Lambda functions for unsafe deserialization patterns.
- Avoid packages that reconstruct executable objects from user-controlled input.
- Pin dependency versions and review updates regularly.
- Use `npm audit` or an equivalent dependency-scanning tool.
- Validate every request body with a strict schema before business logic executes.
- Monitor CloudWatch logs for suspicious payload markers such as `_$$ND_FUNC$$_`.

## Key Takeaway

A dependency is not only dangerous because it exists; it becomes dangerous when it is used in a security-sensitive path with attacker-controlled data. Replacing `serialize.unserialize()` with `JSON.parse()`, reading headers directly from `event.headers`, and rejecting invalid input removes the vulnerable dependency from the request-processing path.
