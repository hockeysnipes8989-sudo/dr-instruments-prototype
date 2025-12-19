import { LayoutDashboard, ScanLine, ShoppingCart, Boxes } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Inventory", icon: Boxes },
  { label: "Invoice Scanner", icon: ScanLine },
  { label: "Outgoing Orders", icon: ShoppingCart }
];

const Sidebar = () => {
  return (
    <aside className="flex h-full w-64 flex-col gap-6 border-r border-slate-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Dr Instruments
        </p>
        <h1 className="text-2xl font-semibold text-slate-800">Mock Mode</h1>
      </div>
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
          >
            <item.icon className="h-4 w-4 text-rose-600" />
            {item.label}
          </div>
        ))}
      </nav>
      <div className="mt-auto rounded-xl bg-rose-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-rose-700">Mock Environment</p>
        <p className="mt-2">
          All data shown here is simulated for demonstration and training.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
