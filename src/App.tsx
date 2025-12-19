import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import InventoryTable from "./components/InventoryTable";
import InvoiceScanner from "./components/InvoiceScanner";
import OrdersPanel from "./components/OrdersPanel";
import { mockInventory } from "./mockData";
import { CartItem, InventoryItem } from "./types";

const App = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [cart, setCart] = useState<CartItem[]>([]);

  const inventoryLookup = useMemo(() => {
    return inventory.reduce<Record<string, InventoryItem>>((acc, item) => {
      acc[item.sku] = item;
      return acc;
    }, {});
  }, [inventory]);

  const handleAddToCart = (sku: string) => {
    const item = inventoryLookup[sku];
    if (!item) {
      return;
    }
    setCart((prev) => {
      const existing = prev.find((entry) => entry.sku === sku);
      if (existing) {
        return prev.map((entry) =>
          entry.sku === sku ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...prev, { sku, name: item.name, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (sku: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((entry) =>
          entry.sku === sku ? { ...entry, quantity: Math.max(1, quantity) } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      return;
    }

    setInventory((prev) =>
      prev.map((item) => {
        const cartItem = cart.find((entry) => entry.sku === item.sku);
        if (!cartItem) {
          return item;
        }
        const newQuantity = Math.max(0, item.quantity - cartItem.quantity);
        return {
          ...item,
          quantity: newQuantity,
          value: Number((newQuantity * item.price).toFixed(2))
        };
      })
    );
    setCart([]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="flex-1 space-y-8 p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Inventory Dashboard</p>
            <h2 className="text-2xl font-semibold text-slate-800">
              Dr Instruments Control Center
            </h2>
          </div>
          <button className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700">
            Create Report
          </button>
        </header>

        <Dashboard items={inventory} />

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <InventoryTable items={inventory} />
          <div className="space-y-8">
            <InvoiceScanner />
            <OrdersPanel
              items={inventory}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onSubmitOrder={handleSubmitOrder}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
