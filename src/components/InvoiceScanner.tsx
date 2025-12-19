import { useCallback, useEffect, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { ScannedItem } from "../types";
import { useStore } from "../useStore";

const mockScanResults: ScannedItem[] = [
  { name: "Borosilicate Beaker Set (500ml)", quantity: 12, confidence: 0.92 },
  { name: "Sterile Lab Coats - Medium", quantity: 20, confidence: 0.88 },
  { name: "Nitrile Gloves (Box of 100)", quantity: 40, confidence: 0.9 }
];

type Step = "upload" | "analysis" | "review";

const InvoiceScanner = () => {
  const [step, setStep] = useState<Step>("upload");
  const [progress, setProgress] = useState(0);
  const results = useStore((state) => state.scannerResults);
  const setScannerResults = useStore((state) => state.setScannerResults);
  const applyScannerUpdates = useStore((state) => state.applyScannerUpdates);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (step !== "analysis") {
      return;
    }

    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((prev) => Math.min(100, prev + 8));
    }, 200);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setScannerResults(mockScanResults);
      setStep("review");
      setProgress(100);
    }, 2500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [setScannerResults, step]);

  const startAnalysis = () => {
    setScannerResults([]);
    setStep("analysis");
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (step === "analysis") {
        return;
      }
      startAnalysis();
    },
    [step]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      startAnalysis();
    }
  };

  const handleApplyUpdates = () => {
    void applyScannerUpdates();
    setStep("upload");
  };

  return (
    <section className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-primary">Mock Invoice Scanner</h2>
          <p className="text-sm text-slate-500">
            Simulate AI extraction with a three-step review flow.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-brand-primary">
          AI Simulated
        </span>
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate-400">
        <span className={step === "upload" ? "text-brand-primary" : ""}>Upload</span>
        <span className="h-px w-6 bg-slate-200" />
        <span className={step === "analysis" ? "text-brand-primary" : ""}>Analysis</span>
        <span className="h-px w-6 bg-slate-200" />
        <span className={step === "review" ? "text-brand-primary" : ""}>Review</span>
      </div>

      {step === "upload" && (
        <div
          className="mt-6 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FileUp className="h-8 w-8 text-brand-primary" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            Drag & drop invoice images here
          </p>
          <p className="text-xs text-slate-400">
            JPG or PNG. No data is uploaded in mock mode.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 rounded-xl bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95"
          >
            Select File
          </button>
        </div>
      )}

      {step === "analysis" && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full border-4 border-brand-primary/20" />
              <div className="absolute h-20 w-20 rounded-full border-4 border-transparent border-t-brand-primary animate-spin" />
              <div className="absolute h-16 w-16 rounded-full bg-white/80 shadow-sm backdrop-blur-md animate-pulse" />
              <span className="relative text-sm font-semibold text-brand-primary">
                {progress}%
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-primary">Analyzing invoice...</p>
              <p className="mt-1 text-xs text-slate-500">
                Multimodal extraction in progress (simulated 2.5s).
              </p>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-brand-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700">Review Detected Items</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.name} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{item.name}</td>
                    <td className="px-4 py-3 text-right text-slate-600">+{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {Math.round(item.confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Confirm to update inventory with the extracted quantities.
            </p>
            <button
              type="button"
              onClick={handleApplyUpdates}
              className="rounded-xl bg-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95"
            >
              Update Inventory
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default InvoiceScanner;
