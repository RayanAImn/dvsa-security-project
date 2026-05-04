

# Lesson 8: Race Condition Fix

## Vulnerability
Sending billing and update requests simultaneously 
corrupted the order total in DVSA.

## Root Cause
`order_billing.py` had no atomic lock on DynamoDB 
write — two concurrent requests could both modify 
the order at the same time.

## Fix
Added `ConditionExpression` to `table.update_item()` 
in `DVSA-ORDER-BILLING` Lambda:

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

## Result
DynamoDB now rejects any duplicate billing attempt 
atomically — race condition is eliminated.

**File changed:** `order_billing.py`  
**Lambda:** `DVSA-ORDER-BILLING`
