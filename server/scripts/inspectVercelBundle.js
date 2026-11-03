async function checkFrontendBundle() {
  console.log('[Frontend Bundle] Inspecting https://med-vault-iota.vercel.app...');
  const res = await fetch('https://med-vault-iota.vercel.app/');
  const html = await res.text();
  const match = html.match(/\/assets\/index-[a-zA-Z0-9_-]+\.js/);
  if (!match) {
    console.error('Failed to locate script bundle in HTML');
    return;
  }

  const jsUrl = 'https://med-vault-iota.vercel.app' + match[0];
  console.log(`[Frontend Bundle] Located bundle: ${jsUrl}`);

  const jsRes = await fetch(jsUrl);
  const code = await jsRes.text();

  console.log(`[Frontend Bundle] Size: ${code.length} bytes`);
  console.log(`[Frontend Bundle] References onrender.com: ${code.includes('onrender.com')}`);
  console.log(`[Frontend Bundle] References medvault-api-ayz1: ${code.includes('medvault-api-ayz1')}`);

  const renderUrls = code.match(/https:\/\/[a-zA-Z0-9_.-]*onrender\.com[^\s"'\`)]*/g);
  if (renderUrls) {
    console.log('[Frontend Bundle] Production Backend URLs found:', [...new Set(renderUrls)]);
  } else {
    console.log('[Frontend Bundle] No onrender.com URLs directly embedded (could be using relative or default)');
  }

  // Check if API_BASE_URL logic exists
  console.log('[Frontend Bundle] Contains VITE_API_URL lookup:', code.includes('VITE_API_URL'));
  console.log('[Frontend Bundle] Contains VITE_SOCKET_URL lookup:', code.includes('VITE_SOCKET_URL'));
}

checkFrontendBundle();

