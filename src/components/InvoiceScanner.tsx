import { useCallback, useState } from "react";
import { FileUp } from "lucide-react";
import { ScannedItem } from "../types";

const mockScanResults: ScannedItem[] = [
  { name: "Borosilicate Beaker Set (500ml)", quantity: 12, confidence: 0.92 },
  { name: "Sterile Lab Coats - Medium", quantity: 20, confidence: 0.88 },
  { name: "Nitrile Gloves (Box of 100)", quantity: 40, confidence: 0.9 }
];

const InvoiceScanner = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ScannedItem[]>([]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    setResults([]);

    setTimeout(() => {
      setResults(mockScanResults);
      setIsProcessing(false);
    }, 2000);
  }, [isProcessing]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Mock Invoice Scanner</h2>
          <p className="text-sm text-slate-500">
            Drop an invoice image to simulate AI extraction.
          </p>
        </div>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">
          AI Simulated
        </span>
      </div>
      <div
        className="mt-6 flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <FileUp className="h-8 w-8 text-rose-600" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          Drag & drop invoice images here
        </p>
        <p className="text-xs text-slate-400">
          JPG or PNG. No data is uploaded in mock mode.
        </p>
      </div>
      <div className="mt-6">
        {isProcessing && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Scanning invoice... returning mock results in 2 seconds.
          </div>
        )}
        {!isProcessing && results.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Review Items</h3>
            <div className="mt-3 space-y-3">
              {results.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Quantity: {item.quantity} · Confidence: {Math.round(item.confidence * 100)}%
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-600"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isProcessing && results.length === 0 && (
          <p className="text-sm text-slate-400">
            Drop an invoice image to see mock extraction results.
          </p>
        )}
      </div>
    </section>
  );
};

export default InvoiceScanner;
