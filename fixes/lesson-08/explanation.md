# Lesson 8: Logic Vulnerability / Race Condition Fix

## Vulnerability Summary

The DVSA order workflow allowed billing and order-update requests to run close together. Because the vulnerable flow used separate read, check, and write operations, a timing gap existed between calculating the order state and committing the billing update.

The result was a race condition: two conflicting requests could modify the same order in a way that produced an inconsistent final order state or total.

## Root Cause

The vulnerable logic in the order billing flow did not enforce an atomic state transition in DynamoDB. The billing Lambda checked the order status before writing the payment update, but the final write did not require the stored order status to still be billable.

In practical terms, `order_billing.py` trusted a state value that could change between the read and the write.

## Fix Applied

The fix belongs in the order state machine and DynamoDB update logic. The update operation should be conditional or transactional so only one valid state transition can win.

The implemented fix adds a DynamoDB `ConditionExpression` to `table.update_item()` in the `DVSA-ORDER-BILLING` Lambda:

```python
response = table.update_item(
    Key=key,
    UpdateExpression=update_expression,
    ConditionExpression='orderStatus < :maxstatus',
    ExpressionAttributeValues={
        **expression_attributes,
        ':maxstatus': 120
    }
)
```

This makes the billing update atomic: DynamoDB applies the update only if the order is still in a billable state at write time.

## Verification

The post-fix verification is to repeat the race test and confirm that one operation wins cleanly while the conflicting operation is rejected. DynamoDB should reject duplicate or stale billing attempts instead of allowing both requests to update the order.

Legitimate single-order billing should continue to work after the fix.

## Key Takeaway

Workflow checks that depend on shared state must be enforced at the write boundary. In serverless systems, concurrent Lambda executions can run at the same time, so read/check/write logic must use conditional writes or transactions for security-sensitive state transitions.
