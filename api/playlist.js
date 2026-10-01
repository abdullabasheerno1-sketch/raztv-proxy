export default async function handler(req, res) {
  // നിങ്ങളുടെ Xtream Codes വിവരങ്ങൾ ഇവിടെ നൽകിയിരിക്കുന്നു
  const serverUrl = "http://46.249.110.190"; // അല്ലെങ്കിൽ raztv.online
  const username = "MAGNL39E26";
  const password = "hvhS6xsuZP";
  
  const targetUrl = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus&output=hls`;

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const currentBaseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "VLC/3.0.18 LibVLC/3.0.18",
        "Referer": serverUrl
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let m3uContent = await response.text();

    // M3U ഫയലിലെ ലിങ്കുകൾ മാറ്റി Vercel ഡൊമെയ്ൻ സെറ്റ് ചെയ്യുന്നു
    const lines = m3uContent.split('\n');
    const modifiedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        let newUrl = trimmed.replace(/https?:\/\/[^\/]+/, currentBaseUrl);
        return newUrl;
      }
      return line;
    });

    m3uContent = modifiedLines.join('\n');

    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(m3uContent);
    
  } catch (error) {
    res.status(500).send('Error fetching playlist: ' + error.message);
  }
}
