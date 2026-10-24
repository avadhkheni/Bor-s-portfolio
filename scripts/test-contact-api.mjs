async function testContactApi() {
  const payload = {
    name: "Antigravity Automated Test",
    email: "test.client@example.com",
    projectType: "Full Strategy",
    message: "Hello! This is a test message to verify that inquiries sent through the portfolio contact form arrive directly at info@artsavvy.co.in."
  };

  console.log("Sending POST to http://localhost:3000/api/contact with payload:", payload);
  try {
    const res = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response body:", data);

    if (res.ok && data.success) {
      console.log("SUCCESS: Message routed and sent to info@artsavvy.co.in successfully!");
    } else {
      console.error("FAILURE: API returned error:", data);
      process.exit(1);
    }
  } catch (err) {
    console.error("Request failed:", err);
    process.exit(1);
  }
}

testContactApi();
