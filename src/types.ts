export interface Property {
  id: string;
  createdTime?: string;
  Nombre: string;
  "Num Habitaciones": number;
  "Num Baños": number;
  "Area (m²)": number;
  "Lot Size (m²)"?: number;
  Precio: string;
  "Property ID": string;
  Location: string[];
  "Property Type": string[];
  "Num Plazas Garage"?: number;
  "Touristic License": string;
  Description: string;
  "Property Features": string[];
  "Seasonal / Annual": string;
  "Modern / Rustic": string;
  parentRegions: string[];
  scores?: {
    scoreLocation: number;
    scorePrice: number;
    scoreBedrooms: number;
    scoreStyle: number;
  };
  totalScore?: number;
  petFriendly?: boolean;
  Fotos?: string[];
  images?: string[];
}

export interface InquiredProperty {
  id: string;
  name: string;
}

export interface JsonPayload {
  property_inquired_message: string;
  property_inquired: InquiredProperty;
  algo_message: string;
  algo_top4_properties: Property[];
}

export interface AirtableRecord {
  id: string;
  fields: {
    rec_id: string;
    json_payload: string;
  };
}

export interface PropertyWithImages extends Property {
  images?: string[];
}

export type StatusMessage = "ok" | "no_pets_requirement" | "not_available" | "duration_mismatch" | "no_pets_allowed";

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}