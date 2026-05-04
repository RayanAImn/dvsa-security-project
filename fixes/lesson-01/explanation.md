# explanation.md

# Vulnerability 1: Event Injection via Unsafe Deserialization

## Vulnerability Summary

The first vulnerability is an **Event Injection / Code Injection** vulnerability in the DVSA order-management backend.

The vulnerable component is:

`DVSA-ORDER-MANAGER -> order-manager.js`

The vulnerable endpoint is:

`https://qaifuqmaxg.execute-api.us-east-1.amazonaws.com/Stage/order`

The issue occurs because the Lambda function deserializes user-controlled request data using the unsafe `node-serialize` package. The vulnerable code uses `serialize.unserialize()` on `event.body`, allowing specially crafted payloads to be reconstructed as executable JavaScript functions.

This means an attacker can place malicious JavaScript code inside the HTTP request body, and the backend may execute that code during deserialization.

---

## Affected Component

- **Application:** DVSA
- **AWS Region:** `us-east-1`
- **Affected Service:** AWS Lambda behind API Gateway
- **Affected Lambda:** `DVSA-ORDER-MANAGER`
- **Affected File:** `order-manager.js`
- **Affected Endpoint:** `/Stage/order`
- **Affected Dependency:** `node-serialize`

The report identifies the vulnerability as **Code Injection via Node-Serialize** and lists the affected components as API Gateway, AWS Lambda, and DynamoDB. :contentReference[oaicite:0]{index=0}

---

## Root Cause

The root cause is **unsafe deserialization of untrusted input**.

In the original vulnerable code, the Lambda handler parsed the request body like this:

```js
var req = serialize.unserialize(event.body);
