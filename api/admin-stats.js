module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Validate token
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    if (decoded !== adminPassword + ':admin-session') {
      return res.status(401).json({ error: 'No autorizado' });
    }
  } catch {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Fetch subscriber count from Brevo
  let subscribers = null;
  const brevoKey = process.env.BREVO_API_KEY;

  if (brevoKey) {
    try {
      const r = await fetch('https://api.brevo.com/v3/contacts?limit=1&offset=0', {
        headers: { 'api-key': brevoKey, 'Accept': 'application/json' }
      });
      if (r.ok) {
        const data = await r.json();
        subscribers = typeof data.count === 'number' ? data.count : null;
      }
    } catch {
      // Brevo unreachable — subscribers stays null
    }
  }

  return res.status(200).json({
    subscribers,
    articles: 7,
    pages: 4,
    updated: new Date().toISOString()
  });
};
