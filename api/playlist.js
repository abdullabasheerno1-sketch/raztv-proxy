export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:80/';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { stream_id } = req.query;

  const fetchOptions = {
    headers: {
      'User-Agent': 'IPTVSmartersPro'
    }
  };

  try {
    // Oru specific channel stream request cheyyumbol ithu vazhi proxy cheyyum
    if (stream_id) {
      const targetStreamUrl = `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`;
      const streamRes = await fetch(targetStreamUrl, fetchOptions);
      
      if (!streamRes.ok) {
        return res.status(500).send('Failed to fetch stream from server');
      }

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      const bodyText = await streamRes.text();
      return res.status(200).send(bodyText);
    }

    // M3U Playlist generation - ellam Vercel link vazhi varan
    const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    const response = await fetch(apiResponse, fetchOptions);
    const streams = await response.json();

    if (!Array.isArray(streams)) {
      return res.status(500).send('Invalid response from IPTV server');
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}/api/playlist`;

    let m3uContent = '#EXTM3U\n';
    streams.forEach((st) => {
      // Direct raz link-nu pakaram Vercel link-ilottu route cheyyunnu
      const proxyStreamUrl = `${baseUrl}?stream_id=${st.stream_id}`;
      m3uContent += `#EXTINF:-1 tvg-id="${st.stream_id}" tvg-name="${st.name}" group-title="Category ${st.category_id || '0'}",${st.name}\n`;
      m3uContent += `${proxyStreamUrl}\n`;
    });

    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="playlist.m3u8"');
    return res.status(200).send(m3uContent);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch from IPTV server' });
  }
}
