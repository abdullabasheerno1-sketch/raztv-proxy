export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:25460';

  // Allow CORS for all origins so players or web apps can fetch it smoothly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, category_id } = req.query;

  try {
    // 1. Fetch live categories if action is requested
    if (action === 'get_live_categories') {
      const apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`;
      const response = await fetch(apiResponse);
      const data = await response.json();
      return res.status(200).json(data);
    }

    // 2. Fetch live streams or filter by category_id
    if (action === 'get_live_streams') {
      let apiResponse = `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
      if (category_id) {
        apiResponse += `&category_id=${category_id}`;
      }
      const response = await fetch(apiResponse);
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
    const response = await fetch(userInfoUrl);
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch from IPTV server' });
  }
}
