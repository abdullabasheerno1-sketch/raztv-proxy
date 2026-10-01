export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:80/';
  const vercelBaseUrl = 'https://raztv-proxy-31ih.vercel.app/api/playlist';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { stream_id } = req.query;

  // ചാനൽ പ്ലേ ചെയ്യുമ്പോൾ ഒറിജിനൽ ലിങ്കിലേക്ക് റീഡയറക്ട് ചെയ്യും
  if (stream_id) {
    const targetStreamUrl = `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`;
    res.setHeader('Location', targetStreamUrl);
    return res.status(302).end();
  }

  try {
    const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    
    const response = await fetch(apiResponse, {
      headers: { 'User-Agent': 'IPTVSmartersPro' }
    });

    if (!response.ok) {
      throw new Error('IPTV server error');
    }

    const streams = await response.json();

    if (!Array.isArray(streams)) {
      return res.status(500).send('Invalid response from server');
    }

    let m3uContent = '#EXTM3U\n';
    streams.forEach((st) => {
      const proxyStreamUrl = `${vercelBaseUrl}?stream_id=${st.stream_id}`;
      m3uContent += `#EXTINF:-1 tvg-id="${st.stream_id}" tvg-name="${st.name}" group-title="${st.category_id || 'General'}",${st.name}\n`;
      m3uContent += `${proxyStreamUrl}\n`;
    });

    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    return res.status(200).send(m3uContent);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate playlist' });
  }
}
