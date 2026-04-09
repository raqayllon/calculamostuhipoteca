module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name } = req.body || {};
  if (!email || !name) return res.status(400).json({ error: 'Faltan campos requeridos' });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Servicio no configurado' });

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({ email, attributes: { FIRSTNAME: name }, updateEnabled: true })
    });
    if (response.status === 201 || response.status === 204 || response.ok) {
      return res.status(200).json({ success: true });
    }
    const data = await response.json();
    return res.status(400).json({ error: data.message || 'Error al procesar la solicitud' });
  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor' });
  }
};
