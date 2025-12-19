import { create } from "zustand";
import { hasSupabaseEnv, supabase } from "../lib/supabase";
import { CartItem, InventoryItem, ScannedItem } from "../types";

type ActivityEntry = {
  message: string;
  timestamp: string;
};

type Toast = {
  id: string;
  message: string;
  variant: "success" | "error";
};

type SyncStatus = "idle" | "syncing" | "synced" | "error";

type StoreState = {
  inventory: InventoryItem[];
  cart: CartItem[];
  scannerResults: ScannedItem[];
  activity: ActivityEntry[];
  toasts: Toast[];
  syncStatus: SyncStatus;
  isLoading: boolean;
  connectionError: string | null;
  initializeStore: () => Promise<void>;
  incrementStock: (sku: string) => Promise<void>;
  decrementStock: (sku: string) => Promise<void>;
  addToOrder: (sku: string) => void;
  updateOrderQuantity: (sku: string, quantity: number) => void;
  finalizeOrder: () => Promise<void>;
  setScannerResults: (results: ScannedItem[]) => void;
  applyScannerUpdates: () => Promise<void>;
  addToast: (message: string, variant: Toast["variant"]) => void;
  removeToast: (id: string) => void;
};

type InventoryRow = {
  sku?: string | null;
  name?: string | null;
  category?: string | null;
  quantity?: number | null;
  price?: number | null;
  location?: string | null;
  min_stock_threshold?: number | null;
};

const nowLabel = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const createToast = (message: string, variant: Toast["variant"]): Toast => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  message,
  variant
});

const withValue = (item: InventoryItem): InventoryItem => ({
  ...item,
  value: Number((item.quantity * item.price).toFixed(2))
});

const mapRowToItem = (row: InventoryRow): InventoryItem =>
  withValue({
    sku: row.sku ?? "UNKNOWN",
    name: row.name ?? "Unnamed Item",
    category: row.category ?? "Uncategorized",
    quantity: row.quantity ?? 0,
    price: row.price ?? 0,
    location: row.location ?? "Unassigned",
    minStockThreshold: row.min_stock_threshold ?? 5,
    value: (row.quantity ?? 0) * (row.price ?? 0)
  });

const mapItemToRow = (item: InventoryItem) => ({
  sku: item.sku,
  name: item.name,
  category: item.category,
  quantity: item.quantity,
  price: item.price,
  location: item.location,
  min_stock_threshold: item.minStockThreshold
});

const buildNewSku = (name: string) =>
  `NEW-${name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 12)}`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const addConnectionErrorToast = (setState: (fn: (state: StoreState) => StoreState) => void) => {
  setState((state) => ({
    ...state,
    toasts: [...state.toasts, createToast("Database Connection Failed", "error")]
  }));
};

export const useStore = create<StoreState>((set, get) => ({
  inventory: [],
  cart: [],
  scannerResults: [],
  activity: [{ message: "Awaiting inventory sync.", timestamp: nowLabel() }],
  toasts: [],
  syncStatus: "idle",
  isLoading: true,
  connectionError: null,
  initializeStore: async () => {
    set({ isLoading: true, syncStatus: "syncing" });
    if (!hasSupabaseEnv) {
      addConnectionErrorToast(set);
      set({
        isLoading: false,
        syncStatus: "error",
        connectionError: "Missing Supabase environment variables."
      });
      return;
    }
    try {
      const { error: healthError } = await supabase
        .from("inventory")
        .select("sku")
        .limit(1);
      if (healthError) {
        addConnectionErrorToast(set);
        set({
          isLoading: false,
          syncStatus: "error",
          connectionError: healthError.message
        });
        return;
      }
      const { data, error } = await supabase
        .from("inventory")
        .select("sku,name,category,quantity,price,location,min_stock_threshold")
        .order("name");
      if (error) {
        addConnectionErrorToast(set);
        set({
          isLoading: false,
          syncStatus: "error",
          connectionError: error.message
        });
        return;
      }
      const inventory = (data ?? []).map((row) => mapRowToItem(row as InventoryRow));
      set({
        inventory,
        isLoading: false,
        syncStatus: "synced",
        connectionError: null,
        activity: [
          { message: "Inventory synced from Supabase.", timestamp: nowLabel() },
          ...get().activity
        ]
      });
    } catch (error) {
      addConnectionErrorToast(set);
      set({
        isLoading: false,
        syncStatus: "error",
        connectionError: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
  incrementStock: async (sku) => {
    const state = get();
    const previous = state.inventory;
    const inventory = state.inventory.map((item) =>
      item.sku === sku ? withValue({ ...item, quantity: item.quantity + 1 }) : item
    );
    const item = inventory.find((entry) => entry.sku === sku);
    set({
      inventory,
      activity: item
        ? [{ message: `Added 1 unit to ${item.name}.`, timestamp: nowLabel() }, ...state.activity]
        : state.activity,
      toasts: item
        ? [...state.toasts, createToast(`${item.name} inventory increased.`, "success")]
        : state.toasts,
      syncStatus: "syncing"
    });
    if (!item) {
      return;
    }
    try {
      await delay(300);
      const { error } = await supabase
        .from("inventory")
        .update({ quantity: item.quantity })
        .eq("sku", sku);
      if (error) {
        throw error;
      }
      set({ syncStatus: "synced" });
    } catch {
      set((current) => ({
        inventory: previous,
        syncStatus: "error",
        toasts: [...current.toasts, createToast("Failed to update inventory.", "error")]
      }));
    }
  },
  decrementStock: async (sku) => {
    const state = get();
    const previous = state.inventory;
    const inventory = state.inventory.map((item) =>
      item.sku === sku
        ? withValue({ ...item, quantity: Math.max(0, item.quantity - 1) })
        : item
    );
    const item = inventory.find((entry) => entry.sku === sku);
    set({
      inventory,
      activity: item
        ? [{ message: `Removed 1 unit from ${item.name}.`, timestamp: nowLabel() }, ...state.activity]
        : state.activity,
      toasts: item
        ? [...state.toasts, createToast(`${item.name} inventory decreased.`, "success")]
        : state.toasts,
      syncStatus: "syncing"
    });
    if (!item) {
      return;
    }
    try {
      await delay(300);
      const { error } = await supabase
        .from("inventory")
        .update({ quantity: item.quantity })
        .eq("sku", sku);
      if (error) {
        throw error;
      }
      set({ syncStatus: "synced" });
    } catch {
      set((current) => ({
        inventory: previous,
        syncStatus: "error",
        toasts: [...current.toasts, createToast("Failed to update inventory.", "error")]
      }));
    }
  },
  addToOrder: (sku) => {
    set((state) => {
      const item = state.inventory.find((entry) => entry.sku === sku);
      if (!item) {
        return state;
      }
      const existing = state.cart.find((entry) => entry.sku === sku);
      const nextQuantity = (existing?.quantity ?? 0) + 1;
      if (nextQuantity > item.quantity) {
        return state;
      }
      const cart = existing
        ? state.cart.map((entry) =>
            entry.sku === sku ? { ...entry, quantity: nextQuantity } : entry
          )
        : [...state.cart, { sku, name: item.name, quantity: 1 }];
      const toasts = [...state.toasts, createToast(`${item.name} added to order.`, "success")];
      return { ...state, cart, toasts };
    });
  },
  updateOrderQuantity: (sku, quantity) => {
    set((state) => {
      const item = state.inventory.find((entry) => entry.sku === sku);
      if (!item) {
        return state;
      }
      const nextQuantity = Math.max(1, Math.min(quantity, item.quantity));
      const cart = state.cart
        .map((entry) => (entry.sku === sku ? { ...entry, quantity: nextQuantity } : entry))
        .filter((entry) => entry.quantity > 0);
      return { ...state, cart };
    });
  },
  finalizeOrder: async () => {
    const state = get();
    if (state.cart.length === 0) {
      return;
    }
    const previous = state.inventory;
    const inventory = state.inventory.map((item) => {
      const cartItem = state.cart.find((entry) => entry.sku === item.sku);
      if (!cartItem) {
        return item;
      }
      return withValue({ ...item, quantity: Math.max(0, item.quantity - cartItem.quantity) });
    });
    set({
      inventory,
      cart: [],
      activity: [
        { message: `Order finalized with ${state.cart.length} item(s).`, timestamp: nowLabel() },
        ...state.activity
      ],
      toasts: [...state.toasts, createToast("Outgoing order finalized.", "success")],
      syncStatus: "syncing"
    });

    try {
      await delay(500);
      const updates = inventory.map((item) => ({ sku: item.sku, quantity: item.quantity }));
      const { error } = await supabase.from("inventory").upsert(updates, { onConflict: "sku" });
      if (error) {
        throw error;
      }
      set({ syncStatus: "synced" });
    } catch {
      set((current) => ({
        inventory: previous,
        syncStatus: "error",
        toasts: [...current.toasts, createToast("Failed to finalize order.", "error")]
      }));
    }
  },
  setScannerResults: (results) => set({ scannerResults: results }),
  applyScannerUpdates: async () => {
    const state = get();
    if (state.scannerResults.length === 0) {
      return;
    }
    const previous = state.inventory;
    const updates: InventoryItem[] = [];
    const inventory = state.inventory.map((item) => {
      const result = state.scannerResults.find((entry) => entry.name === item.name);
      if (!result) {
        return item;
      }
      const updated = withValue({ ...item, quantity: item.quantity + result.quantity });
      updates.push(updated);
      return updated;
    });

    const newItems = state.scannerResults
      .filter((result) => !state.inventory.find((item) => item.name === result.name))
      .map((result) =>
        withValue({
          sku: buildNewSku(result.name),
          name: result.name,
          category: "Uncategorized",
          quantity: result.quantity,
          price: 0,
          value: 0,
          location: "Receiving",
          minStockThreshold: 5
        })
      );

    const mergedInventory = [...inventory, ...newItems];

    set({
      inventory: mergedInventory,
      scannerResults: [],
      activity: [
        { message: "Scanner updates applied to inventory.", timestamp: nowLabel() },
        ...state.activity
      ],
      toasts: [...state.toasts, createToast("Scanner updates applied.", "success")],
      syncStatus: "syncing"
    });

    try {
      await delay(500);
      const rows = [...updates, ...newItems].map((item) => mapItemToRow(item));
      const { error } = await supabase.from("inventory").upsert(rows, { onConflict: "sku" });
      if (error) {
        throw error;
      }
      set({ syncStatus: "synced" });
    } catch {
      set((current) => ({
        inventory: previous,
        syncStatus: "error",
        toasts: [...current.toasts, createToast("Failed to apply scanner updates.", "error")]
      }));
    }
  },
  addToast: (message, variant) =>
    set((state) => ({ ...state, toasts: [...state.toasts, createToast(message, variant)] })),
  removeToast: (id) =>
    set((state) => ({ ...state, toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
