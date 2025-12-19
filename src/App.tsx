import { useState } from "react";
import Sidebar, { TabKey } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import InventoryTable from "./components/InventoryTable";
import InvoiceScanner from "./components/InvoiceScanner";
import OrdersPanel from "./components/OrdersPanel";
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
  const inventory = useStore((state) => state.inventory);
  const activity = useStore((state) => state.activity);

  const header = tabTitles[activeTab];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />
      <main className="flex-1 space-y-8 p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{header.subtitle}</p>
            <h2 className="text-2xl font-semibold text-blue-900">{header.title}</h2>
          </div>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600">
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
    </div>
  );
};

export default App;
