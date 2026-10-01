module.exports = (req, res) => {
  try {
    const username = 'MAGNL39E26';
    const password = 'hvhS6xsuZP';
    const serverUrl = 'http://raztv.online';

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // URL പാരാമീറ്ററുകൾ പരിശോധിക്കുന്നു
    const query = req.query || {};
    const streamId = query.stream_id;

    if (streamId) {
      // ചാനൽ സ്ട്രീം ചെയ്യുമ്പോൾ റീഡയറക്ട് ചെയ്യും
      const targetStream = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
      res.writeHead(302, { Location: targetStream });
      res.end();
      return;
    }

    // മെയിൻ പ്ലേലിസ്റ്റ് ലിങ്കിലേക്ക് റീഡയറക്ട് ചെയ്യും
    const targetPlaylist = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
    res.writeHead(302, { Location: targetPlaylist });
    res.end();

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Error', details: err.message }));
  }
};
