import { z } from "zod";

export const GeoLocationSchema = z.object({
  city: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  pincode: z.string().regex(/^\d{6}$/, "Indian pin code must be 6 digits"),
  locality: z.string().min(1),
  state: z.string().min(1),
});

export type GeoLocation = z.infer<typeof GeoLocationSchema>;

export type CityPresetName =
  // 7 Major Metro Hubs
  | "bengaluru"
  | "mumbai"
  | "delhi"
  | "hyderabad"
  | "pune"
  | "chennai"
  | "kolkata"
  // 5 Bengaluru High-Density Micro-Markets
  | "blr-koramangala"
  | "blr-indiranagar"
  | "blr-hsr"
  | "blr-whitefield"
  | "blr-jayanagar"
  // 4 Mumbai High-Density Micro-Markets
  | "mum-bandra"
  | "mum-andheri"
  | "mum-powai"
  | "mum-lowerparel"
  // 4 Delhi-NCR High-Density Micro-Markets
  | "del-connaught"
  | "del-saket"
  | "ncr-gurgaon-dlf"
  | "ncr-noida-sec62";

export const CITY_PRESETS: Record<CityPresetName, GeoLocation> = {
  // Major Metro Hubs (7)
  bengaluru: {
    city: "Bengaluru",
    lat: 12.9716,
    lon: 77.5946,
    pincode: "560001",
    locality: "MG Road, Bengaluru",
    state: "Karnataka",
  },
  mumbai: {
    city: "Mumbai",
    lat: 19.076,
    lon: 72.8777,
    pincode: "400001",
    locality: "Fort, Mumbai",
    state: "Maharashtra",
  },
  delhi: {
    city: "New Delhi",
    lat: 28.6139,
    lon: 77.209,
    pincode: "110001",
    locality: "Connaught Place, New Delhi",
    state: "Delhi",
  },
  hyderabad: {
    city: "Hyderabad",
    lat: 17.385,
    lon: 78.4867,
    pincode: "500001",
    locality: "Banjara Hills, Hyderabad",
    state: "Telangana",
  },
  pune: {
    city: "Pune",
    lat: 18.5204,
    lon: 73.8567,
    pincode: "411001",
    locality: "Shivajinagar, Pune",
    state: "Maharashtra",
  },
  chennai: {
    city: "Chennai",
    lat: 13.0827,
    lon: 80.2707,
    pincode: "600001",
    locality: "George Town, Chennai",
    state: "Tamil Nadu",
  },
  kolkata: {
    city: "Kolkata",
    lat: 22.5726,
    lon: 88.3639,
    pincode: "700001",
    locality: "BBD Bagh, Kolkata",
    state: "West Bengal",
  },

  // Bengaluru Micro-Markets (5)
  "blr-koramangala": {
    city: "Bengaluru",
    lat: 12.9352,
    lon: 77.6245,
    pincode: "560034",
    locality: "Koramangala 4th Block, Bengaluru",
    state: "Karnataka",
  },
  "blr-indiranagar": {
    city: "Bengaluru",
    lat: 12.9784,
    lon: 77.6408,
    pincode: "560038",
    locality: "Indiranagar 100 Feet Rd, Bengaluru",
    state: "Karnataka",
  },
  "blr-hsr": {
    city: "Bengaluru",
    lat: 12.9121,
    lon: 77.6446,
    pincode: "560102",
    locality: "HSR Layout Sector 2, Bengaluru",
    state: "Karnataka",
  },
  "blr-whitefield": {
    city: "Bengaluru",
    lat: 12.9698,
    lon: 77.75,
    pincode: "560066",
    locality: "Whitefield ITPL Main Rd, Bengaluru",
    state: "Karnataka",
  },
  "blr-jayanagar": {
    city: "Bengaluru",
    lat: 12.925,
    lon: 77.5938,
    pincode: "560041",
    locality: "Jayanagar 4th Block, Bengaluru",
    state: "Karnataka",
  },

  // Mumbai Micro-Markets (4)
  "mum-bandra": {
    city: "Mumbai",
    lat: 19.0596,
    lon: 72.8295,
    pincode: "400050",
    locality: "Bandra West, Mumbai",
    state: "Maharashtra",
  },
  "mum-andheri": {
    city: "Mumbai",
    lat: 19.1136,
    lon: 72.8697,
    pincode: "400053",
    locality: "Andheri West, Mumbai",
    state: "Maharashtra",
  },
  "mum-powai": {
    city: "Mumbai",
    lat: 19.1176,
    lon: 72.906,
    pincode: "400076",
    locality: "Hiranandani Powai, Mumbai",
    state: "Maharashtra",
  },
  "mum-lowerparel": {
    city: "Mumbai",
    lat: 18.9953,
    lon: 72.829,
    pincode: "400013",
    locality: "Lower Parel, Mumbai",
    state: "Maharashtra",
  },

  // Delhi-NCR Micro-Markets (4)
  "del-connaught": {
    city: "New Delhi",
    lat: 28.6315,
    lon: 77.2167,
    pincode: "110001",
    locality: "Connaught Place, New Delhi",
    state: "Delhi",
  },
  "del-saket": {
    city: "New Delhi",
    lat: 28.5246,
    lon: 77.2066,
    pincode: "110017",
    locality: "Saket, New Delhi",
    state: "Delhi",
  },
  "ncr-gurgaon-dlf": {
    city: "Gurugram",
    lat: 28.4946,
    lon: 77.0888,
    pincode: "122002",
    locality: "DLF Phase 3, Gurugram",
    state: "Haryana",
  },
  "ncr-noida-sec62": {
    city: "Noida",
    lat: 28.6279,
    lon: 77.3649,
    pincode: "201309",
    locality: "Sector 62, Noida",
    state: "Uttar Pradesh",
  },
};

const CITY_ALIASES: Record<string, CityPresetName> = {
  bangalore: "bengaluru",
  blr: "bengaluru",
  bengaluru: "bengaluru",
  koramangala: "blr-koramangala",
  "blr-koramangala": "blr-koramangala",
  indiranagar: "blr-indiranagar",
  "blr-indiranagar": "blr-indiranagar",
  hsr: "blr-hsr",
  "blr-hsr": "blr-hsr",
  whitefield: "blr-whitefield",
  "blr-whitefield": "blr-whitefield",
  jayanagar: "blr-jayanagar",
  "blr-jayanagar": "blr-jayanagar",
  mumbai: "mumbai",
  bom: "mumbai",
  bandra: "mum-bandra",
  "mum-bandra": "mum-bandra",
  andheri: "mum-andheri",
  "mum-andheri": "mum-andheri",
  powai: "mum-powai",
  "mum-powai": "mum-powai",
  lowerparel: "mum-lowerparel",
  "mum-lowerparel": "mum-lowerparel",
  delhi: "delhi",
  "new delhi": "delhi",
  ncr: "delhi",
  del: "delhi",
  "del-connaught": "del-connaught",
  saket: "del-saket",
  "del-saket": "del-saket",
  gurgaon: "ncr-gurgaon-dlf",
  gurugram: "ncr-gurgaon-dlf",
  "ncr-gurgaon-dlf": "ncr-gurgaon-dlf",
  noida: "ncr-noida-sec62",
  "ncr-noida-sec62": "ncr-noida-sec62",
  hyderabad: "hyderabad",
  hyd: "hyderabad",
  pune: "pune",
  pnq: "pune",
  chennai: "chennai",
  madras: "chennai",
  kolkata: "kolkata",
  calcutta: "kolkata",
};

export type GeoInput =
  | CityPresetName
  | string
  | {
      lat: number;
      lon: number;
      pincode: string;
      city?: string;
      locality?: string;
      state?: string;
    };

/**
 * Resolves any of the 20 Indian metro/micro-market presets (e.g. "blr-koramangala",
 * "mum-bandra", "ncr-gurgaon-dlf") or custom coordinate object into a validated `GeoLocation`.
 */
export function resolveGeoLocation(input: GeoInput = "bengaluru"): GeoLocation {
  if (typeof input === "string") {
    const normalized = input.trim().toLowerCase();
    const presetKey = CITY_ALIASES[normalized];
    if (presetKey && CITY_PRESETS[presetKey]) {
      return CITY_PRESETS[presetKey];
    }
    return CITY_PRESETS.bengaluru;
  }

  return GeoLocationSchema.parse({
    city: input.city ?? "Bengaluru",
    lat: input.lat,
    lon: input.lon,
    pincode: input.pincode,
    locality: input.locality ?? input.city ?? "Bengaluru",
    state: input.state ?? "India",
  });
}
