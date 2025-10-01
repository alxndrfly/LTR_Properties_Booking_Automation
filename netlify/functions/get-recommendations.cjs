exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Extract UUID from query parameters
  const { uuid } = event.queryStringParameters || {};

  if (!uuid) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'UUID parameter is required' }),
    };
  }

  // Validate UUID format (basic validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid UUID format' }),
    };
  }

  try {
    // Call n8n webhook with UUID
    const n8nUrl = `https://n8n.api-sync.xyz/webhook/generate-recommendations?uuid=${encodeURIComponent(uuid)}`;

    console.log(`Calling n8n webhook for UUID: ${uuid}`);

    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`n8n webhook error: ${response.status} ${response.statusText}`);
      throw new Error(`n8n webhook returned status ${response.status}`);
    }

    // Get the JSON response from n8n
    const data = await response.json();

    // Validate that we got data
    if (!data) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No data returned from webhook' }),
      };
    }

    console.log(`Successfully fetched data for UUID: ${uuid}`);

    // Return the complete data from n8n
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Function error:', error);

    // Provide more detailed error messages
    let errorMessage = 'Internal server error';
    if (error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to recommendation service';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Invalid response format from recommendation service';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};