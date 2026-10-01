export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:80/';
  const streamServerUrl = 'http://raztv.online:80/';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  const fetchOptions = {
    headers: {
      'User-Agent': 'IPTVSmartersPro'
    }
  };

  try {
    const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    const response = await fetch(apiResponse, fetchOptions);
    const streams = await response.json();

    if (!Array.isArray(streams)) {
      return res.status(500).send('Invalid response from IPTV server');
    }

    // Single stream request or full M3U playlist based on action
    if (action === 'stream' || req.url.includes('.m3u8')) {
      let m3uContent = '#EXTM3U\n';
      streams.forEach((st) => {
        const streamUrl = `${streamServerUrl}/live/${username}/${password}/${st.stream_id}.m3u8`;
        m3uContent += `#EXTINF:-1 tvg-id="${st.stream_id}" tvg-name="${st.name}" group-title="Category ${st.category_id || '0'}",${st.name}\n`;
        m3uContent += `${streamUrl}\n`;
      });

      res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="playlist.m3u8"');
      return res.status(200).send(m3uContent);
    }

    // Default response as full m3u playlist to match requested format
    let m3uContent = '#EXTM3U\n';
    streams.forEach((st) => {
      const streamUrl = `${streamServerUrl}/live/${username}/${password}/${st.stream_id}.m3u8`;
      m3uContent += `#EXTINF:-1 tvg-id="${st.stream_id}" tvg-name="${st.name}" group-title="Category ${st.category_id || '0'}",${st.name}\n`;
      m3uContent += `${streamUrl}\n`;
    });

    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    return res.status(200).send(m3uContent);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch from IPTV server' });
  }
}
