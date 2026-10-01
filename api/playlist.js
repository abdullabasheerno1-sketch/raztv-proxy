export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:25460';

  // Allow CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, category_id } = req.query;

  // Custom headers to mimic a real browser/player request
  const fetchOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  };

  try {
    // 1. Get Live Categories
    if (action === 'get_live_categories') {
      const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`;
      const response = await fetch(apiResponse, fetchOptions);
      const data = await response.json();
      return res.status(200).json(data);
    }

    // 2. Get Live Streams by Category ID
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

    // 3. Default: Return user account & server info JSON
    const userInfoUrl = `${serverUrl}/player_api.php?username=${username}&password=${password}`;
    const response = await fetch(userInfoUrl, fetchOptions);
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch from IPTV server' });
  }
}
