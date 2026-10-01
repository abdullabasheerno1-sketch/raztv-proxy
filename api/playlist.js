module.exports = function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  // പോർട്ട് 25460 മാറ്റി പോർട്ട് 80 നൽകിയിരിക്കുന്നു
  const serverUrl = 'http://raztv.online'; 

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const stream_id = req.query.stream_id;

  if (stream_id) {
    res.setHeader('Location', serverUrl + '/live/' + username + '/' + password + '/' + stream_id + '.m3u8');
    return res.status(302).end();
  }

  res.setHeader('Location', serverUrl + '/get.php?username=' + username + '&password=' + password + '&type=m3u_plus');
  return res.status(302).end();
}
