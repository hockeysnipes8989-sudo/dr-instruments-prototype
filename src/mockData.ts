import { InventoryItem } from "./types";

export const mockInventory: InventoryItem[] = [
  {
    sku: "MIC-1200",
    name: "Zeiss Primo Star Microscope",
    category: "Microscopes",
    quantity: 6,
    price: 5200,
    value: 31200,
    location: "Lab A - Optics",
    minStockThreshold: 3
  },
  {
    sku: "MIC-2200",
    name: "Leica DM500 Microscope",
    category: "Microscopes",
    quantity: 4,
    price: 6800,
    value: 27200,
    location: "Lab A - Optics",
    minStockThreshold: 2
  },
  {
    sku: "GLS-100",
    name: "Borosilicate Beaker Set (500ml)",
    category: "Glassware",
    quantity: 48,
    price: 18,
    value: 864,
    location: "Storage Bay 2",
    minStockThreshold: 20
  },
  {
    sku: "GLS-210",
    name: "Graduated Cylinder (250ml)",
    category: "Glassware",
    quantity: 36,
    price: 22,
    value: 792,
    location: "Storage Bay 2",
    minStockThreshold: 15
  },
  {
    sku: "GLS-320",
    name: "Erlenmeyer Flask (1L)",
    category: "Glassware",
    quantity: 30,
    price: 28,
    value: 840,
    location: "Storage Bay 1",
    minStockThreshold: 12
  },
  {
    sku: "PPE-015",
    name: "Sterile Lab Coats - Medium",
    category: "PPE",
    quantity: 120,
    price: 14,
    value: 1680,
    location: "PPE Closet",
    minStockThreshold: 60
  },
  {
    sku: "PPE-025",
    name: "Nitrile Gloves (Box of 100)",
    category: "PPE",
    quantity: 240,
    price: 9,
    value: 2160,
    location: "PPE Closet",
    minStockThreshold: 120
  },
  {
    sku: "PPE-035",
    name: "Face Shields",
    category: "PPE",
    quantity: 75,
    price: 12,
    value: 900,
    location: "PPE Closet",
    minStockThreshold: 30
  },
  {
    sku: "CHE-110",
    name: "Ethanol 99% (1L)",
    category: "Chemicals",
    quantity: 40,
    price: 35,
    value: 1400,
    location: "Chemical Vault",
    minStockThreshold: 20
  },
  {
    sku: "CHE-120",
    name: "Isopropyl Alcohol (1L)",
    category: "Chemicals",
    quantity: 55,
    price: 32,
    value: 1760,
    location: "Chemical Vault",
    minStockThreshold: 25
  },
  {
    sku: "CHE-215",
    name: "Buffer Solution pH 7.0",
    category: "Chemicals",
    quantity: 60,
    price: 24,
    value: 1440,
    location: "Chemical Vault",
    minStockThreshold: 30
  },
  {
    sku: "INS-410",
    name: "Digital Calipers",
    category: "Instruments",
    quantity: 18,
    price: 85,
    value: 1530,
    location: "Lab B - Tools",
    minStockThreshold: 8
  },
  {
    sku: "INS-430",
    name: "Thermal Probe Set",
    category: "Instruments",
    quantity: 12,
    price: 120,
    value: 1440,
    location: "Lab B - Tools",
    minStockThreshold: 5
  },
  {
    sku: "INS-510",
    name: "Micro Pipette Kit",
    category: "Instruments",
    quantity: 22,
    price: 260,
    value: 5720,
    location: "Lab B - Tools",
    minStockThreshold: 10
  },
  {
    sku: "LAB-005",
    name: "Stainless Steel Trays",
    category: "Lab Supplies",
    quantity: 32,
    price: 42,
    value: 1344,
    location: "Storage Bay 3",
    minStockThreshold: 12
  },
  {
    sku: "LAB-115",
    name: "Petri Dish Packs",
    category: "Lab Supplies",
    quantity: 90,
    price: 11,
    value: 990,
    location: "Storage Bay 3",
    minStockThreshold: 40
  },
  {
    sku: "LAB-210",
    name: "Centrifuge Tubes (50ml)",
    category: "Lab Supplies",
    quantity: 200,
    price: 1.2,
    value: 240,
    location: "Storage Bay 3",
    minStockThreshold: 100
  },
  {
    sku: "REF-100",
    name: "Ultra-Low Temp Freezer",
    category: "Refrigeration",
    quantity: 2,
    price: 11800,
    value: 23600,
    location: "Cold Storage",
    minStockThreshold: 1
  },
  {
    sku: "REF-210",
    name: "Lab Refrigerator",
    category: "Refrigeration",
    quantity: 3,
    price: 5200,
    value: 15600,
    location: "Cold Storage",
    minStockThreshold: 2
  },
  {
    sku: "SAF-300",
    name: "Emergency Eyewash Station",
    category: "Safety",
    quantity: 5,
    price: 640,
    value: 3200,
    location: "Safety Zone",
    minStockThreshold: 2
  },
  {
    sku: "SAF-420",
    name: "Biohazard Disposal Containers",
    category: "Safety",
    quantity: 26,
    price: 48,
    value: 1248,
    location: "Safety Zone",
    minStockThreshold: 10
  }
];
