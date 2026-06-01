exports.handler = async function(event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  try {
    const { path, body, token } = JSON.parse(event.body);

    if (!path || !body) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing path or body' }) };
    }

    const allowed = ['/login.awp', '/emploidutemps.awp'];
    const isAllowed = allowed.some(p => path.includes(p));
    if (!isAllowed) {
      return { statusCode: 403, headers: corsHeaders, body: JSON.stringify({ error: 'Path non autorisé' }) };
    }

    const reqHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (token) reqHeaders['X-Token'] = token;

    const response = await fetch('https://api.ecoledirecte.com/v3' + path, {
      method: 'POST',
      headers: reqHeaders,
      body
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Erreur serveur' })
    };
  }
};
