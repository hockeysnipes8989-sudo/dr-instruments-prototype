import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Session } from "@supabase/supabase-js";
import Sidebar, { TabKey } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import InventoryTable from "./components/InventoryTable";
import InvoiceScanner from "./components/InvoiceScanner";
import OrdersPanel from "./components/OrdersPanel";
import ToastStack from "./components/ToastStack";
import Auth from "./components/Auth";
import { useStore } from "./store/useStore";
import { supabase } from "./lib/supabase";

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

type ReportTab = "full" | "low";

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [showReport, setShowReport] = useState(false);
  const [reportTab, setReportTab] = useState<ReportTab>("full");
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const inventory = useStore((state) => state.inventory);
  const activity = useStore((state) => state.activity);
  const syncStatus = useStore((state) => state.syncStatus);
  const isLoading = useStore((state) => state.isLoading);
  const initializeStore = useStore((state) => state.initializeStore);
  const resetStore = useStore((state) => state.resetStore);

  const header = tabTitles[activeTab];
  const totalValue = useMemo(
    () => inventory.reduce((sum, item) => sum + item.value, 0),
    [inventory]
  );
  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.quantity <= item.minStockThreshold),
    [inventory]
  );

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsAuthLoading(false);
    };
    void loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_OUT") {
        resetStore();
        setSession(null);
        return;
      }
      setSession(newSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [resetStore]);

  useEffect(() => {
    if (session) {
      void initializeStore();
    }
  }, [initializeStore, session]);

  const fullReportRef = useRef<HTMLDivElement | null>(null);
  const lowReportRef = useRef<HTMLDivElement | null>(null);

  const handlePrintFull = useReactToPrint({
    content: () => fullReportRef.current,
    documentTitle: "dr-instruments-inventory-report"
  });

  const handlePrintLow = useReactToPrint({
    content: () => lowReportRef.current,
    documentTitle: "dr-instruments-low-stock-report"
  });

  const syncIcon = () => {
    if (syncStatus === "syncing") {
      return <Cloud className="h-4 w-4 animate-pulse text-brand-primary" />;
    }
    if (syncStatus === "error") {
      return <CloudOff className="h-4 w-4 text-rose-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="rounded-3xl border border-white/40 bg-white/80 px-8 py-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
            Authenticating with Laboratory Database...
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 md:flex-row">
      <Sidebar
        activeTab={activeTab}
        onSelect={setActiveTab}
        userEmail={session?.user.email ?? ""}
        onSignOut={() => void supabase.auth.signOut()}
      />
      <main className="flex-1 space-y-8 px-6 pb-24 pt-8 md:px-8 md:pb-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{header.subtitle}</p>
            <h2 className="text-2xl font-semibold text-brand-primary">{header.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
              {syncIcon()}
              {syncStatus === "syncing" ? "Saving..." : syncStatus === "error" ? "Offline" : "Synced"}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowReport(true);
                setReportTab("full");
              }}
              className="rounded-xl bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95"
            >
              Create Report
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
              Authenticating with Laboratory Database...
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <Dashboard items={inventory} activity={activity} />
            )}
            {activeTab === "inventory" && <InventoryTable />}
            {activeTab === "scanner" && <InvoiceScanner />}
            {activeTab === "orders" && <OrdersPanel />}
          </>
        )}
      </main>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
          <div className="w-full max-w-4xl rounded-2xl border border-white/40 bg-white/90 p-6 shadow-xl backdrop-blur-md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-brand-primary">
                  Inventory Report Preview
                </h3>
                <p className="text-sm text-slate-500">
                  Review the report before printing or downloading.
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

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setReportTab("full")}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition active:scale-95 ${
                  reportTab === "full"
                    ? "bg-brand-primary text-white"
                    : "border border-slate-200 text-slate-500"
                }`}
              >
                Full Inventory
              </button>
              <button
                type="button"
                onClick={() => setReportTab("low")}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition active:scale-95 ${
                  reportTab === "low"
                    ? "bg-brand-primary text-white"
                    : "border border-slate-200 text-slate-500"
                }`}
              >
                Low Stock Report
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] overflow-auto rounded-2xl border border-slate-200 bg-white/80 p-6">
              {reportTab === "full" ? (
                <div ref={fullReportRef} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-brand-primary">
                      Full Inventory Report
                    </h4>
                    <p className="text-xs text-slate-500">Generated {new Date().toLocaleString()}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                      <p className="text-xs text-slate-400">Total Inventory Value</p>
                      <p className="mt-2 text-2xl font-semibold text-brand-primary">
                        {totalValue.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD"
                        })}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                      <p className="text-xs text-slate-400">Low Stock Items</p>
                      <p className="mt-2 text-2xl font-semibold text-brand-primary">
                        {lowStockItems.length}
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-3 py-2">SKU</th>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2">Location</th>
                          <th className="px-3 py-2 text-right">Quantity</th>
                          <th className="px-3 py-2 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item) => (
                          <tr key={item.sku} className="border-b border-slate-100">
                            <td className="px-3 py-2 text-slate-500">{item.sku}</td>
                            <td className="px-3 py-2 text-slate-700">{item.name}</td>
                            <td className="px-3 py-2 text-slate-500">{item.location}</td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700">
                              {item.value.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD"
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div ref={lowReportRef} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-brand-primary">
                      Low Stock Report
                    </h4>
                    <p className="text-xs text-slate-500">Generated {new Date().toLocaleString()}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2">SKU</th>
                          <th className="px-3 py-2 text-right">Current Stock</th>
                          <th className="px-3 py-2">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                              All items are above minimum thresholds.
                            </td>
                          </tr>
                        )}
                        {lowStockItems.map((item) => (
                          <tr key={item.sku} className="border-b border-slate-100">
                            <td className="px-3 py-2 text-slate-700">{item.name}</td>
                            <td className="px-3 py-2 text-slate-500">{item.sku}</td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-slate-500">{item.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => handlePrintFull()}
                className="rounded-xl border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-blue-50 active:scale-95"
              >
                Download Full Report
              </button>
              <button
                type="button"
                onClick={() => handlePrintLow()}
                className="rounded-xl bg-brand-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
              >
                Low Stock Report
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
