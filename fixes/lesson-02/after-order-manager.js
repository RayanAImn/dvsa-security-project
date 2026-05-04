// Redacted post-fix authentication pattern.
// Fix: verify the JWT signature, issuer, audience, expiry, and trusted subject
// before using identity claims for order access.

async function getVerifiedCaller(event) {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  const verifiedClaims = await verifyCognitoJwt(authHeader, {
    issuer: "https://cognito-idp.us-east-1.amazonaws.com/<USER_POOL_ID>",
    audience: "<APP_CLIENT_ID>"
  });

  if (!verifiedClaims.sub) {
    throw new Error("Unauthorized");
  }

  return {
    username: verifiedClaims.username,
    sub: verifiedClaims.sub
  };
}

async function listOrders(event) {
  const caller = await getVerifiedCaller(event);
  return getOrdersForUser(caller.sub);
}
