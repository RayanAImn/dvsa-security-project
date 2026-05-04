// Redacted pre-fix authentication pattern.
// Problem: identity is read from caller-controlled JWT payload fields without
// proving that the token signature and issuer are trusted.

function getCallerIdentity(decodedToken) {
  return {
    username: decodedToken.username,
    sub: decodedToken.sub
  };
}

async function listOrders(event) {
  const token = decodeJwtWithoutVerification(event.headers.Authorization);
  const caller = getCallerIdentity(token);
  return getOrdersForUser(caller.username || caller.sub);
}
