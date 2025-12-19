import { supabase } from "./supabaseClient";
import { mockInventory } from "./mockData";

export const seedInventory = async () => {
  const { data, error } = await supabase.from("inventory").select("sku").limit(1);
  if (error) {
    throw error;
  }
  if (data && data.length > 0) {
    return "Inventory already seeded.";
  }
  const { error: insertError } = await supabase.from("inventory").insert(mockInventory);
  if (insertError) {
    throw insertError;
  }
  return "Inventory seeded.";
};
