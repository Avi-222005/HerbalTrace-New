// Master Botanical Geofence Rules & Detailed Lab COA Thresholds (AYUSH Pharmacopoeia Standards)
export const botanicalSmartRules = [
  {
    species: "Tulsi (Holy Basil)",
    key: "tulsi",
    scientificName: "Ocimum sanctum",
    commonName: "Holy Basil / Tulasi",
    approvedRegions: "All-India (All States & Territories)",
    coordinates: "8.0° N - 37.0° N (Nationwide)",
    seasonWindow: "Year-Round (Jan 1 - Dec 31)",
    harvestLimit: "10,000 kg / season",
    moistureLimit: "≤ 10.0%",
    heavyMetalLimit: "≤ 0.1 ppm",
    status: "ALL_INDIA_APPROVED",
    color: "emerald",
    labParameters: [
      { id: "moisture", test: "Moisture Content (Loss on Drying)", limit: "≤ 10.0% w/w", defaultValue: "8.2", unit: "% w/w", method: "Oven Drying at 105°C", threshold: 10.0, type: "max" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 19.0% w/w", defaultValue: "14.5", unit: "% w/w", method: "Muffle Furnace at 550°C", threshold: 19.0, type: "max" },
      { id: "acid_insoluble_ash", test: "Acid Insoluble Ash", limit: "≤ 3.0% w/w", defaultValue: "1.8", unit: "% w/w", method: "HCl Digest", threshold: 3.0, type: "max" },
      { id: "lead", test: "Lead (Pb)", limit: "≤ 10.0 ppm", defaultValue: "1.2", unit: "ppm", method: "ICP-MS / AAS", threshold: 10.0, type: "max" },
      { id: "arsenic", test: "Arsenic (As)", limit: "≤ 3.0 ppm", defaultValue: "0.4", unit: "ppm", method: "ICP-MS", threshold: 3.0, type: "max" },
      { id: "cadmium", test: "Cadmium (Cd)", limit: "≤ 0.3 ppm", defaultValue: "0.05", unit: "ppm", method: "ICP-MS", threshold: 0.3, type: "max" },
      { id: "pesticides", test: "Pesticide Residue (Organochlorines)", limit: "Not Detected (ND)", defaultValue: "Not Detected (ND)", unit: "qualitative", method: "GC-MS/MS", threshold: "ND", type: "match" },
      { id: "microbial", test: "Total Microbial Plate Count", limit: "≤ 10^5 CFU/g", defaultValue: "2.4 x 10^3", unit: "CFU/g", method: "USP <2021>", threshold: 100000, type: "max" },
      { id: "dna_barcode", test: "DNA Barcode (rbcL / matK)", limit: "100% Sequence Match", defaultValue: "100% Sequence Match", unit: "qualitative", method: "Sanger Sequencing", threshold: "100%", type: "match" },
      { id: "active_marker", test: "Active Marker (Eugenol / Ursolic Acid)", limit: "≥ 0.50% w/w", defaultValue: "0.85", unit: "% w/w", method: "HPLC-UV", threshold: 0.50, type: "min" }
    ]
  },
  {
    species: "Ashwagandha",
    key: "ashwagandha",
    scientificName: "Withania somnifera",
    commonName: "Indian Ginseng / Asgandh",
    approvedRegions: "Western Ghats, MP, Rajasthan, UP/NCR",
    coordinates: "11.0° N - 28.5° N",
    seasonWindow: "Winter Season (Oct 1 - Mar 31)",
    harvestLimit: "8,000 kg / season",
    moistureLimit: "≤ 9.0%",
    heavyMetalLimit: "≤ 0.1 ppm",
    status: "ACTIVE_HARVEST",
    color: "teal",
    labParameters: [
      { id: "moisture", test: "Moisture Content (Loss on Drying)", limit: "≤ 9.0% w/w", defaultValue: "7.8", unit: "% w/w", method: "Karl Fischer / LOD", threshold: 9.0, type: "max" },
      { id: "withanolides", test: "Total Withanolides (Withaferin A)", limit: "≥ 1.5% w/w", defaultValue: "2.4", unit: "% w/w", method: "HPLC-DAD", threshold: 1.5, type: "min" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 7.0% w/w", defaultValue: "5.2", unit: "% w/w", method: "Muffle Furnace at 550°C", threshold: 7.0, type: "max" },
      { id: "acid_insoluble_ash", test: "Acid Insoluble Ash", limit: "≤ 1.0% w/w", defaultValue: "0.6", unit: "% w/w", method: "HCl Digest", threshold: 1.0, type: "max" },
      { id: "lead", test: "Lead (Pb)", limit: "≤ 10.0 ppm", defaultValue: "1.1", unit: "ppm", method: "ICP-MS", threshold: 10.0, type: "max" },
      { id: "mercury", test: "Mercury (Hg)", limit: "≤ 1.0 ppm", defaultValue: "0.08", unit: "ppm", method: "Cold Vapor AAS", threshold: 1.0, type: "max" },
      { id: "pesticides", test: "Pesticide Multiresidue", limit: "Not Detected (ND)", defaultValue: "Not Detected (ND)", unit: "qualitative", method: "LC-MS/MS", threshold: "ND", type: "match" },
      { id: "yeast_mold", test: "Yeast & Mold Count", limit: "≤ 10^3 CFU/g", defaultValue: "< 10^2", unit: "CFU/g", method: "USP <2021>", threshold: 1000, type: "max" },
      { id: "aflatoxins", test: "Aflatoxins (B1+B2+G1+G2)", limit: "≤ 4.0 ppb", defaultValue: "< 1.0", unit: "ppb", method: "HPLC-FLD", threshold: 4.0, type: "max" },
      { id: "dna_barcode", test: "DNA Barcode (rbcL Sequence)", limit: "100% Authentic Sequence", defaultValue: "100% Authentic Sequence", unit: "qualitative", method: "DNA Barcoding", threshold: "100%", type: "match" }
    ]
  },
  {
    species: "Neem",
    key: "neem",
    scientificName: "Azadirachta indica",
    commonName: "Margosa / Nimba",
    approvedRegions: "All-India (Arid & Semi-Arid Belts)",
    coordinates: "10.0° N - 30.5° N",
    seasonWindow: "Summer - Monsoon (Apr 1 - Jul 31)",
    harvestLimit: "15,000 kg / season",
    moistureLimit: "≤ 12.0%",
    heavyMetalLimit: "≤ 0.15 ppm",
    status: "SEASON_OPEN",
    color: "emerald",
    labParameters: [
      { id: "moisture", test: "Moisture Content", limit: "≤ 12.0% w/w", defaultValue: "9.5", unit: "% w/w", method: "LOD at 105°C", threshold: 12.0, type: "max" },
      { id: "azadirachtin", test: "Azadirachtin Active Content", limit: "≥ 0.30% w/w", defaultValue: "0.48", unit: "% w/w", method: "HPLC", threshold: 0.30, type: "min" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 10.0% w/w", defaultValue: "7.1", unit: "% w/w", method: "Muffle Furnace", threshold: 10.0, type: "max" },
      { id: "acid_insoluble_ash", test: "Acid Insoluble Ash", limit: "≤ 1.5% w/w", defaultValue: "0.9", unit: "% w/w", method: "HCl Digest", threshold: 1.5, type: "max" },
      { id: "heavy_metals", test: "Heavy Metals Total (Pb, As, Cd, Hg)", limit: "≤ 20.0 ppm", defaultValue: "3.4", unit: "ppm", method: "ICP-OES", threshold: 20.0, type: "max" },
      { id: "microbiology", test: "E. coli & Salmonella", limit: "Absent in 10g", defaultValue: "Absent in 10g", unit: "qualitative", method: "Microbiological Culture", threshold: "Absent", type: "match" },
      { id: "pesticides", test: "Organophosphorus Pesticides", limit: "Not Detected (ND)", defaultValue: "Not Detected (ND)", unit: "qualitative", method: "GC-MS/MS", threshold: "ND", type: "match" }
    ]
  },
  {
    species: "Brahmi",
    key: "brahmi",
    scientificName: "Bacopa monnieri",
    commonName: "Water Hyssop / Jalanimba",
    approvedRegions: "Kerala, Coastal Karnataka, West Bengal",
    coordinates: "8.5° N - 22.5° N",
    seasonWindow: "Monsoon - Post Monsoon (Jul 1 - Nov 30)",
    harvestLimit: "3,500 kg / season",
    moistureLimit: "≤ 8.5%",
    heavyMetalLimit: "≤ 0.1 ppm",
    status: "ACTIVE_HARVEST",
    color: "blue",
    labParameters: [
      { id: "moisture", test: "Moisture Content (Loss on Drying)", limit: "≤ 8.5% w/w", defaultValue: "7.2", unit: "% w/w", method: "Loss on Drying", threshold: 8.5, type: "max" },
      { id: "bacosides", test: "Bacosides (A & B Active Content)", limit: "≥ 20.0% w/w", defaultValue: "24.5", unit: "% w/w", method: "Spectrophotometry / HPLC", threshold: 20.0, type: "min" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 18.0% w/w", defaultValue: "13.8", unit: "% w/w", method: "Muffle Furnace", threshold: 18.0, type: "max" },
      { id: "acid_insoluble_ash", test: "Acid Insoluble Ash", limit: "≤ 6.0% w/w", defaultValue: "3.2", unit: "% w/w", method: "HCl Digest", threshold: 6.0, type: "max" },
      { id: "heavy_metals", test: "Heavy Metals (Lead & Cadmium)", limit: "≤ 10.0 ppm", defaultValue: "1.6", unit: "ppm", method: "ICP-MS", threshold: 10.0, type: "max" },
      { id: "dna_barcode", test: "DNA Fingerprint Identification", limit: "Authenticated Bacopa (100%)", defaultValue: "Authenticated Bacopa (100%)", unit: "qualitative", method: "DNA Barcoding", threshold: "100%", type: "match" }
    ]
  },
  {
    species: "Turmeric",
    key: "turmeric",
    scientificName: "Curcuma longa",
    commonName: "Haldi / Haridra",
    approvedRegions: "Telangana, Andhra Pradesh, Maharashtra, Tamil Nadu",
    coordinates: "11.0° N - 20.0° N",
    seasonWindow: "Winter - Spring (Dec 1 - Apr 30)",
    harvestLimit: "20,000 kg / season",
    moistureLimit: "≤ 10.0%",
    heavyMetalLimit: "≤ 0.1 ppm",
    status: "ACTIVE_HARVEST",
    color: "amber",
    labParameters: [
      { id: "moisture", test: "Moisture Content", limit: "≤ 10.0% w/w", defaultValue: "8.0", unit: "% w/w", method: "Karl Fischer / LOD", threshold: 10.0, type: "max" },
      { id: "curcuminoids", test: "Total Curcuminoids (Curcumin, DMC, BDMC)", limit: "≥ 3.0% w/w", defaultValue: "4.8", unit: "% w/w", method: "HPLC-UV", threshold: 3.0, type: "min" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 8.5% w/w", defaultValue: "6.1", unit: "% w/w", method: "Muffle Furnace", threshold: 8.5, type: "max" },
      { id: "acid_insoluble_ash", test: "Acid Insoluble Ash", limit: "≤ 1.0% w/w", defaultValue: "0.5", unit: "% w/w", method: "HCl Digest", threshold: 1.0, type: "max" },
      { id: "lead_chromate", test: "Lead Chromate / Synthetic Dyes", limit: "Absent (Negative)", defaultValue: "Absent (Negative)", unit: "qualitative", method: "Chemical Adulteration Test", threshold: "Absent", type: "match" },
      { id: "lead", test: "Lead (Pb)", limit: "≤ 10.0 ppm", defaultValue: "0.9", unit: "ppm", method: "ICP-MS", threshold: 10.0, type: "max" }
    ]
  },
  {
    species: "Amla",
    key: "amla",
    scientificName: "Phyllanthus emblica",
    commonName: "Indian Gooseberry / Amalaki",
    approvedRegions: "Uttar Pradesh, Madhya Pradesh, Gujarat",
    coordinates: "18.0° N - 28.0° N",
    seasonWindow: "Winter Season (Nov 1 - Feb 28)",
    harvestLimit: "12,000 kg / season",
    moistureLimit: "≤ 10.0%",
    heavyMetalLimit: "≤ 0.1 ppm",
    status: "ACTIVE_HARVEST",
    color: "emerald",
    labParameters: [
      { id: "moisture", test: "Moisture Content (Dried Pulp)", limit: "≤ 10.0% w/w", defaultValue: "7.5", unit: "% w/w", method: "LOD at 105°C", threshold: 10.0, type: "max" },
      { id: "vitamin_c", test: "Ascorbic Acid (Vitamin C) / Tannins", limit: "≥ 1.0% w/w", defaultValue: "1.65", unit: "% w/w", method: "Titrimetric / HPLC", threshold: 1.0, type: "min" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 7.0% w/w", defaultValue: "4.8", unit: "% w/w", method: "Muffle Furnace", threshold: 7.0, type: "max" },
      { id: "heavy_metals", test: "Heavy Metals Assay", limit: "≤ 10.0 ppm", defaultValue: "1.1", unit: "ppm", method: "ICP-MS", threshold: 10.0, type: "max" },
      { id: "microbial", test: "Total Aerobic Microbial Count", limit: "≤ 10^5 CFU/g", defaultValue: "< 10^3", unit: "CFU/g", method: "USP <2021>", threshold: 100000, type: "max" }
    ]
  },
  {
    species: "Shatavari",
    key: "shatavari",
    scientificName: "Asparagus racemosus",
    commonName: "Shatavari / Wild Asparagus",
    approvedRegions: "Northern & Central India, Himalayas foothills",
    coordinates: "20.0° N - 30.0° N",
    seasonWindow: "Autumn - Winter (Oct 1 - Jan 31)",
    harvestLimit: "5,000 kg / season",
    moistureLimit: "≤ 8.0%",
    heavyMetalLimit: "≤ 0.1 ppm",
    status: "ACTIVE_HARVEST",
    color: "teal",
    labParameters: [
      { id: "moisture", test: "Moisture Content (Roots)", limit: "≤ 8.0% w/w", defaultValue: "6.8", unit: "% w/w", method: "Loss on Drying", threshold: 8.0, type: "max" },
      { id: "saponins", test: "Total Saponins (Shatavarin IV)", limit: "≥ 1.0% w/w", defaultValue: "1.42", unit: "% w/w", method: "HPLC-ELSD", threshold: 1.0, type: "min" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 8.0% w/w", defaultValue: "5.5", unit: "% w/w", method: "Muffle Furnace", threshold: 8.0, type: "max" },
      { id: "acid_insoluble_ash", test: "Acid Insoluble Ash", limit: "≤ 1.0% w/w", defaultValue: "0.4", unit: "% w/w", method: "HCl Digest", threshold: 1.0, type: "max" },
      { id: "heavy_metals", test: "Heavy Metals (ICP-MS)", limit: "≤ 10.0 ppm", defaultValue: "1.3", unit: "ppm", method: "ICP-MS", threshold: 10.0, type: "max" }
    ]
  },
  {
    species: "Giloy",
    key: "giloy",
    scientificName: "Tinospora cordifolia",
    commonName: "Guduchi / Amrita",
    approvedRegions: "All-India Tropical & Sub-Tropical Regions",
    coordinates: "8.0° N - 32.0° N",
    seasonWindow: "Year-Round (Jan 1 - Dec 31)",
    harvestLimit: "10,000 kg / season",
    moistureLimit: "≤ 9.0%",
    heavyMetalLimit: "≤ 0.1 ppm",
    status: "ALL_INDIA_APPROVED",
    color: "emerald",
    labParameters: [
      { id: "moisture", test: "Moisture Content (Stem)", limit: "≤ 9.0% w/w", defaultValue: "7.6", unit: "% w/w", method: "LOD at 105°C", threshold: 9.0, type: "max" },
      { id: "bitters", test: "Bitter Principle / Cordifolioside A", limit: "≥ 0.80% w/w", defaultValue: "1.15", unit: "% w/w", method: "HPLC", threshold: 0.80, type: "min" },
      { id: "total_ash", test: "Total Ash", limit: "≤ 8.0% w/w", defaultValue: "5.9", unit: "% w/w", method: "Muffle Furnace", threshold: 8.0, type: "max" },
      { id: "acid_insoluble_ash", test: "Acid Insoluble Ash", limit: "≤ 1.0% w/w", defaultValue: "0.5", unit: "% w/w", method: "HCl Digest", threshold: 1.0, type: "max" },
      { id: "heavy_metals", test: "Heavy Metals (ICP-MS)", limit: "≤ 10.0 ppm", defaultValue: "1.0", unit: "ppm", method: "ICP-MS", threshold: 10.0, type: "max" }
    ]
  },
  {
    species: "Kuth (Saussurea costus)",
    key: "kuth",
    scientificName: "Saussurea costus",
    commonName: "Costus Root / Kustha",
    approvedRegions: "Himalayan Protected High-Altitude Biosphere",
    coordinates: "31.0° N - 34.0° N (Above 2500m)",
    seasonWindow: "Strict Govt Permit Window Only",
    harvestLimit: "500 kg / strictly regulated quota",
    moistureLimit: "≤ 8.0%",
    heavyMetalLimit: "≤ 0.05 ppm",
    status: "RESTRICTED_CONSERVATION",
    color: "rose",
    labParameters: [
      { id: "cites", test: "CITES Export Compliance", limit: "Official Ministry Permit Required", defaultValue: "Verified MOEFCC Permit #2026-984", unit: "qualitative", method: "Regulatory Audit", threshold: "Verified", type: "match" },
      { id: "moisture", test: "Moisture Content", limit: "≤ 8.0% w/w", defaultValue: "6.5", unit: "% w/w", method: "Loss on Drying", threshold: 8.0, type: "max" },
      { id: "costunolide", test: "Costunolide / Dehydrocostus Lactone", limit: "≥ 2.0% w/w", defaultValue: "2.85", unit: "% w/w", method: "HPLC-UV", threshold: 2.0, type: "min" },
      { id: "heavy_metals", test: "Heavy Metals", limit: "≤ 5.0 ppm", defaultValue: "0.8", unit: "ppm", method: "ICP-MS", threshold: 5.0, type: "max" }
    ]
  }
];

// Helper to look up the exact botanical smart rule and parameters for any herb name
export const getBotanicalRule = (speciesName = "") => {
  if (!speciesName) return botanicalSmartRules[0];
  const query = String(speciesName).toLowerCase().trim();
  
  const found = botanicalSmartRules.find(r => 
    r.species.toLowerCase().includes(query) ||
    query.includes(r.key) ||
    r.scientificName.toLowerCase().includes(query) ||
    r.commonName.toLowerCase().includes(query)
  );

  return found || botanicalSmartRules[0];
};

export const getBotanicalParameters = (speciesName = "") => {
  return getBotanicalRule(speciesName).labParameters;
};