const OXFORD_IMAGE = "https://www.ox.ac.uk/sites/files/oxford/news_oxford_skyline_cairns.jpg";
const NUS_IMAGE = "https://times-higher-education.shorthandstories.com/national-university-of-singapore-excellence-in-research-and-education/assets/33DRJduZOu/nus-podcast-series_shorthand_podcast-1-4096x2304.jpg";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1400&q=85";

export function universityImage(name: string, coverImageUrl?: string | null, logoUrl?: string | null) {
  if (coverImageUrl) return coverImageUrl;
  if (/university of oxford/i.test(name)) return OXFORD_IMAGE;
  if (/national university of singapore/i.test(name)) return NUS_IMAGE;
  return logoUrl || DEFAULT_IMAGE;
}
