import { LayoutDashboard, ScanLine, ShoppingCart, Boxes, LogOut, Mail } from "lucide-react";

export type TabKey = "dashboard" | "inventory" | "scanner" | "orders";

type SidebarProps = {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
  userEmail: string;
  onSignOut: () => void;
};

const navItems: { label: string; icon: typeof LayoutDashboard; key: TabKey }[] = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "Inventory", icon: Boxes, key: "inventory" },
  { label: "Invoice Scanner", icon: ScanLine, key: "scanner" },
  { label: "Outgoing Orders", icon: ShoppingCart, key: "orders" }
];

const Sidebar = ({ activeTab, onSelect, userEmail, onSignOut }: SidebarProps) => {
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

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Account
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Mail className="h-4 w-4 text-brand-primary" />
              {userEmail || "Authenticated User"}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Database: Online
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-primary hover:text-brand-primary active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
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
