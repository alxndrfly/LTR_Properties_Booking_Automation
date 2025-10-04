import { JsonPayload, FormSelectionPayload } from '../types';

/**
 * Fetches complete recommendation data from n8n webhook via Netlify Function
 * This function returns all data in a single call including property details and images
 */
export async function fetchRecommendations(uuid: string): Promise<JsonPayload> {
  // Call the Netlify Function which proxies to n8n webhook
  const response = await fetch(`/.netlify/functions/get-recommendations?uuid=${encodeURIComponent(uuid)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to fetch recommendations: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate that we have the required structure
  if (!data.property_inquired || !data.algo_top_properties) {
    throw new Error('Invalid data structure received from server');
  }

  return data;
}

/**
 * Fetches form selection data from Airtable via Netlify Function
 * This function retrieves the info_to_pass field from the Website JSON table
 */
export async function fetchFormData(uuid: string): Promise<FormSelectionPayload> {
  // Call the Netlify Function to fetch form data
  const response = await fetch(`/.netlify/functions/fetch-form-data?uuid=${encodeURIComponent(uuid)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to fetch form data: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate that we have the required structure
  if (!data.client_name || !data.forms) {
    throw new Error('Invalid form data structure received from server');
  }

  return data;
}