/**
 * Aides et Territoires API Client
 * Documentation: https://aides-territoires.beta.gouv.fr/api
 */

const API_BASE = "https://aides-territoires.beta.gouv.fr/api";
const AUTH_ENDPOINT = `${API_BASE}/connexion/`;

interface BearerTokenResponse {
  token: string;
}

interface AidesTerritoriesAid {
  id: string;
  slug: string;
  name: string;
  name_initial: string | null;
  short_title: string | null;
  description: string;
  eligibility: string;
  project_examples: string | null;
  
  // Types et audiences
  targeted_audiences: string[];
  aid_types: string[];
  aid_types_full: Array<{ id: string; name: string }>;
  categories: string[];
  mobilization_steps: string[];
  destinations: string[];
  
  // Périmètre géographique
  perimeter: {
    id: string;
    name: string;
    scale: string;
  } | null;
  perimeter_id: string | null;
  perimeter_scale: string | null;
  
  // Financeurs et instructeurs
  financers: Array<{
    id: string;
    name: string;
  }>;
  financers_full: Array<{ id: string; name: string }>;
  instructors: string[];
  instructors_full: Array<{ id: string; name: string }>;
  programs: Array<{ id: string; name: string }>;
  
  // Montants
  subvention_rate_lower_bound: number | null;
  subvention_rate_upper_bound: number | null;
  subvention_comment: string | null;
  loan_amount: number | null;
  recoverable_advance_amount: number | null;
  
  // URLs et contact
  application_url: string;
  origin_url: string | null;
  url: string;
  contact: string;
  
  // Dates
  submission_deadline: string | null;
  predeposit_date: string | null;
  start_date: string | null;
  recurrence: string | null;
  
  // Métadonnées
  is_call_for_project: boolean;
  is_charged: boolean;
  european_aid: string | null;
  date_created: string;
  date_updated: string;
  
  // Import data
  import_data_url: string | null;
  import_data_mention: string | null;
  import_share_licence: string | null;
  project_references: string | null;
}

interface AidesTerritoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AidesTerritoriesAid[];
}

/**
 * Get Bearer Token from API Token
 * Valid for 24 hours
 */
async function getBearerToken(): Promise<string> {
  const apiToken = process.env.AIDES_ET_TERRITOIRES_API_KEY;
  
  if (!apiToken) {
    throw new Error("AIDES_ET_TERRITOIRES_API_KEY is not configured");
  }

  const response = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "X-AUTH-TOKEN": apiToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Authentication failed: ${response.status} - ${error}`);
  }

  const data: BearerTokenResponse = await response.json();
  return data.token;
}

/**
 * Fetch aids from Aides et Territoires API
 */
export async function fetchAides(params: {
  targeted_audiences?: string[];
  aid_types?: string[];
  perimeter?: string;
  text?: string;
  page?: number;
  page_size?: number;
}): Promise<AidesTerritoriesResponse> {
  const bearerToken = await getBearerToken();
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (params.targeted_audiences) {
    params.targeted_audiences.forEach(audience => {
      queryParams.append("targeted_audiences", audience);
    });
  }
  
  if (params.aid_types) {
    params.aid_types.forEach(type => {
      queryParams.append("aid_types", type);
    });
  }
  
  if (params.perimeter) {
    queryParams.append("perimeter", params.perimeter);
  }
  
  if (params.text) {
    queryParams.append("text", params.text);
  }
  
  if (params.page) {
    queryParams.append("page", params.page.toString());
  }
  
  if (params.page_size) {
    queryParams.append("page_size", params.page_size.toString());
  }

  const url = `${API_BASE}/aids/?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Test API connection
 */
export async function testApiConnection(): Promise<{
  success: boolean;
  message: string;
  sampleAids?: AidesTerritoriesAid[];
  totalCount?: number;
}> {
  try {
    console.log("🔐 Authenticating with Aides et Territoires API...");
    const bearerToken = await getBearerToken();
    console.log("✅ Authentication successful! Bearer token obtained.");

    console.log("📡 Fetching cultural aids...");
    const response = await fetchAides({
      text: "culture",
      page_size: 5,
    });

    console.log(`✅ API working! Found ${response.count} cultural aids.`);

    return {
      success: true,
      message: `Successfully connected to Aides et Territoires API. Found ${response.count} cultural aids.`,
      sampleAids: response.results,
      totalCount: response.count,
    };
  } catch (error) {
    console.error("❌ API test failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
