export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:89/';
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
      'User-Agent': 'VLC/3.0.16 LibVLC/3.0.16'
    }
  };

  try {
    if (stream_id) {
      const targetStreamUrl = `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`;
      const streamRes = await fetch(targetStreamUrl, fetchOptions);
      
      if (!streamRes.ok) {
        return res.status(500).send('Failed to fetch stream');
      }

      const m3u8Content = await streamRes.text();
      
      // ഒറിജിനൽ സെർവർ ലിങ്കുകളെ Vercel വഴി വരുന്ന TS/M3U8 ഫ്രാഗ്മെന്റുകളിലേക്ക് മാറ്റി പ്രോക്സി ചെയ്യുന്നു
      const modifiedContent = m3u8Content.split('\n').map(line => {
        if (line && !line.startsWith('#')) {
          if (line.startsWith('http')) {
            return `${vercelBaseUrl}?stream_segment=${encodeURIComponent(line)}`;
          } else {
            const absoluteSegmentUrl = `${serverUrl}/live/${username}/${password}/${line}`;
            return `${vercelBaseUrl}?stream_segment=${encodeURIComponent(absoluteSegmentUrl)}`;
          }
        }
        return line;
      }).join('\n');

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      return res.status(200).send(modifiedContent);
    }

    // സെഗ്മെന്റ് പ്രോക്സി ചെയ്യാനുള്ള ഭാഗം
    const { stream_segment } = req.query;
    if (stream_segment) {
      const segmentRes = await fetch(stream_segment, fetchOptions);
      if (!segmentRes.ok) {
        return res.status(500).send('Failed to fetch segment');
      }
      res.setHeader('Content-Type', segmentRes.headers.get('content-type') || 'video/mp2t');
      const buffer = await segmentRes.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    }

    // M3U പ്ലേലിസ്റ്റ് ജനറേഷൻ
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
    return res.status(500).json({ error: 'Server error' });
  }
}
