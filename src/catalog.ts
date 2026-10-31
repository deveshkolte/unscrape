export interface CommunityTargetMetadata {
  id: string;
  name: string;
  category: string;
  domain: string;
  exampleQuery: string;
  cityAware: boolean;
  tier: "FREE" | "PRO";
}

export const PRO_VAULT_URL =
  process.env.UNSCRAPE_PRO_URL ?? "https://github.com/deveshkolte/unscrape";

export const COMMUNITY_CATALOG: readonly CommunityTargetMetadata[] = [
  {
    "id": "blinkit",
    "name": "Blinkit",
    "category": "Quick-Commerce",
    "domain": "blinkit.com",
    "exampleQuery": "amul butter",
    "cityAware": true,
    "tier": "FREE"
  },
  {
    "id": "zepto",
    "name": "Zepto",
    "category": "Quick-Commerce",
    "domain": "zeptonow.com",
    "exampleQuery": "amul butter",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "bigbasket",
    "name": "BigBasket",
    "category": "Quick-Commerce",
    "domain": "bigbasket.com",
    "exampleQuery": "amul butter",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "jiomart",
    "name": "JioMart Hyperlocal",
    "category": "Quick-Commerce",
    "domain": "jiomart.com",
    "exampleQuery": "amul milk",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "swiggy-instamart",
    "name": "Swiggy Instamart / D2C",
    "category": "Quick-Commerce",
    "domain": "swiggy.com/instamart",
    "exampleQuery": "face wash",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "amazon-in",
    "name": "Amazon India",
    "category": "E-Commerce",
    "domain": "amazon.in",
    "exampleQuery": "amul butter",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "flipkart",
    "name": "Flipkart",
    "category": "E-Commerce",
    "domain": "flipkart.com",
    "exampleQuery": "amul butter",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "myntra",
    "name": "Myntra Fashion",
    "category": "E-Commerce",
    "domain": "myntra.com",
    "exampleQuery": "running shoes",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "nykaa",
    "name": "Nykaa Beauty",
    "category": "Beauty & D2C",
    "domain": "nykaa.com",
    "exampleQuery": "sunscreen",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "meesho",
    "name": "Meesho / Snapdeal",
    "category": "Value E-Commerce",
    "domain": "snapdeal.com",
    "exampleQuery": "watch",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "croma",
    "name": "Croma / Vijay Sales",
    "category": "Electronics",
    "domain": "vijaysales.com",
    "exampleQuery": "iphone",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "reliancedigital",
    "name": "Reliance Digital",
    "category": "Electronics",
    "domain": "reliancedigital.in",
    "exampleQuery": "iphone",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "ajio",
    "name": "Ajio / boAt D2C",
    "category": "Fashion & D2C",
    "domain": "boat-lifestyle.com",
    "exampleQuery": "smartwatch",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "firstcry",
    "name": "FirstCry Kids & Retail",
    "category": "Specialty Retail",
    "domain": "firstcry.com",
    "exampleQuery": "diapers",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "1mg",
    "name": "Tata 1mg",
    "category": "Healthcare & Pharma",
    "domain": "1mg.com",
    "exampleQuery": "dolo",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "pharmeasy",
    "name": "PharmEasy",
    "category": "Healthcare & Pharma",
    "domain": "pharmeasy.in",
    "exampleQuery": "paracetamol",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "apollo247",
    "name": "Apollo 24/7",
    "category": "Healthcare & Pharma",
    "domain": "apollo247.com",
    "exampleQuery": "vitamin c",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "indiamart",
    "name": "IndiaMART B2B Wholesale",
    "category": "B2B Wholesale",
    "domain": "dir.indiamart.com",
    "exampleQuery": "solar panels",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "tradeindia",
    "name": "TradeIndia / ExportersIndia",
    "category": "B2B Wholesale",
    "domain": "tradeindia.com",
    "exampleQuery": "solar panel",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "zomato",
    "name": "Zomato / Magicpin Dining",
    "category": "Food & Dining",
    "domain": "magicpin.in",
    "exampleQuery": "bengaluru",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "bookmyshow",
    "name": "BookMyShow Events",
    "category": "Events & Tickets",
    "domain": "in.bookmyshow.com",
    "exampleQuery": "bengaluru",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "cars24",
    "name": "Cars24 Used Cars",
    "category": "Auto & Mobility",
    "domain": "carwale.com",
    "exampleQuery": "bengaluru",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "spinny",
    "name": "Spinny Used Cars",
    "category": "Auto & Mobility",
    "domain": "spinny.com",
    "exampleQuery": "mumbai",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "bikewale",
    "name": "BikeWale Two-Wheelers",
    "category": "Auto & Mobility",
    "domain": "bikewale.com",
    "exampleQuery": "royalenfield",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "olx-in",
    "name": "OLX / Cashify Pre-Owned",
    "category": "Classifieds",
    "domain": "cashify.in",
    "exampleQuery": "iphone",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "ixigo",
    "name": "Ixigo Intercity Routes",
    "category": "Travel & Hospitality",
    "domain": "ixigo.com",
    "exampleQuery": "bangalore-to-chennai",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "redbus",
    "name": "RedBus Intercity",
    "category": "Travel & Hospitality",
    "domain": "redbus.in",
    "exampleQuery": "mumbai-to-pune",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "makemytrip-hotels",
    "name": "MakeMyTrip / FabHotels",
    "category": "Travel & Hospitality",
    "domain": "fabhotels.com",
    "exampleQuery": "bengaluru",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "magicbricks",
    "name": "MagicBricks",
    "category": "Real Estate",
    "domain": "magicbricks.com",
    "exampleQuery": "Bangalore",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "99acres",
    "name": "99acres / NoBroker",
    "category": "Real Estate",
    "domain": "nobroker.in",
    "exampleQuery": "bengaluru",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "housing",
    "name": "Housing / SquareYards",
    "category": "Real Estate",
    "domain": "squareyards.com",
    "exampleQuery": "bengaluru",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "nseindia",
    "name": "NSE India Live",
    "category": "Finance & Markets",
    "domain": "nseindia.com",
    "exampleQuery": "NIFTY 50",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "screener",
    "name": "Screener.in Fundamentals",
    "category": "Finance & Markets",
    "domain": "screener.in",
    "exampleQuery": "RELIANCE",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "moneycontrol",
    "name": "MoneyControl Quotes",
    "category": "Finance & Markets",
    "domain": "moneycontrol.com",
    "exampleQuery": "RELIANCE",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "groww-mf",
    "name": "Groww / AMFI Mutual Funds",
    "category": "Finance & Markets",
    "domain": "mfapi.in",
    "exampleQuery": "hdfc",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "chittorgarh-ipo",
    "name": "Chittorgarh / IPOWatch GMP",
    "category": "Finance & Markets",
    "domain": "ipowatch.in",
    "exampleQuery": "ipo",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "goodreturns-gold",
    "name": "GoodReturns 24K/22K Gold",
    "category": "Finance & Markets",
    "domain": "goodreturns.in",
    "exampleQuery": "bengaluru",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "coingecko",
    "name": "CoinGecko Crypto (INR)",
    "category": "Finance & Markets",
    "domain": "coingecko.com",
    "exampleQuery": "bitcoin",
    "cityAware": false,
    "tier": "FREE"
  },
  {
    "id": "naukri",
    "name": "Naukri.com Jobs",
    "category": "Jobs & Careers",
    "domain": "naukri.com",
    "exampleQuery": "typescript",
    "cityAware": true,
    "tier": "PRO"
  },
  {
    "id": "hn-jobs",
    "name": "YC / Hacker News Jobs",
    "category": "Jobs & Careers",
    "domain": "news.ycombinator.com",
    "exampleQuery": "",
    "cityAware": false,
    "tier": "FREE"
  },
  {
    "id": "remoteok",
    "name": "RemoteOK Global Jobs",
    "category": "Jobs & Careers",
    "domain": "remoteok.com",
    "exampleQuery": "engineer",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "yc-companies",
    "name": "Y Combinator Directory",
    "category": "Startups & AI",
    "domain": "ycombinator.com/companies",
    "exampleQuery": "AI",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "producthunt",
    "name": "ProductHunt / Dev.to Launches",
    "category": "Startups & AI",
    "domain": "dev.to",
    "exampleQuery": "ai",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "reddit-search",
    "name": "Reddit Search Telemetry",
    "category": "Startups & AI",
    "domain": "reddit.com",
    "exampleQuery": "typescript",
    "cityAware": false,
    "tier": "FREE"
  },
  {
    "id": "github-trending",
    "name": "GitHub Trending Repos",
    "category": "Startups & AI",
    "domain": "github.com/trending",
    "exampleQuery": "typescript",
    "cityAware": false,
    "tier": "FREE"
  },
  {
    "id": "npm-registry",
    "name": "NPM Registry Intelligence",
    "category": "Startups & AI",
    "domain": "registry.npmjs.org",
    "exampleQuery": "playwright",
    "cityAware": false,
    "tier": "FREE"
  },
  {
    "id": "huggingface-models",
    "name": "HuggingFace Trending Models",
    "category": "Startups & AI",
    "domain": "huggingface.co/models",
    "exampleQuery": "",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "arxiv-ai",
    "name": "ArXiv CS/AI Research Papers",
    "category": "Startups & AI",
    "domain": "arxiv.org",
    "exampleQuery": "llm",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "pypi-packages",
    "name": "PyPI Python Packages",
    "category": "Startups & AI",
    "domain": "pypi.org",
    "exampleQuery": "fastapi",
    "cityAware": false,
    "tier": "PRO"
  },
  {
    "id": "dockerhub-images",
    "name": "DockerHub Container Telemetry",
    "category": "Startups & AI",
    "domain": "hub.docker.com",
    "exampleQuery": "library",
    "cityAware": false,
    "tier": "PRO"
  }
];
