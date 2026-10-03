import { getStore } from '@netlify/blobs';

export const handler = async (event, context) => {
  // Initialize the Netlify Blobs store
  const store = getStore('sanad_data');
  const blobKey = 'app_state';

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const data = await store.get(blobKey, { type: 'text' });
      if (!data) {
        return { statusCode: 200, headers, body: JSON.stringify({}) };
      }
      return { statusCode: 200, headers, body: data };
    }

    if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
      const body = event.body;
      if (!body) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No body provided' }) };
      }
      
      await store.set(blobKey, body);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (error) {
    console.error('Netlify Blobs Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
