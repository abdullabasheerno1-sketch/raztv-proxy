const url = require('url');
const http = require('http');
const https = require('https');

module.exports = (req, res) => {
  try {
    const username = 'MAGNL39E26';
    const password = 'hvhS6xsuZP';
    const serverUrl = 'http://raztv.online';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const streamId = parsedUrl.query.stream_id;

    let targetUrl = '';
    if (streamId) {
      targetUrl = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
    } else {
      targetUrl = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
    }

    // Proxy the request securely to bypass server restrictions
    const client = targetUrl.startsWith('https') ? https : http;
    
    const proxyReq = client.get(targetUrl, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy Error', details: err.message }));
    });

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Error', details: err.message }));
  }
};
