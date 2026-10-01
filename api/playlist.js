module.exports = (req, res) => {
  try {
    const username = 'MAGNL39E26';
    const password = 'hvhS6xsuZP';
    const serverUrl = 'http://raztv.online:80';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const query = req.query || {};
    const streamId = query.stream_id;

    if (streamId) {
      const targetStream = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
      res.writeHead(302, { Location: targetStream });
      res.end();
      return;
    }

    const targetPlaylist = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
    res.writeHead(302, { Location: targetPlaylist });
    res.end();

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Error', details: err.message }));
  }
};
