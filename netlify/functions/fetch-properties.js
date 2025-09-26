exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let propertyIds;
  try {
    const body = JSON.parse(event.body);
    propertyIds = body.propertyIds;
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  if (!propertyIds || !Array.isArray(propertyIds)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'propertyIds array is required' }),
    };
  }

  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const API_KEY = process.env.AIRTABLE_API_KEY;

  if (!BASE_ID || !API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Airtable configuration missing' }),
    };
  }

  const maxRetries = 2;
  const results = [];

  for (const propertyId of propertyIds) {
    let attempts = 0;
    let success = false;

    while (attempts <= maxRetries && !success) {
      try {
        const response = await fetch(
          `https://api.airtable.com/v0/${BASE_ID}/Propiedades/${propertyId}`,
          {
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const property = data.fields;
          property.id = data.id;

          if (property.Fotos && Array.isArray(property.Fotos)) {
            property.images = property.Fotos.map((foto) =>
              typeof foto === 'string' ? foto : foto.url
            );
          }

          results.push(property);
          success = true;
        } else if (response.status === 404) {
          console.warn(`Property ${propertyId} not found, skipping`);
          success = true;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        attempts++;
        console.warn(`Attempt ${attempts} failed for property ${propertyId}:`, error);

        if (attempts > maxRetries) {
          console.error(`Failed to fetch property ${propertyId} after ${maxRetries + 1} attempts, skipping`);
          success = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(results),
  };
};