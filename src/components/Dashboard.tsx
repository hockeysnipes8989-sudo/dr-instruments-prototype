import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { InventoryItem } from "../types";

type DashboardProps = {
  items: InventoryItem[];
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const Dashboard = ({ items }: DashboardProps) => {
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const valueByCategory = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.value;
    return acc;
  }, {});

  const chartData = Object.entries(valueByCategory).map(([category, value]) => ({
    category,
    value
  }));

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Stock</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">{totalStock}</p>
          <p className="mt-1 text-xs text-slate-400">Units across all categories</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Inventory Value</p>
          <p className="mt-2 text-3xl font-semibold text-slate-800">
            {formatCurrency(totalValue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Based on mock pricing</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Value by Category</h2>
            <p className="text-sm text-slate-500">Aggregated inventory value</p>
          </div>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">
            Mock Data
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" fill="#E11D48" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
