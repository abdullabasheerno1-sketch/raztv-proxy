export default async function handler(req, res) {
    // CORS എനേബിൾ ചെയ്യാൻ (ആപ്പിൽ നിന്ന് കണക്റ്റ് ചെയ്യാൻ)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // നിങ്ങളുടെ ഒറിജിനൽ സെർവർ വിവരങ്ങൾ ഇവിടെ നൽകുക
    const BASE_URL = "http://raztv.online/";
    const USERNAME = "MAGNL39E26";
    const PASSWORD = "hvhS6xsuZP";

    // ആപ്പിൽ നിന്ന് വരുന്ന ആക്ഷൻ (ഉദാ: get_live_categories, get_live_streams) എടുത്തു മാറ്റുക
    const action = req.query.action || '';
    const category_id = req.query.category_id || '';

    let targetUrl = `${BASE_URL}player_api.php?username=${USERNAME}&password=${PASSWORD}`;
    
    if (action) {
        targetUrl += `&action=${action}`;
    }
    if (category_id) {
        targetUrl += `&category_id=${category_id}`;
    }

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();
        
        // ക്ലയന്റിലേക്ക് (ആപ്പിലേക്ക്) ഡാറ്റ പാസ്സ് ചെയ്യുക
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from IPTV server", details: error.message });
    }
}
