import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { useStore } from "../store/useStore";

const OrdersPanel = () => {
  const items = useStore((state) => state.inventory);
  const cart = useStore((state) => state.cart);
  const addToOrder = useStore((state) => state.addToOrder);
  const updateOrderQuantity = useStore((state) => state.updateOrderQuantity);
  const finalizeOrder = useStore((state) => state.finalizeOrder);
  const [selectedSku, setSelectedSku] = useState(items[0]?.sku ?? "");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const cartTotalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const selectedItem = items.find((item) => item.sku === selectedSku);
  const selectedCart = cart.find((item) => item.sku === selectedSku);
  const availableQuantity = selectedItem ? selectedItem.quantity - (selectedCart?.quantity ?? 0) : 0;

  const handleAdd = () => {
    if (!selectedSku || !selectedItem) {
      return;
    }
    if (availableQuantity <= 0) {
      setError("Cannot add more than the available stock.");
      return;
    }
    setError("");
    addToOrder(selectedSku);
  };

  const handleFinalize = () => {
    if (cart.length === 0) {
      return;
    }
    setError("");
    void finalizeOrder();
    setShowSuccess(true);
  };

  useEffect(() => {
    if (!showSuccess) {
      return;
    }
    const timeout = window.setTimeout(() => setShowSuccess(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [showSuccess]);

  return (
    <section className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-primary">Outgoing Orders</h2>
          <p className="text-sm text-slate-500">Build and finalize outgoing orders</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ShoppingCart className="h-4 w-4 text-brand-secondary" />
          {cartTotalItems} items
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm"
              value={selectedSku}
              onChange={(event) => {
                setSelectedSku(event.target.value);
                setError("");
              }}
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
              disabled={availableQuantity <= 0}
              className="h-10 rounded-xl bg-brand-secondary px-4 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-200"
            >
              Add to order
            </button>
          </div>
          {error && <p className="text-xs font-medium text-emerald-600">{error}</p>}
          <div className="space-y-3">
            {cart.length === 0 && (
              <p className="text-sm text-slate-400">No items added yet.</p>
            )}
            {cart.map((item) => {
              const maxQuantity = items.find((entry) => entry.sku === item.sku)?.quantity ?? 0;
              return (
                <div
                  key={item.sku}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm"
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
                      max={maxQuantity}
                      className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-sm"
                      value={item.quantity}
                      onChange={(event) =>
                        updateOrderQuantity(item.sku, Number(event.target.value))
                      }
                    />
                    <span className="text-xs text-slate-400">/ {maxQuantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 backdrop-blur-md">
          <p className="text-sm font-semibold text-slate-700">Order Summary</p>
          <p className="mt-2 text-xs text-slate-500">
            Confirm the outgoing order before deduction.
          </p>
          <button
            type="button"
            onClick={handleFinalize}
            className="mt-6 w-full rounded-xl bg-brand-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
            disabled={cart.length === 0}
          >
            Finalize Order
          </button>
          {showSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 animate-pulse">
              <CheckCircle2 className="h-4 w-4" />
              Order finalized successfully.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrdersPanel;
