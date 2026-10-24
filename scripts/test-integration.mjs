import { strict as assert } from "assert";

console.log("=== RUNNING INTEGRATION TESTS ===");

const BASE_URL = "http://localhost:3000";

async function runTests() {
  // Test 1: Content API Sanitization
  console.log("\n[Integration 1]: Testing GET /api/content endpoint & sanitization...");
  const contentRes = await fetch(`${BASE_URL}/api/content`);
  assert.equal(contentRes.status, 200, "Content API must respond with 200 OK");
  const contentJson = await contentRes.json();
  assert.ok(contentJson.hero, "Hero section must be present");
  assert.ok(contentJson.showcase, "Showcase section must be present");
  assert.equal(contentJson.security, undefined, "Public content must NEVER leak security accounts");
  console.log("✔ Integration 1 Passed: Content API serves dynamic data with sensitive security stripped");

  // Test 2: Register Route Redirect
  console.log("\n[Integration 2]: Testing /register redirect...");
  const regRes = await fetch(`${BASE_URL}/register`, { redirect: "manual" });
  assert.ok([307, 308, 302, 301].includes(regRes.status), "Register page must issue a redirect");
  const location = regRes.headers.get("location");
  assert.ok(location && location.includes("/admin"), "/register must redirect directly to /admin");
  console.log("✔ Integration 2 Passed: /register redirects cleanly to /admin");

  // Test 3: Admin Auth with valid credentials
  console.log("\n[Integration 3]: Testing Admin Login with info@artsavvy.co.in & pradeep@2002...");
  const authRes = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "request_otp",
      email: "info@artsavvy.co.in",
      password: "pradeep@2002",
    }),
  });
  const authJson = await authRes.json();
  assert.equal(authJson.success, true, "Valid credentials must succeed");
  assert.equal(authJson.step, "otp_required", "Next step must be otp_required");
  assert.ok(authJson.email === "info@artsavvy.co.in", "Email in response must match");
  console.log("✔ Integration 3 Passed: Valid login requests 2FA OTP successfully");

  // Test 4: Rate Limiting & 3-Attempts 15-Minute Lockout
  console.log("\n[Integration 4]: Testing 3-Failed-Attempts Lockout on test user...");
  const testEmail = `attacker-${Date.now()}@test.com`;

  // Attempt 1
  const fail1 = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "request_otp", email: testEmail, password: "wrongpassword1" }),
  });
  assert.equal(fail1.status, 400, "Attempt 1 must return 400 Bad Request");
  const fail1Json = await fail1.json();
  assert.ok(fail1Json.error && fail1Json.error.includes("Attempt 1 of 3"), "Must indicate attempt 1 of 3");

  // Attempt 2
  const fail2 = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "request_otp", email: testEmail, password: "wrongpassword2" }),
  });
  assert.equal(fail2.status, 400, "Attempt 2 must return 400 Bad Request");
  const fail2Json = await fail2.json();
  assert.ok(fail2Json.error && fail2Json.error.includes("Attempt 2 of 3"), "Must indicate attempt 2 of 3");

  // Attempt 3 -> Lockout Trigger
  const fail3 = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "request_otp", email: testEmail, password: "wrongpassword3" }),
  });
  assert.equal(fail3.status, 429, "Attempt 3 must trigger 429 Too Many Requests");
  const fail3Json = await fail3.json();
  assert.ok(fail3Json.lockedUntil, "429 response must provide lockedUntil timestamp");
  assert.ok(fail3Json.remainingSeconds >= 890, "Lockout duration must be ~15 minutes (900 seconds)");
  assert.ok(fail3Json.error && fail3Json.error.includes("15 minutes"), "Error message must state 15 minutes lockout");

  // Attempt 4 while locked out
  const fail4 = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "request_otp", email: testEmail, password: "wrongpassword4" }),
  });
  assert.equal(fail4.status, 429, "Attempt while locked out must be immediately blocked with 429");
  console.log("✔ Integration 4 Passed: 3 failed attempts strictly triggers 15-minute lockout (HTTP 429)");

  console.log("\n>>> ALL INTEGRATION TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTests().catch((err) => {
  console.error("Integration test failed:", err);
  process.exit(1);
});
