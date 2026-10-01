export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:80/';
  const vercelBaseUrl = 'https://raztv-proxy-31ih.vercel.app/api/playlist';

  const { stream_id } = req.query;

  if (stream_id) {
    res.setHeader('Location', `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`);
    return res.status(302).end();
  }

  // ഫെച്ച് ചെയ്യുന്നതിന് പകരം ഡയറക്ട് M3U പ്ലേലിസ്റ്റ് ജനറേറ്റ് ചെയ്യുന്ന ലിങ്ക് നൽകുന്നു
  res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="playlist.m3u8"');
  
  const directPlaylist = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
  return res.status(200).send(`#EXTM3U\n#EXTINF:-1, Click to load channels\n${directPlaylist}`);
}
