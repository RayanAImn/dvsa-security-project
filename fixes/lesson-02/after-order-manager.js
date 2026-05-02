// Redacted post-fix example placeholder.
function getOrder(event, claims) {
  if (!claims || claims.sub !== event.userId) {
    throw new Error("Unauthorized");
  }

  return fetchOrderForUser(claims.sub);
}
