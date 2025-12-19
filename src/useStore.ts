import { create } from "zustand";
import { mockInventory } from "./mockData";
import { CartItem, InventoryItem, ScannedItem } from "./types";
import { supabase } from "./supabaseClient";

type ActivityEntry = {
  message: string;
  timestamp: string;
};

type Toast = {
  id: string;
  message: string;
};

type SyncStatus = "idle" | "syncing" | "synced" | "error";

type StoreState = {
  inventory: InventoryItem[];
  cart: CartItem[];
  scannerResults: ScannedItem[];
  activity: ActivityEntry[];
  toasts: Toast[];
  syncStatus: SyncStatus;
  incrementStock: (sku: string) => Promise<void>;
  decrementStock: (sku: string) => Promise<void>;
  addToOrder: (sku: string) => void;
  updateOrderQuantity: (sku: string, quantity: number) => void;
  finalizeOrder: () => Promise<void>;
  setScannerResults: (results: ScannedItem[]) => void;
  applyScannerUpdates: () => Promise<void>;
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
  initializeInventory: () => Promise<void>;
};

const nowLabel = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const createToast = (message: string): Toast => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  message
});

const withValue = (item: InventoryItem): InventoryItem => ({
  ...item,
  value: Number((item.quantity * item.price).toFixed(2))
});

const syncInventoryItems = async (items: InventoryItem[]) => {
  if (!items.length) {
    return;
  }
  await supabase.from("inventory").upsert(items, { onConflict: "sku" });
};

export const useStore = create<StoreState>((set, get) => ({
  inventory: [],
  cart: [],
  scannerResults: [],
  activity: [
    { message: "Mock inventory initialized.", timestamp: nowLabel() },
    { message: "Last sync completed.", timestamp: nowLabel() }
  ],
  toasts: [],
  syncStatus: "idle",
  initializeInventory: async () => {
    set({ syncStatus: "syncing" });
    const { data, error } = await supabase.from("inventory").select("*").order("name");
    if (error) {
      set({ inventory: mockInventory, syncStatus: "error" });
      return;
    }
    if (!data || data.length === 0) {
      await supabase.from("inventory").insert(mockInventory);
      set({ inventory: mockInventory, syncStatus: "synced" });
      return;
    }
    const inventory = data.map((item) => withValue(item as InventoryItem));
    set({ inventory, syncStatus: "synced" });
  },
  incrementStock: async (sku) => {
    const state = get();
    const inventory = state.inventory.map((item) => {
      if (item.sku !== sku) {
        return item;
      }
      return withValue({ ...item, quantity: item.quantity + 1 });
    });
    const item = inventory.find((entry) => entry.sku === sku);
    set({
      inventory,
      activity: item
        ? [{ message: `Added 1 unit to ${item.name}.`, timestamp: nowLabel() }, ...state.activity]
        : state.activity,
      toasts: item ? [...state.toasts, createToast(`${item.name} inventory increased.`)] : state.toasts,
      syncStatus: "syncing"
    });
    try {
      if (item) {
        await syncInventoryItems([item]);
      }
      set({ syncStatus: "synced" });
    } catch {
      set({ syncStatus: "error" });
    }
  },
  decrementStock: async (sku) => {
    const state = get();
    const inventory = state.inventory.map((item) => {
      if (item.sku !== sku) {
        return item;
      }
      return withValue({ ...item, quantity: Math.max(0, item.quantity - 1) });
    });
    const item = inventory.find((entry) => entry.sku === sku);
    set({
      inventory,
      activity: item
        ? [{ message: `Removed 1 unit from ${item.name}.`, timestamp: nowLabel() }, ...state.activity]
        : state.activity,
      toasts: item ? [...state.toasts, createToast(`${item.name} inventory decreased.`)] : state.toasts,
      syncStatus: "syncing"
    });
    try {
      if (item) {
        await syncInventoryItems([item]);
      }
      set({ syncStatus: "synced" });
    } catch {
      set({ syncStatus: "error" });
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
      const toasts = [...state.toasts, createToast(`${item.name} added to order.`)];
      return { cart, toasts };
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
      return { cart };
    });
  },
  finalizeOrder: async () => {
    const state = get();
    if (state.cart.length === 0) {
      return;
    }
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
      toasts: [...state.toasts, createToast("Outgoing order finalized.")],
      syncStatus: "syncing"
    });
    try {
      await syncInventoryItems(inventory);
      set({ syncStatus: "synced" });
    } catch {
      set({ syncStatus: "error" });
    }
  },
  setScannerResults: (results) => set({ scannerResults: results }),
  applyScannerUpdates: async () => {
    const state = get();
    if (state.scannerResults.length === 0) {
      return;
    }
    const inventory = state.inventory.map((item) => {
      const result = state.scannerResults.find((entry) => entry.name === item.name);
      if (!result) {
        return item;
      }
      return withValue({ ...item, quantity: item.quantity + result.quantity });
    });
    set({
      inventory,
      scannerResults: [],
      activity: [
        { message: "Scanner updates applied to inventory.", timestamp: nowLabel() },
        ...state.activity
      ],
      toasts: [...state.toasts, createToast("Scanner updates applied.")],
      syncStatus: "syncing"
    });
    try {
      await syncInventoryItems(inventory);
      set({ syncStatus: "synced" });
    } catch {
      set({ syncStatus: "error" });
    }
  },
  addToast: (message) => set((state) => ({ toasts: [...state.toasts, createToast(message)] })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
