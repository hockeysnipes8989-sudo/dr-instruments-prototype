import { InventoryItem } from "../types";

type ActivityEntry = {
  message: string;
  timestamp: string;
};

type DashboardProps = {
  items: InventoryItem[];
  activity: ActivityEntry[];
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const Dashboard = ({ items, activity }: DashboardProps) => {
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const lowStockCount = items.filter((item) => item.quantity <= 5).length;
  const recentActivity = activity.slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
          <p className="text-sm text-slate-500">Total Stock</p>
          <p className="mt-2 text-3xl font-semibold text-brand-primary">{totalStock}</p>
          <p className="mt-1 text-xs text-slate-400">Units across all categories</p>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
          <p className="text-sm text-slate-500">Total Inventory Value</p>
          <p className="mt-2 text-3xl font-semibold text-brand-primary">
            {formatCurrency(totalValue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Mock pricing in USD</p>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
          <p className="text-sm text-slate-500">Low Stock Alerts</p>
          <p className="mt-2 text-3xl font-semibold text-brand-primary">{lowStockCount}</p>
          <p className="mt-1 text-xs text-slate-400">Items at or below 5 units</p>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
          <p className="text-sm text-slate-500">Recent Activity</p>
          <div className="mt-3 space-y-2 text-xs text-slate-500">
            {recentActivity.map((entry, index) => (
              <div key={`${entry.message}-${index}`}>
                <p className="font-semibold text-slate-700">{entry.message}</p>
                <p className="text-slate-400">{entry.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
