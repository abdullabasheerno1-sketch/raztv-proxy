export default async function handler(req, res) {
  const targetUrl = "http://raztv.online/get.php?username=MAGNL39E26&password=hvhS6xsuZP&type=m3u_plus&output=hls";

  // നിങ്ങളുടെ Vercel ആപ്ലിക്കേഷന്റെ ഡൊമെയ്ൻ എടുക്കുന്നു
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const currentBaseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "VLC/3.0.18 LibVLC/3.0.18",
        "Referer": "http://raztv.online/"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let m3uContent = await response.text();

    // M3U ഫയലിലെ ഓരോ വരിയും പരിശോധിച്ച് ലിങ്കുകൾ മാത്രം മാറ്റുന്നു
    const lines = m3uContent.split('\n');
    const modifiedLines = lines.map(line => {
      const trimmed = line.trim();
      // '#' ഇല്ലാത്ത വരികൾ (അതായത് സ്ട്രീമിംഗ് ലിങ്കുകൾ) മാത്രം മാറ്റുന്നു
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

