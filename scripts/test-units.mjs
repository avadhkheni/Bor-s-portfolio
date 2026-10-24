import crypto from "crypto";
import { strict as assert } from "assert";

console.log("=== RUNNING UNIT TESTS ===");

const SESSION_SECRET = "portfolio-secure-session-key-2026";

// Unit 1: Password Hasher
function hashPassword(password) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(password).digest("hex");
}

const testPass = "pradeep@2002";
const expectedHash = "80508f030c3b2dc8fe9209c62f06825814d75b33dc0f7516e36b356c006b2d1a";
assert.equal(hashPassword(testPass), expectedHash, "hashPassword must produce deterministic HMAC-SHA256");
console.log("✔ Unit 1 Passed: Password Hashing is deterministic & matches expected hash");

// Unit 2: Constant-Time safeCompare
function safeCompare(a, b) {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

assert.equal(safeCompare("same-secret", "same-secret"), true, "Identical strings must match");
assert.equal(safeCompare("same-secret", "diff-secret"), false, "Different strings must not match");
assert.equal(safeCompare("short", "longer-string"), false, "Different length strings must safely fail");
assert.equal(safeCompare("", ""), true, "Empty strings must match");
console.log("✔ Unit 2 Passed: safeCompare timing-safe comparison handles all cases safely");

// Unit 3: 6-Digit OTP Generator
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

for (let i = 0; i < 100; i++) {
  const code = generateOtpCode();
  assert.equal(code.length, 6, "OTP must always be 6 digits");
  assert.equal(/^\d{6}$/.test(code), true, "OTP must be numeric only");
  const num = parseInt(code, 10);
  assert.ok(num >= 100000 && num <= 999999, "OTP must be between 100000 and 999999");
}
console.log("✔ Unit 3 Passed: OTP Generator produces valid 6-digit numeric codes consistently");

// Unit 4: Lockout Time Formatter (MM:SS)
function formatLockoutTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

assert.equal(formatLockoutTime(900), "15:00", "900 seconds must format to 15:00");
assert.equal(formatLockoutTime(899), "14:59", "899 seconds must format to 14:59");
assert.equal(formatLockoutTime(65), "1:05", "65 seconds must format to 1:05");
assert.equal(formatLockoutTime(9), "0:09", "9 seconds must format to 0:09");
assert.equal(formatLockoutTime(0), "0:00", "0 seconds must format to 0:00");
console.log("✔ Unit 4 Passed: Lockout countdown time formatter verified");

// Unit 5: Multi-Hash Password Validation (HMAC, direct SHA-256, plain)
function isPasswordValid(passwordHash, inputPassword) {
  const inputHash = hashPassword(inputPassword);
  const directSha256 = crypto.createHash("sha256").update(inputPassword).digest("hex");
  return (
    safeCompare(passwordHash, inputHash) ||
    safeCompare(passwordHash, directSha256) ||
    passwordHash === inputPassword
  );
}

assert.equal(isPasswordValid(expectedHash, "pradeep@2002"), true, "Valid password matches HMAC hash");
assert.equal(isPasswordValid(expectedHash, "wrong@pass"), false, "Wrong password must be rejected");
const sha256Hash = crypto.createHash("sha256").update("pradeep@2002").digest("hex");
assert.equal(isPasswordValid(sha256Hash, "pradeep@2002"), true, "Valid password matches direct SHA-256 fallback");
console.log("✔ Unit 5 Passed: Multi-hash password resilience verified");

console.log("\n>>> ALL 5 UNIT TESTS PASSED SUCCESSFULLY! <<<\n");
