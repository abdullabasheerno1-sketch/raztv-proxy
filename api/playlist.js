export default async function handler(req, res) {
  try {
    const username = 'MAGNL39E26';
    const password = 'hvhS6xsuZP';
    const serverUrl = 'http://raztv.online';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const fullUrl = new URL(req.url, `${protocol}://${host}`);
    const streamId = fullUrl.searchParams.get('stream_id');

    let targetUrl = '';
    if (streamId) {
      targetUrl = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
    } else {
      targetUrl = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
    }

    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from provider' });
    }

    const contentType = response.headers.get('content-type') || 'audio/x-mpegurl';
    res.setHeader('Content-Type', contentType);

    const data = await response.text();
    return res.status(200).send(data);

  } catch (err) {
    return res.status(500).json({ error: 'Server Error', details: err.message });
  }
}
