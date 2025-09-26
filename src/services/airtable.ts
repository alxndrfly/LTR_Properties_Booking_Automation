import { JsonPayload, Property } from '../types';

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export async function fetchJsonPayload(uuid: string): Promise<JsonPayload> {
  const response = await fetch(
    `${BASE_URL}/Website%20JSON?filterByFormula=rec_id="${uuid}"`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch JSON payload: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.records || data.records.length === 0) {
    throw new Error('No record found for the provided UUID');
  }

  const jsonPayloadString = data.records[0].fields.json_payload;
  if (!jsonPayloadString) {
    throw new Error('No JSON payload found in the record');
  }

  try {
    return JSON.parse(jsonPayloadString);
  } catch (error) {
    throw new Error('Invalid JSON payload format');
  }
}

export async function fetchPropertiesWithImages(propertyIds: string[]): Promise<Property[]> {
  const maxRetries = 2;
  const results: Property[] = [];

  for (const propertyId of propertyIds) {
    let attempts = 0;
    let success = false;

    while (attempts <= maxRetries && !success) {
      try {
        const response = await fetch(
          `${BASE_URL}/Properties/${propertyId}`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          const property = data.fields as Property;
          property.id = data.id;

          if (property.Fotos && Array.isArray(property.Fotos)) {
            property.images = property.Fotos.map((foto: any) =>
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

  return results;
}