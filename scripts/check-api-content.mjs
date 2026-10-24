async function check() {
  const res = await fetch("http://localhost:3000/api/content");
  const json = await res.json();
  console.log("API returned status:", res.status);
  console.log("Parallax images count:", json.parallaxImages?.length);
  json.parallaxImages?.forEach((p, i) => {
    console.log(`Layer ${i + 1}: ${p.src} (${p.alt})`);
  });
}
check().catch(console.error);
