export default function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:80/';

  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const fullUrl = new URL(req.url, `${protocol}://${host}`);
  const streamId = fullUrl.searchParams.get('stream_id');

  let targetUrl = '';
  if (streamId) {
    targetUrl = `${serverUrl}/live/${username}/${password}/${streamId}.m3u8`;
  } else {
    targetUrl = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.redirect(302, targetUrl);
}
