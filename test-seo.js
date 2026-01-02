// Test SEO endpoints
async function testSEOEndpoints() {
  try {
    console.log('Testing SEO endpoints...\n');
    
    // Test sitemap
    console.log('1️⃣  Testing /sitemap.xml');
    const sitemapRes = await fetch('http://localhost:5173/sitemap.xml');
    console.log(`   Status: ${sitemapRes.status}`);
    console.log(`   Content-Type: ${sitemapRes.headers.get('content-type')}`);
    const sitemapText = await sitemapRes.text();
    console.log(`   Size: ${sitemapText.length} bytes`);
    console.log(`   Contains "urlset": ${sitemapText.includes('urlset')}`);
    console.log(`   Contains "loc": ${sitemapText.includes('loc')}`);
    console.log(`   URLs count: ${(sitemapText.match(/<loc>/g) || []).length}\n`);
    
    // Test robots.txt
    console.log('2️⃣  Testing /robots.txt');
    const robotsRes = await fetch('http://localhost:5173/robots.txt');
    console.log(`   Status: ${robotsRes.status}`);
    console.log(`   Content-Type: ${robotsRes.headers.get('content-type')}`);
    const robotsText = await robotsRes.text();
    console.log(`   Size: ${robotsText.length} bytes`);
    console.log(`   Contains "User-agent": ${robotsText.includes('User-agent')}`);
    console.log(`   Contains "Disallow": ${robotsText.includes('Disallow')}`);
    console.log(`   Contains "Sitemap": ${robotsText.includes('Sitemap')}\n`);
    
    // Test GA4 config
    console.log('3️⃣  Testing /api/trpc/settings.getGA4Config');
    const ga4Res = await fetch('/api/trpc/settings.getGA4Config');
    console.log(`   Status: ${ga4Res.status}`);
    if (ga4Res.ok) {
      const ga4Data = await ga4Res.json();
      console.log(`   Response: ${JSON.stringify(ga4Data, null, 2)}`);
    } else {
      console.log(`   Error: endpoint not available`);
    }
    
    console.log('\n✅ All tests completed!');
  } catch (err) {
    console.error('❌ Test error:', err);
  }
}

testSEOEndpoints();
