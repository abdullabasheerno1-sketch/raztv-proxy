const axios = require('axios');

module.exports = async (req, res) => {
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(response.data);

  } catch (error) {
    return res.status(500).send('Error Details: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
};
