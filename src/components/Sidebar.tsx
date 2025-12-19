import { LayoutDashboard, ScanLine, ShoppingCart, Boxes } from "lucide-react";

export type TabKey = "dashboard" | "inventory" | "scanner" | "orders";

type SidebarProps = {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
};

const navItems: { label: string; icon: typeof LayoutDashboard; key: TabKey }[] = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "Inventory", icon: Boxes, key: "inventory" },
  { label: "Invoice Scanner", icon: ScanLine, key: "scanner" },
  { label: "Outgoing Orders", icon: ShoppingCart, key: "orders" }
];

const Sidebar = ({ activeTab, onSelect }: SidebarProps) => {
  return (
    <>
      <aside className="hidden h-full w-64 flex-col gap-6 border-r border-slate-200 bg-white p-6 md:flex">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Dr Instruments
          </p>
          <h1 className="text-2xl font-semibold text-brand-primary">Operations Console</h1>
        </div>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                type="button"
                key={item.label}
                onClick={() => onSelect(item.key)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition active:scale-95 ${
                  isActive
                    ? "border-brand-primary bg-blue-50 text-brand-primary"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-brand-primary"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 ${isActive ? "text-brand-primary" : "text-slate-500"}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl bg-blue-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-brand-primary">Mock Environment</p>
          <p className="mt-2">
            All data shown here is simulated for demonstration and training.
          </p>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition active:scale-95 ${
                  isActive ? "text-brand-primary" : "text-slate-500"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-brand-primary" : "text-slate-400"}`} />
                {item.label.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
