import { API_BASE_URL } from "@/lib/api";

// Oxford's own news CDN blocks some third-party image requests. Keep this
// stable, publicly embeddable campus image as the card fallback instead.
const OXFORD_IMAGE = "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1400&q=85";
const NUS_IMAGE = "https://times-higher-education.shorthandstories.com/national-university-of-singapore-excellence-in-research-and-education/assets/33DRJduZOu/nus-podcast-series_shorthand_podcast-1-4096x2304.jpg";

// Previously this fell back to another hotlinked Unsplash URL for every
// university without its own photo (i.e. any newly-added one, since admins
// almost always create the record before uploading campus photos). If that
// third-party host is slow, blocked, or unreachable — common on locked-down
// networks — the card silently renders nothing. An inline SVG has no network
// dependency at all, so a freshly-added university always looks intentional
// instead of showing a blank/black card until a real photo is uploaded.
const PLACEHOLDER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#0d3286'/>
      <stop offset='1' stop-color='#3156c4'/>
    </linearGradient>
  </defs>
  <rect width='400' height='300' fill='url(#g)'/>
  <g fill='#ffffff' fill-opacity='0.28'>
    <path d='M200 92 L292 130 L200 168 L108 130 Z'/>
    <path d='M150 146 v42 c0 14 22 26 50 26 s50 -12 50 -26 v-42' fill='none' stroke='#ffffff' stroke-opacity='0.28' stroke-width='7'/>
    <circle cx='276' cy='138' r='4'/>
    <path d='M276 138 v34' stroke='#ffffff' stroke-opacity='0.28' stroke-width='4'/>
  </g>
</svg>`;
const DEFAULT_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

export function universityImage(name: string, coverImageUrl?: string | null, logoUrl?: string | null) {
  if (/university of oxford/i.test(name)) return OXFORD_IMAGE;
  if (/national university of singapore/i.test(name)) return NUS_IMAGE;
  if (coverImageUrl) return resolveImageUrl(coverImageUrl);
  return logoUrl ? resolveImageUrl(logoUrl) : DEFAULT_IMAGE;
}

// Exposed so cards can fall back to the same placeholder if a real, uploaded
// image URL 404s or otherwise fails to load at runtime.
export function universityImageFallback() {
  return DEFAULT_IMAGE;
}

function resolveImageUrl(url: string) {
  return url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
}

export { resolveImageUrl };