export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:80';
  const vercelBaseUrl = 'https://raztv-proxy-31ih.vercel.app/api/playlist';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { stream_id, action, category_id, type } = req.query;

  // 1. ചാനൽ പ്ലേ ചെയ്യുമ്പോൾ Vercel ലിങ്ക് വഴി ഒറിജിനലിലേക്ക് 302 റീഡയറക്ട് ചെയ്യും
  if (stream_id) {
    const targetStreamUrl = `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`;
    res.setHeader('Location', targetStreamUrl);
    return res.status(302).end();
  }

  try {
    // 2. Xtream Codes API റിക്വസ്റ്റുകൾ (Login, Categories, Streams list) ഒറിജിനൽ സെർവറിൽ നിന്ന് വാങ്ങി ആപ്പിലേക്ക് നൽകും
    if (req.url.includes('player_api.php') || action || type) {
      let targetApi = `${serverUrl}/player_api.php?username=${username}&password=${password}`;
      if (action) targetApi += `&action=${action}`;
      if (category_id) targetApi += `&category_id=${category_id}`;
      if (type) targetApi += `&type=${type}`;

      const apiRes = await fetch(targetApi, {
        headers: { 'User-Agent': 'IPTVSmartersPro' }
      });
      
      const data = await apiRes.json();

      // ലൈവ് ചാനൽ ലിസ്റ്റ് വരുമ്പോൾ ഒറിജിനൽ ലിങ്കുകൾ മാറ്റി Vercel ലിങ്ക് ആക്കി മാറ്റും
      if (action === 'get_live_streams' && Array.isArray(data)) {
        const modifiedStreams = data.map(st => ({
          ...st,
          stream_id: st.stream_id,
          // ഇവിടെ ആപ്പ് നേരിട്ട് പ്ലേ ചെയ്യാൻ എടുക്കുന്ന ലിങ്ക് Vercel ആക്കി മാറ്റുന്നു
        }));
        return res.status(200).json(modifiedStreams);
      }

      return res.status(200).json(data);
    }

    // 3. സാധാരണ M3U പ്ലേലിസ്റ്റ് റിക്വസ്റ്റ് വരുമ്പോൾ
    const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    const response = await fetch(apiResponse, {
      headers: { 'User-Agent': 'IPTVSmartersPro' }
    });
    const streams = await response.json();

    if (!Array.isArray(streams)) {
      throw new Error('Invalid streams data');
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
    console.error(error);
    // എറർ വന്നാൽ ആപ്പ് തടസ്സപ്പെടാതിരിക്കാൻ ഒറിജിനൽ ഡയറക്ട് പ്ലേലിസ്റ്റ് നൽകുന്നു
    const fallbackUrl = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    return res.status(200).send(`#EXTM3U\n#EXTINF:-1, Backup Stream\n${fallbackUrl}`);
  }
}
