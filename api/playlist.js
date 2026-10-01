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

  const { stream_id, type } = req.query;

  // Xtream Codes പ്ലെയർ ലോഗിൻ ചെയ്യുമ്പോഴും ആപ്പ് ഡാറ്റ ഫെച്ച് ചെയ്യുമ്പോഴും ഉള്ള API റൂട്ട്
  const action = req.query.action;
  if (action || type || req.query.username) {
    try {
      const targetApi = `${serverUrl}/player_api.php?username=${username}&password=${password}${action ? '&action=' + action : ''}${type ? '&type=' + type : ''}`;
      const apiRes = await fetch(targetApi, {
        headers: { 'User-Agent': 'IPTVSmartersPro' }
      });
      const data = await apiRes.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'API connection failed' });
    }
  }

  // ചാനൽ പ്ലേ ചെയ്യുമ്പോൾ Vercel ലിങ്ക് വഴി ഒറിജിനൽ സ്ട്രീമിലേക്ക് റീഡയറക്ട് ചെയ്യും
  if (stream_id) {
    const targetStreamUrl = `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`;
    res.setHeader('Location', targetStreamUrl);
    return res.status(302).end();
  }

  try {
    // ലൈവ് ചാനലുകൾ ഫെച്ച് ചെയ്ത് എല്ലാ ലിങ്കുകളും Vercel ലിങ്കാക്കി മാസ്ക് ചെയ്യുന്നു
    const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    const response = await fetch(apiResponse, {
      headers: { 'User-Agent': 'IPTVSmartersPro' }
    });

    const streams = await response.json();

    if (!Array.isArray(streams)) {
      // Xtream Codes പ്ലേലിസ്റ്റ് ഡയറക്ട് ഫോർമാറ്റിലേക്ക് റിഡയറക്ട് ചെയ്യുന്നു
      res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
      const directPlaylist = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
      return res.status(200).send(`#EXTM3U\n#EXTINF:-1, Stream List\n${directPlaylist}`);
    }

    let m3uContent = '#EXTM3U\n';
    streams.forEach((st) => {
      const proxyStreamUrl = `${vercelBaseUrl}?stream_id=${st.stream_id}`;
      m3uContent += `#EXTINF:-1 tvg-id="${st.stream_id}" tvg-name="${st.name}" group-title="${st.category_name || 'General'}",${st.name}\n`;
      m3uContent += `${proxyStreamUrl}\n`;
    });

    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="playlist.m3u8"');
    return res.status(200).send(m3uContent);

  } catch (error) {
    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    const fallbackUrl = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
    return res.status(200).send(`#EXTM3U\n#EXTINF:-1, Backup Stream\n${fallbackUrl}`);
  }
}
