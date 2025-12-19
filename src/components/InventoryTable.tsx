import { useMemo, useState } from "react";
import { Download, Minus, Plus } from "lucide-react";
import { useStore } from "../useStore";

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const InventoryTable = () => {
  const items = useStore((state) => state.inventory);
  const incrementStock = useStore((state) => state.incrementStock);
  const decrementStock = useStore((state) => state.decrementStock);
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      [item.sku, item.name, item.category].some((field) =>
        field.toLowerCase().includes(normalized)
      )
    );
  }, [items, query]);

  const handleExport = () => {
    const header = ["SKU", "Name", "Category", "Quantity", "Price", "Value"];
    const rows = filteredItems.map((item) => [
      item.sku,
      item.name,
      item.category,
      item.quantity,
      item.price,
      item.value
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory-export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">Inventory</h2>
          <p className="text-sm text-slate-500">
            Searchable list of available lab equipment
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:border-blue-900 focus:outline-none"
            placeholder="Search inventory"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">Quantity</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.sku} className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium text-slate-700">{item.sku}</td>
                <td className="px-3 py-3 text-slate-600">{item.name}</td>
                <td className="px-3 py-3 text-slate-500">{item.category}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => decrementStock(item.sku)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-blue-900 hover:text-blue-900"
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[32px] text-right text-slate-700">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementStock(item.sku)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-blue-900 hover:text-blue-900"
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3 text-right text-slate-600">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-slate-700">
                  {formatCurrency(item.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No items match your search.
          </p>
        )}
      </div>
    </section>
  );
};

export default InventoryTable;
