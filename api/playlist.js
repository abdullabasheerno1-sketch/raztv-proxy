export default function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:89/';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { stream_id } = req.query;

  if (stream_id) {
    res.setHeader('Location', `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`);
    return res.status(302).end();
  }

  res.setHeader('Location', `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`);
  return res.status(302).end();
}
