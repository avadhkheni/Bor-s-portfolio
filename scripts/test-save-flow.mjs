import fs from "fs/promises";

async function testSaveFlow() {
  const BASE_URL = "http://localhost:3000";

  console.log("Step 1: Requesting OTP for info@artsavvy.co.in...");
  const res1 = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "request_otp",
      email: "info@artsavvy.co.in",
      password: "pradeep@2002"
    })
  });
  const data1 = await res1.json();
  console.log("Step 1 response:", data1);

  if (!data1.success) {
    console.error("Login Step 1 failed");
    process.exit(1);
  }

  // Read OTP code from response (in dev / test) or site data
  const otp = data1.devOtp || data1.testOtp;
  console.log("OTP code received:", otp);

  // If not in response, read from activeOtp in MongoDB or file
  let activeOtp = otp;
  if (!activeOtp) {
    const raw = await fs.readFile("data/site-data.json", "utf-8");
    const json = JSON.parse(raw);
    activeOtp = json.security?.activeOtp?.code;
    console.log("OTP code from data/site-data.json:", activeOtp);
  }

  console.log("Step 2: Verifying OTP with code:", activeOtp);
  const res2 = await fetch(`${BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "verify_otp",
      email: "info@artsavvy.co.in",
      otp: activeOtp
    })
  });

  const cookieHeader = res2.headers.get("set-cookie");
  console.log("Set-Cookie header from verify_otp:", cookieHeader);
  const data2 = await res2.json();
  console.log("Step 2 response:", data2);

  if (!res2.ok || !data2.success) {
    console.error("Verify OTP failed");
    process.exit(1);
  }

  // Extract session token
  const sessionToken = cookieHeader?.split(";")[0]?.replace("portfolio_admin_session=", "");
  console.log("Session token extracted:", sessionToken ? "YES (length " + sessionToken.length + ")" : "NO");

  // Step 3: Fetch current content
  console.log("\nStep 3: Fetching current content...");
  const getRes = await fetch(`${BASE_URL}/api/content?_t=${Date.now()}`);
  const currentContent = await getRes.json();
  console.log("Current Layer 1:", currentContent.parallaxImages?.[0]?.src);
  console.log("Current Layer 2:", currentContent.parallaxImages?.[1]?.src);

  // Step 4: Swap Layer 1 and Layer 2
  const newParallax = [...currentContent.parallaxImages];
  const temp = newParallax[0];
  newParallax[0] = newParallax[1];
  newParallax[1] = temp;

  const payload = {
    ...currentContent,
    parallaxImages: newParallax
  };

  console.log("\nStep 4: Posting updated content to /api/content with session cookie...");
  const postRes = await fetch(`${BASE_URL}/api/content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `portfolio_admin_session=${sessionToken}`
    },
    body: JSON.stringify(payload)
  });

  console.log("POST /api/content HTTP status:", postRes.status);
  const postData = await postRes.json();
  console.log("POST /api/content response:", postData);

  // Step 5: Refresh (simulate new page reload)
  console.log("\nStep 5: Simulating page refresh (GET /api/content)...");
  const refreshRes = await fetch(`${BASE_URL}/api/content?_t=${Date.now()}`);
  const refreshedContent = await refreshRes.json();
  console.log("Refreshed Layer 1:", refreshedContent.parallaxImages?.[0]?.src);
  console.log("Refreshed Layer 2:", refreshedContent.parallaxImages?.[1]?.src);

  if (refreshedContent.parallaxImages?.[0]?.src === newParallax[0].src) {
    console.log("\n✅ SUCCESS: Changes persisted across refresh!");
  } else {
    console.error("\n❌ FAILED: Changes reverted on refresh!");
  }
}

testSaveFlow().catch(console.error);
