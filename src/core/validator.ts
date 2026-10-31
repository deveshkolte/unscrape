import { z } from "zod";

/**
 * Target Category & Master Catalog Schemas
 */
export const TargetCategorySchema = z.enum([
  "quick_commerce",
  "real_estate",
  "finance",
  "jobs",
]);

export const TargetsRegistrySchema = z.object({
  quick_commerce: z.array(z.string().min(1)),
  real_estate: z.array(z.string().min(1)),
  finance: z.array(z.string().min(1)),
  jobs: z.array(z.string().min(1)).default([]),
});

/**
 * 1. CommerceItemSchema (Quick-Commerce, E-Commerce, Beauty, Pharma, Classifieds)
 */
export const CommerceItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  brand: z.string().optional(),
  price: z.number().nonnegative(),
  mrp: z.number().nonnegative().optional(),
  discount: z.string().optional(),
  unit: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  inStock: z.boolean(),
  deliveryEta: z.string().optional(),
  prescriptionRequired: z.boolean().optional(),
  source: z.string().min(1),
  url: z.string().url().optional(),
  scrapedAt: z.string(),
});

/**
 * 2. RealEstateListingSchema (MagicBricks, 99acres/NoBroker, Housing/SquareYards)
 */
export const RealEstateListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  priceText: z.string().min(1),
  priceNumeric: z.number().nonnegative().optional(),
  location: z.string().min(1),
  areaSqft: z.string().optional(),
  configuration: z.string().optional(),
  builder: z.string().optional(),
  url: z.string().url(),
  source: z.string().min(1),
  scrapedAt: z.string(),
});

/**
 * 3. StockQuoteSchema (NSE India, Screener.in, MoneyControl, Groww/MFAPI, CoinGecko)
 */
export const StockQuoteSchema = z.object({
  symbol: z.string().min(1),
  companyName: z.string().optional(),
  lastPrice: z.number().nonnegative(),
  change: z.number(),
  pChange: z.number(),
  dayHigh: z.number().nonnegative().optional(),
  dayLow: z.number().nonnegative().optional(),
  volume: z.number().nonnegative().optional(),
  marketCapCr: z.number().nonnegative().optional(),
  peRatio: z.number().optional(),
  roePercent: z.number().optional(),
  source: z.string().min(1),
  timestamp: z.string().min(1),
});

/**
 * 4. JobListingSchema (HN Jobs, Naukri, RemoteOK)
 */
export const JobListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  experience: z.string().optional(),
  salary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  url: z.string().url(),
  source: z.string().min(1),
  postedAt: z.string().optional(),
});

/**
 * 5. CommunityPostSchema (Reddit Search, ProductHunt/Dev.to, NPM Registry, YC Directory)
 */
export const CommunityPostSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  author: z.string().optional(),
  community: z.string().optional(),
  score: z.number().int().nonnegative().default(0),
  commentCount: z.number().int().nonnegative().default(0),
  url: z.string().url(),
  source: z.string().min(1),
  postedAt: z.string().optional(),
});

/**
 * 6. GitHubRepoSchema (GitHub Trending Repositories)
 */
export const GitHubRepoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  language: z.string().optional(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative().default(0),
  starsToday: z.number().int().nonnegative().optional(),
  url: z.string().url(),
  source: z.literal("github.com/trending"),
  scrapedAt: z.string(),
});

/**
 * 7. FoodListingSchema (Zomato / Magicpin Restaurant & Dining Discovery)
 */
export const FoodListingSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cuisine: z.string().optional(),
  priceForTwo: z.string().optional(),
  priceNumeric: z.number().nonnegative().optional(),
  locality: z.string().min(1),
  rating: z.number().min(0).max(5).optional(),
  url: z.string().url(),
  source: z.string().min(1),
  scrapedAt: z.string(),
});

/**
 * 8. EventListingSchema (BookMyShow Live Events & Concerts)
 */
export const EventListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  startDate: z.string().optional(),
  venue: z.string().min(1),
  city: z.string().min(1),
  url: z.string().url(),
  source: z.string().min(1),
  scrapedAt: z.string(),
});

/**
 * 9. VehicleListingSchema (Cars24 / CarWale Used Car Inventory)
 */
export const VehicleListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  brand: z.string().optional(),
  modelYear: z.number().int().optional(),
  kmDriven: z.number().nonnegative().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  price: z.number().nonnegative(),
  city: z.string().min(1),
  url: z.string().url(),
  source: z.string().min(1),
  scrapedAt: z.string(),
});

/**
 * 10. TravelListingSchema (Ixigo / RedBus Intercity Bus & Route Pricing)
 */
export const TravelListingSchema = z.object({
  id: z.string().min(1),
  operator: z.string().min(1),
  serviceType: z.string().min(1),
  route: z.string().min(1),
  departureTime: z.string().min(1),
  arrivalTime: z.string().optional(),
  durationMinutes: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative(),
  rating: z.number().min(0).max(5).optional(),
  source: z.string().min(1),
  scrapedAt: z.string(),
});

// Aliases for backwards compatibility
export const ProductSchema = CommerceItemSchema;
export const PropertySchema = RealEstateListingSchema;
export const MarketSchema = StockQuoteSchema;
export const JobSchema = JobListingSchema;

export type TargetCategory = z.infer<typeof TargetCategorySchema>;
export type TargetsRegistry = z.infer<typeof TargetsRegistrySchema>;
export type CommerceItem = z.infer<typeof CommerceItemSchema>;
export type RealEstateListing = z.infer<typeof RealEstateListingSchema>;
export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type JobListing = z.infer<typeof JobListingSchema>;
export type CommunityPost = z.infer<typeof CommunityPostSchema>;
export type GitHubRepo = z.infer<typeof GitHubRepoSchema>;
export type FoodListing = z.infer<typeof FoodListingSchema>;
export type EventListing = z.infer<typeof EventListingSchema>;
export type VehicleListing = z.infer<typeof VehicleListingSchema>;
export type TravelListing = z.infer<typeof TravelListingSchema>;
export type Product = CommerceItem;
export type Property = RealEstateListing;
export type MarketQuote = StockQuote;

/**
 * Strictly validates a payload against a Zod schema and throws a detailed error on failure.
 */
export function validateSchema<S extends z.ZodTypeAny>(
  schema: S,
  payload: unknown,
  label = "Payload"
): z.output<S> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${label} validation failed: ${issues}`);
  }
  return result.data as z.output<S>;
}
