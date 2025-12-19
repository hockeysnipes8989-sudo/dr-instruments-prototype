import { useMemo, useState } from "react";
import Sidebar, { TabKey } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import InventoryTable from "./components/InventoryTable";
import InvoiceScanner from "./components/InvoiceScanner";
import OrdersPanel from "./components/OrdersPanel";
import ToastStack from "./components/ToastStack";
import { useStore } from "./useStore";

const tabTitles: Record<TabKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dr Instruments Control Center",
    subtitle: "Inventory KPIs"
  },
  inventory: {
    title: "Inventory Overview",
    subtitle: "Full inventory table"
  },
  scanner: {
    title: "Invoice Scanner",
    subtitle: "AI-assisted intake workflow"
  },
  orders: {
    title: "Outgoing Orders",
    subtitle: "Order builder and deduction"
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [showReport, setShowReport] = useState(false);
  const inventory = useStore((state) => state.inventory);
  const activity = useStore((state) => state.activity);

  const header = tabTitles[activeTab];
  const totalValue = useMemo(
    () => inventory.reduce((sum, item) => sum + item.value, 0),
    [inventory]
  );
  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.quantity <= 5),
    [inventory]
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 md:flex-row">
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />
      <main className="flex-1 space-y-8 px-6 pb-24 pt-8 md:px-8 md:pb-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{header.subtitle}</p>
            <h2 className="text-2xl font-semibold text-brand-primary">{header.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="rounded-xl bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95"
          >
            Create Report
          </button>
        </header>

        {activeTab === "dashboard" && (
          <Dashboard items={inventory} activity={activity} />
        )}
        {activeTab === "inventory" && <InventoryTable />}
        {activeTab === "scanner" && <InvoiceScanner />}
        {activeTab === "orders" && <OrdersPanel />}
      </main>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
          <div className="w-full max-w-2xl rounded-2xl border border-white/40 bg-white/90 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-primary">
                  Inventory Summary Report
                </h3>
                <p className="text-sm text-slate-500">
                  Snapshot of current inventory health.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReport(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-brand-primary hover:text-brand-primary active:scale-95"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-xs text-slate-400">Total Inventory Value</p>
                <p className="mt-2 text-2xl font-semibold text-brand-primary">
                  {totalValue.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-xs text-slate-400">Low Stock Items</p>
                <p className="mt-2 text-2xl font-semibold text-brand-primary">
                  {lowStockItems.length}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700">Low Stock List</h4>
              <div className="mt-2 space-y-2 text-sm text-slate-500">
                {lowStockItems.length === 0 && <p>All items are stocked.</p>}
                {lowStockItems.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/80 px-3 py-2"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-slate-400">{item.quantity} left</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700">Recent Activity</h4>
              <div className="mt-2 space-y-2 text-sm text-slate-500">
                {activity.slice(0, 4).map((entry, index) => (
                  <div key={`${entry.message}-${index}`}>
                    <p className="font-semibold text-slate-700">{entry.message}</p>
                    <p className="text-xs text-slate-400">{entry.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-brand-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastStack />
    </div>
  );
};

export default App;
