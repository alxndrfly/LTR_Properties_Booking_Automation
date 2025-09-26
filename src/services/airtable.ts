import { JsonPayload, Property } from '../types';

export async function fetchJsonPayload(uuid: string): Promise<JsonPayload> {
  const response = await fetch(`/.netlify/functions/fetch-json-payload?uuid=${uuid}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to fetch JSON payload: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchPropertiesWithImages(propertyIds: string[]): Promise<Property[]> {
  const response = await fetch('/.netlify/functions/fetch-properties', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ propertyIds }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to fetch properties: ${response.statusText}`);
  }

  return await response.json();
}