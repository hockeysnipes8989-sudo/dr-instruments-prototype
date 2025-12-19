import { useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { CartItem, InventoryItem } from "../types";

type OrdersPanelProps = {
  items: InventoryItem[];
  cart: CartItem[];
  onAddToCart: (sku: string) => void;
  onUpdateQuantity: (sku: string, quantity: number) => void;
  onSubmitOrder: () => void;
};

const OrdersPanel = ({ items, cart, onAddToCart, onUpdateQuantity, onSubmitOrder }: OrdersPanelProps) => {
  const [selectedSku, setSelectedSku] = useState(items[0]?.sku ?? "");

  const cartTotalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleAdd = () => {
    if (selectedSku) {
      onAddToCart(selectedSku);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Outgoing Orders</h2>
          <p className="text-sm text-slate-500">Deduct items from inventory</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ShoppingCart className="h-4 w-4 text-rose-600" />
          {cartTotalItems} items
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={selectedSku}
              onChange={(event) => setSelectedSku(event.target.value)}
            >
              {items.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.name} ({item.quantity} available)
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Add to cart
            </button>
          </div>
          <div className="space-y-3">
            {cart.length === 0 && (
              <p className="text-sm text-slate-400">No items added yet.</p>
            )}
            {cart.map((item) => (
              <div
                key={item.sku}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Qty</label>
                  <input
                    type="number"
                    min={1}
                    className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-sm"
                    value={item.quantity}
                    onChange={(event) => onUpdateQuantity(item.sku, Number(event.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Order Summary</p>
          <p className="mt-2 text-xs text-slate-500">
            Review the outgoing order before deduction.
          </p>
          <button
            type="button"
            onClick={onSubmitOrder}
            className="mt-6 w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            disabled={cart.length === 0}
          >
            Deduct Inventory
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrdersPanel;
