exports.handler = async function(event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: 'Method Not Allowed' };

  try {
    const { path, identifiant, motdepasse, body, token } = JSON.parse(event.body);

    const allowed = ['/login.awp', '/emploidutemps.awp'];
    if (!path || !allowed.some(p => path.includes(p))) {
      return { statusCode: 403, headers: cors, body: JSON.stringify({ error: 'Path non autorisé' }) };
    }

    const reqHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ecoledirecte/4.40.1 (iPhone; iOS 16.7; Scale/3.00)',
      'X-Requested-With': 'XMLHttpRequest'
    };
    if (token) reqHeaders['X-Token'] = token;

    let reqBody = body;
    if (path.includes('/login.awp') && identifiant) {
      reqBody = 'data=' + encodeURIComponent(JSON.stringify({
        identifiant,
        motdepasse,
        isRelogin: false,
        uuid: '',
        fa: []
      }));
    }

    const response = await fetch('https://api.ecoledirecte.com/v3' + path, {
      method: 'POST',
      headers: reqHeaders,
      body: reqBody
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Erreur serveur' })
    };
  }
};
