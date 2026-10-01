const url = require('url');
const http = require('http');

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

    // സെർവർ വഴി പ്ലേലിസ്റ്റ് ഡാറ്റ നേരിട്ട് ഫെച്ച് ചെയ്ത് പ്ലെയറിലേക്ക് നൽകുന്നു
    http.get(targetUrl, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'audio/x-mpegurl',
        'Access-Control-Allow-Origin': '*'
      });
      proxyRes.pipe(res);
    }).on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch playlist', details: err.message }));
    });

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server Exception', details: err.message }));
  }
};

