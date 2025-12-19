import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { hasSupabaseEnv } from "./lib/supabase";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {hasSupabaseEnv ? (
      <App />
    ) : (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm backdrop-blur-md">
          <h1 className="text-lg font-semibold text-brand-primary">Missing Supabase Config</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file, then
            restart the dev server.
          </p>
        </div>
      </div>
    )}
  </React.StrictMode>
);
