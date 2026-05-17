const express = require('express');
const app = express();

const TARGET = 'https://agentassets.com';
const PORT = process.env.PORT || 3000;

app.use(async (req, res) => {
  const originalHost = req.headers['host'] || '';
  const targetUrl = `${TARGET}${req.url}`;

  console.log(`[proxy] ${req.method} ${req.url} | original host: ${originalHost}`);

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = value;
  }
  headers['host'] = 'agentassets.com';
  headers['x-forwarded-host'] = originalHost;

  let body = null;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'follow',
    });

    console.log(`[proxy] response: ${response.status} | url: ${response.url}`);

    res.status(response.status);

    for (const [key, value] of response.headers.entries()) {
      const skip = ['transfer-encoding', 'connection', 'keep-alive', 'content-encoding'];
      if (!skip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    const buf = await response.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error('[proxy] error:', err.message);
    res.status(502).send('Bad gateway');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);

  if (process.env.RENDER_EXTERNAL_URL) {
    setInterval(async () => {
      try {
        await fetch(process.env.RENDER_EXTERNAL_URL + '/');
        console.log('Keep-alive ping sent');
      } catch (e) {
        console.error('Keep-alive ping failed:', e.message);
      }
    }, 10 * 60 * 1000);
  }
});
