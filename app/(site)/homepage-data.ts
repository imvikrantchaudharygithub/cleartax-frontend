import { API_CONFIG } from '@/app/lib/api/config';

const BASE = API_CONFIG.BASE_URL;
const REVALIDATE = 300; // 5 minutes

async function serverFetch(url: string): Promise<any> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface HomePageData {
  homeInfo: any | null;
  ipoData: { category: any; subcategories: any[] } | null;
  legalData: { category: any; subcategories: any[] } | null;
  bankingData: { category: any; subcategories: any[] } | null;
  teamMembers: any[];
  testimonials: any[];
}

function extractData(json: any): any {
  if (!json) return null;
  if (json.success && json.data !== undefined) return json.data;
  return json;
}

function normalizeServiceData(json: any): { category: any; subcategories: any[] } | null {
  if (!json) return null;
  // Backend returns { success, data, category, subcategories } at top level
  const subcategories = json.subcategories;
  if (json.category && Array.isArray(subcategories) && subcategories.length > 0) {
    return {
      category: json.category,
      subcategories: subcategories.map((sub: any) => ({
        _id: sub._id || sub.id,
        slug: sub.slug,
        title: sub.title,
        shortDescription: sub.shortDescription ?? sub.description,
        iconName: sub.iconName,
        itemsCount: typeof sub.itemsCount === 'number' ? sub.itemsCount : 0,
      })),
    };
  }
  return null;
}

export async function getHomePageData(): Promise<HomePageData> {
  const [homeInfoRaw, ipoRaw, legalRaw, bankingRaw, teamRaw, featuredRaw] =
    await Promise.all([
      serverFetch(`${BASE}/home-info`),
      serverFetch(`${BASE}/services/ipo`),
      serverFetch(`${BASE}/services/legal`),
      serverFetch(`${BASE}/services/banking-finance`),
      serverFetch(`${BASE}/team`),
      serverFetch(`${BASE}/testimonials/featured`),
    ]);

  const homeInfo = extractData(homeInfoRaw);
  const teamMembers = extractData(teamRaw);
  let testimonials = extractData(featuredRaw);

  // If no featured testimonials, fetch all and take first 6
  if (!Array.isArray(testimonials) || testimonials.length === 0) {
    const allRaw = await serverFetch(`${BASE}/testimonials`);
    const all = extractData(allRaw);
    testimonials = Array.isArray(all) ? all.slice(0, 6) : [];
  }

  return {
    homeInfo,
    ipoData: normalizeServiceData(ipoRaw),
    legalData: normalizeServiceData(legalRaw),
    bankingData: normalizeServiceData(bankingRaw),
    teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
    testimonials: Array.isArray(testimonials) ? testimonials : [],
  };
}
