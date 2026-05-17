export default async function handler(req, res) {
  const originalHost = req.headers['host'] || '';
  const targetUrl = `https://agentassets.com${req.url}`;

  const headers = {};
  for (const [key, val] of Object.entries(req.headers)) {
    const skip = ['host', 'connection', 'transfer-encoding'];
    if (!skip.includes(key.toLowerCase())) {
      headers[key] = val;
    }
  }
  headers['host'] = 'agentassets.com';
  headers['x-forwarded-host'] = originalHost;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      redirect: 'follow',
    });

    res.status(response.status);

    for (const [key, val] of response.headers.entries()) {
      const skip = ['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, val);
      }
    }

    const buf = await response.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).send('Bad gateway');
  }
}
