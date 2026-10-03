const axios = require('axios');

module.exports = async (req, res) => {
  const vercelHost = req.headers.host;
  const protocol = 'https';
  const vercelBase = `${protocol}://${vercelHost}`;

  let targetUrl = 'http://raztv.online/live/MAGNL39E26/hvhS6xsuZP/1339214.m3u8';

  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'http://raztv.online/',
        'Accept': '*/*'
      },
      timeout: 10000
    });

    let body = response.data;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

    // പ്ലേലിസ്റ്റിലെ ലൈനുകൾ മാറ്റിയെഴുതുന്നു
    const lines = body.split('\n');
    const modifiedLines = lines.map(line => {
      if (line && !line.startsWith('#')) {
        let segmentUrl = line;
        if (!line.startsWith('http')) {
          segmentUrl = new URL(line, targetUrl).toString();
        }
        // സെഗ്മെന്റ് ലിങ്കുകളെയും പ്രൊക്സി വഴിയാക്കുന്നു
        return `${vercelBase}/${encodeURIComponent(segmentUrl)}`;
      }
      return line;
    });

    return res.status(200).send(modifiedLines.join('\n'));

  } catch (error) {
    return res.status(500).send('Proxy Error: ' + error.message);
  }
};
