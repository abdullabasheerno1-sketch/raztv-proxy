export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online/';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, category_id } = req.query;

  const fetchOptions = {
    headers: {
      'User-Agent': 'IPTVSmartersPro'
    }
  };

  try {
    if (action === 'm3u') {
      const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
      const response = await fetch(apiResponse, fetchOptions);
      const streams = await response.json();

      if (!Array.isArray(streams)) {
        return res.status(500).send('Invalid response from IPTV server');
      }

      let m3uContent = '#EXTM3U\n';
      streams.forEach((st) => {
        const streamUrl = `${serverUrl}/live/${username}/${password}/${st.stream_id}.m3u8`;
        m3uContent += `#EXTINF:-1 tvg-id="${st.stream_id}" tvg-name="${st.name}" group-title="Category ${st.category_id || '0'}",${st.name}\n`;
        m3uContent += `${streamUrl}\n`;
      });

      res.setHeader('Content-Type', 'audio/x-mpegurl');
      res.setHeader('Content-Disposition', 'inline; filename="playlist.m3u8"');
      return res.status(200).send(m3uContent);
    }

    if (action === 'get_live_categories') {
      const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`;
      const response = await fetch(apiResponse, fetchOptions);
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'get_live_streams') {
      let apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
      if (category_id) {
        apiResponse += `&category_id=${category_id}`;
      }
      const response = await fetch(apiResponse, fetchOptions);
      const streams = await response.json();
      
      const formattedStreams = Array.isArray(streams) ? streams.map(st => ({
        stream_id: st.stream_id,
        name: st.name,
        stream_icon: st.stream_icon,
        category_id: st.category_id,
        quality: "HLS HD",
        url: `${serverUrl}/live/${username}/${password}/${st.stream_id}.m3u8`
      })) : [];

      return res.status(200).json(formattedStreams);
    }

    const userInfoUrl = `${serverUrl}/player_api.php?username=${username}&password=${password}`;
    const response = await fetch(userInfoUrl, fetchOptions);
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch from IPTV server' });
  }
}
