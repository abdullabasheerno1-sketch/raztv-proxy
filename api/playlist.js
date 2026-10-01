export default async function handler(req, res) {
  const username = 'MAGNL39E26';
  const password = 'hvhS6xsuZP';
  const serverUrl = 'http://raztv.online:80/';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { stream_id } = req.query;

  // ഒരു ചാനൽ പ്ലേ ചെയ്യുമ്പോൾ ഒറിജിനൽ ലിങ്കിലേക്ക് റീഡയറക്ട് ചെയ്യും
  if (stream_id) {
    const targetStreamUrl = `${serverUrl}/live/${username}/${password}/${stream_id}.m3u8`;
    res.setHeader('Location', targetStreamUrl);
    return res.status(302).end();
  }

  // പ്ലേലിസ്റ്റ് റിക്വസ്റ്റ് വരുമ്പോൾ ഡയറക്ട് M3U പ്ലേലിസ്റ്റിലേക്ക് റീഡയറക്ട് ചെയ്യും (ഇത് സർവർ എറർ പൂർണ്ണമായി ഒഴിവാക്കും)
  const directM3uUrl = `${serverUrl}/get.php?username=${username}&password=${password}&type=m3u_plus`;
  res.setHeader('Location', directM3uUrl);
  return res.status(302).end();
}
