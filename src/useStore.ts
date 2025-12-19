import { create } from "zustand";
import { mockInventory } from "./mockData";
import { CartItem, InventoryItem, ScannedItem } from "./types";

type ActivityEntry = {
  message: string;
  timestamp: string;
};

type Toast = {
  id: string;
  message: string;
};

type StoreState = {
  inventory: InventoryItem[];
  cart: CartItem[];
  scannerResults: ScannedItem[];
  activity: ActivityEntry[];
  toasts: Toast[];
  incrementStock: (sku: string) => void;
  decrementStock: (sku: string) => void;
  addToOrder: (sku: string) => void;
  updateOrderQuantity: (sku: string, quantity: number) => void;
  finalizeOrder: () => void;
  setScannerResults: (results: ScannedItem[]) => void;
  applyScannerUpdates: () => void;
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
};

const nowLabel = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const createToast = (message: string): Toast => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  message
});

export const useStore = create<StoreState>((set, get) => ({
  inventory: mockInventory,
  cart: [],
  scannerResults: [],
  activity: [
    { message: "Mock inventory initialized.", timestamp: nowLabel() },
    { message: "Last sync completed.", timestamp: nowLabel() }
  ],
  toasts: [],
  incrementStock: (sku) => {
    set((state) => {
      const inventory = state.inventory.map((item) => {
        if (item.sku !== sku) {
          return item;
        }
        const quantity = item.quantity + 1;
        return { ...item, quantity, value: Number((quantity * item.price).toFixed(2)) };
      });
      const item = inventory.find((entry) => entry.sku === sku);
      const activity = item
        ? [{ message: `Added 1 unit to ${item.name}.`, timestamp: nowLabel() }, ...state.activity]
        : state.activity;
      const toasts = item
        ? [...state.toasts, createToast(`${item.name} inventory increased.`)]
        : state.toasts;
      return { inventory, activity, toasts };
    });
  },
  decrementStock: (sku) => {
    set((state) => {
      const inventory = state.inventory.map((item) => {
        if (item.sku !== sku) {
          return item;
        }
        const quantity = Math.max(0, item.quantity - 1);
        return { ...item, quantity, value: Number((quantity * item.price).toFixed(2)) };
      });
      const item = inventory.find((entry) => entry.sku === sku);
      const activity = item
        ? [{ message: `Removed 1 unit from ${item.name}.`, timestamp: nowLabel() }, ...state.activity]
        : state.activity;
      const toasts = item
        ? [...state.toasts, createToast(`${item.name} inventory decreased.`)]
        : state.toasts;
      return { inventory, activity, toasts };
    });
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
  finalizeOrder: () => {
    set((state) => {
      if (state.cart.length === 0) {
        return state;
      }
      const inventory = state.inventory.map((item) => {
        const cartItem = state.cart.find((entry) => entry.sku === item.sku);
        if (!cartItem) {
          return item;
        }
        const quantity = Math.max(0, item.quantity - cartItem.quantity);
        return { ...item, quantity, value: Number((quantity * item.price).toFixed(2)) };
      });
      const activity = [
        { message: `Order finalized with ${state.cart.length} item(s).`, timestamp: nowLabel() },
        ...state.activity
      ];
      const toasts = [...state.toasts, createToast("Outgoing order finalized.")];
      return { inventory, cart: [], activity, toasts };
    });
  },
  setScannerResults: (results) => set({ scannerResults: results }),
  applyScannerUpdates: () => {
    set((state) => {
      if (state.scannerResults.length === 0) {
        return state;
      }
      const inventory = state.inventory.map((item) => {
        const result = state.scannerResults.find((entry) => entry.name === item.name);
        if (!result) {
          return item;
        }
        const quantity = item.quantity + result.quantity;
        return { ...item, quantity, value: Number((quantity * item.price).toFixed(2)) };
      });
      const activity = [
        { message: "Scanner updates applied to inventory.", timestamp: nowLabel() },
        ...state.activity
      ];
      const toasts = [...state.toasts, createToast("Scanner updates applied.")];
      return { inventory, scannerResults: [], activity, toasts };
    });
  },
  addToast: (message) => set((state) => ({ toasts: [...state.toasts, createToast(message)] })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
