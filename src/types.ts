export type InventoryItem = {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  value: number;
  location: string;
  minStockThreshold: number;
};

export type ScannedItem = {
  name: string;
  quantity: number;
  confidence: number;
};

export type CartItem = {
  sku: string;
  name: string;
  quantity: number;
};
