import { supabase } from "./lib/supabase";
import { mockInventory } from "./mockData";

export const seedInventory = async () => {
  const { data, error } = await supabase.from("inventory").select("sku").limit(1);
  if (error) {
    throw error;
  }
  if (data && data.length > 0) {
    return "Inventory already seeded.";
  }

  const rows = mockInventory.map((item) => ({
    sku: item.sku,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    price: item.price,
    location: item.location,
    min_stock_threshold: item.minStockThreshold
  }));

  const { error: insertError } = await supabase.from("inventory").insert(rows);
  if (insertError) {
    throw insertError;
  }
  return "Inventory seeded.";
};
