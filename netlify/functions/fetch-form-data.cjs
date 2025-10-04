exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { uuid } = event.queryStringParameters || {};

  if (!uuid) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'UUID parameter is required' }),
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

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/Website%20JSON?filterByFormula=rec_id="${uuid}"`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No record found for the provided UUID' }),
      };
    }

    const infoToPass = data.records[0].fields.info_to_pass;
    if (!infoToPass) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No info_to_pass found in the record' }),
      };
    }

    let formData;
    try {
      formData = JSON.parse(infoToPass);
    } catch (parseError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Invalid info_to_pass format' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formData),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
