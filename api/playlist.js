export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:25460/';
  
  // നിങ്ങളുടെ യഥാർത്ഥ Vercel ലിങ്ക് ഇവിടെ സെറ്റ് ചെയ്തിരിക്കുന്നു
  const vercelBaseUrl = 'https://raztv-proxy-31ih.vercel.app/api/playlist';

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
    // ഒരു പ്രത്യേക ചാനൽ പ്ലേ ചെയ്യുമ്പോൾ അത് Vercel വഴി പ്രോക്സി ചെയ്ത് എടുത്തു കൊടുക്കും
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

    // M3U പ്ലേലിസ്റ്റ് ജനറേറ്റ് ചെയ്യുമ്പോൾ എല്ലാ ചാനലുകളും നിങ്ങളുടെ Vercel ലിങ്ക് വഴി മാത്രം വരുന്ന രീതിയിൽ
    const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    const response = await fetch(apiResponse, fetchOptions);
    const streams = await response.json();

    if (!Array.isArray(streams)) {
      return res.status(500).send('Invalid response from IPTV server');
    }

    let m3uContent = '#EXTM3U\n';
    streams.forEach((st) => {
      const proxyStreamUrl = `${vercelBaseUrl}?stream_id=${st.stream_id}`;
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
