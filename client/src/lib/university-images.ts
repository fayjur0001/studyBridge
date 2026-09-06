// Oxford's own news CDN blocks some third-party image requests. Keep this
// stable, publicly embeddable campus image as the card fallback instead.
const OXFORD_IMAGE = "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1400&q=85";
const NUS_IMAGE = "https://times-higher-education.shorthandstories.com/national-university-of-singapore-excellence-in-research-and-education/assets/33DRJduZOu/nus-podcast-series_shorthand_podcast-1-4096x2304.jpg";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1400&q=85";

export function universityImage(name: string, coverImageUrl?: string | null, logoUrl?: string | null) {
  if (/university of oxford/i.test(name)) return OXFORD_IMAGE;
  if (/national university of singapore/i.test(name)) return NUS_IMAGE;
  if (coverImageUrl) return resolveImageUrl(coverImageUrl);
  return logoUrl ? resolveImageUrl(logoUrl) : DEFAULT_IMAGE;
}

function resolveImageUrl(url: string) {
  return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}
import { API_BASE_URL } from "@/lib/api";
